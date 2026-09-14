import {
  ActivityEventType,
  Prisma,
  QuestStatus,
  type Attribute,
  type Character,
  type PrismaClient,
  type Quest,
  type QuestCompletion,
} from "@prisma/client";
import { ApiError } from "../../utils/api-error.js";
import {
  ATTRIBUTE_XP_STEP,
  MAX_STORED_XP,
  progressionForXp,
  rewardsForDifficulty,
} from "../progression/progression.rules.js";
import { advanceStreak } from "../streaks/streak.rules.js";
import { ensureUserFoundation } from "../users/me.service.js";

function completionConflict(message = "Quest has already been completed.") {
  return new ApiError(409, "QUEST_ALREADY_COMPLETED", message);
}

function addStoredInteger(current: number, award: number, field: string) {
  const next = current + award;

  if (!Number.isSafeInteger(next) || next > MAX_STORED_XP) {
    throw new ApiError(409, "PROGRESSION_LIMIT_REACHED", `${field} cannot accept more rewards.`);
  }

  return next;
}

export async function completeQuest(prisma: PrismaClient, userId: string, questId: string, now = new Date()) {
  try {
    return await prisma.$transaction(async (tx) => {
      const { profile } = await ensureUserFoundation(tx, userId);

      const characterLock = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "characters"
        WHERE "user_id" = ${userId}::uuid
        FOR UPDATE
      `;
      if (characterLock.length !== 1) throw new ApiError(500, "FOUNDATION_ERROR", "Character foundation is missing.");

      const character = await tx.character.findUnique({ where: { userId } });
      if (!character) throw new ApiError(500, "FOUNDATION_ERROR", "Character foundation is missing.");

      const questLock = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "quests"
        WHERE "id" = ${questId}::uuid AND "user_id" = ${userId}::uuid
        FOR UPDATE
      `;
      if (questLock.length !== 1) throw new ApiError(404, "QUEST_NOT_FOUND", "Quest not found.");

      const quest = await tx.quest.findFirst({ where: { id: questId, userId } });
      if (!quest) throw new ApiError(404, "QUEST_NOT_FOUND", "Quest not found.");
      if (quest.status === QuestStatus.COMPLETED) throw completionConflict();
      if (quest.status !== QuestStatus.ACTIVE) {
        throw new ApiError(409, "QUEST_NOT_ACTIVE", "Only active quests can be completed.");
      }

      const claimed = await tx.quest.updateMany({
        where: { id: questId, userId, status: QuestStatus.ACTIVE },
        data: { status: QuestStatus.COMPLETED, completedAt: now },
      });
      if (claimed.count !== 1) throw completionConflict();

      const attributeReference = await tx.attribute.findUnique({
        where: { userId_type: { userId, type: quest.targetAttribute } },
        select: { id: true },
      });
      if (!attributeReference) throw new ApiError(500, "FOUNDATION_ERROR", "Character attribute is missing.");

      const attributeLock = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "attributes"
        WHERE "id" = ${attributeReference.id}::uuid
        FOR UPDATE
      `;
      if (attributeLock.length !== 1) throw new ApiError(500, "FOUNDATION_ERROR", "Character attribute is missing.");

      const attribute = await tx.attribute.findUnique({
        where: { userId_type: { userId, type: quest.targetAttribute } },
      });
      if (!attribute) throw new ApiError(500, "FOUNDATION_ERROR", "Character attribute is missing.");

      const attributeAward = rewardsForDifficulty(quest.difficulty).attributeXp;
      const nextTotalXp = addStoredInteger(character.totalXp, quest.baseXp, "Character XP");
      const nextGold = addStoredInteger(character.gold, quest.baseGold, "Gold");
      const nextAttributeXp = addStoredInteger(attribute.xp, attributeAward, "Attribute XP");
      const previousCharacterProgression = progressionForXp(character.totalXp);
      const currentCharacterProgression = progressionForXp(nextTotalXp);
      const previousAttributeProgression = progressionForXp(attribute.xp, ATTRIBUTE_XP_STEP);
      const currentAttributeProgression = progressionForXp(nextAttributeXp, ATTRIBUTE_XP_STEP);
      const previousStreak = {
        currentStreak: character.currentStreak,
        longestStreak: character.longestStreak,
        lastActiveDate: character.lastActiveDate,
      };
      const currentStreak = advanceStreak(previousStreak, profile.timezone, now);

      const updatedCharacter = await tx.character.update({
        where: { userId },
        data: {
          totalXp: nextTotalXp,
          level: currentCharacterProgression.level,
          gold: nextGold,
          ...currentStreak,
        },
      });
      const updatedAttribute = await tx.attribute.update({
        where: { userId_type: { userId, type: quest.targetAttribute } },
        data: { xp: nextAttributeXp, level: currentAttributeProgression.level },
      });
      const completion = await tx.questCompletion.create({
        data: {
          questId,
          userId,
          completedAt: now,
          awardedXp: quest.baseXp,
          awardedGold: quest.baseGold,
          attributeType: quest.targetAttribute,
          awardedAttributeXp: attributeAward,
        },
      });

      const events: Prisma.ActivityEventCreateManyInput[] = [
        {
          userId,
          type: ActivityEventType.QUEST_COMPLETED,
          metadata: {
            questId,
            awardedXp: quest.baseXp,
            awardedGold: quest.baseGold,
            attributeType: quest.targetAttribute,
            awardedAttributeXp: attributeAward,
          },
          createdAt: now,
        },
      ];

      if (currentCharacterProgression.level > previousCharacterProgression.level) {
        events.push({
          userId,
          type: ActivityEventType.LEVEL_UP,
          metadata: {
            questId,
            previousLevel: previousCharacterProgression.level,
            currentLevel: currentCharacterProgression.level,
          },
          createdAt: now,
        });
      }

      if (currentStreak.lastActiveDate?.getTime() !== previousStreak.lastActiveDate?.getTime()) {
        events.push({
          userId,
          type: ActivityEventType.STREAK_UPDATED,
          metadata: {
            questId,
            previousStreak: previousStreak.currentStreak,
            currentStreak: currentStreak.currentStreak,
          },
          createdAt: now,
        });
      }

      await tx.activityEvent.createMany({ data: events });

      const completedQuest = await tx.quest.findFirst({ where: { id: questId, userId } });
      if (!completedQuest) throw new ApiError(500, "COMPLETION_ERROR", "Completed quest could not be loaded.");

      return completionResponse({
        quest: completedQuest,
        completion,
        character,
        updatedCharacter,
        attribute,
        updatedAttribute,
        previousCharacterProgression,
        currentCharacterProgression,
        previousAttributeProgression,
        currentAttributeProgression,
        previousStreak,
        currentStreak,
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw completionConflict();
    }

    throw error;
  }
}

function completionResponse({
  quest,
  completion,
  character,
  updatedCharacter,
  attribute,
  updatedAttribute,
  previousCharacterProgression,
  currentCharacterProgression,
  previousAttributeProgression,
  currentAttributeProgression,
  previousStreak,
  currentStreak,
}: {
  quest: Quest;
  completion: QuestCompletion;
  character: Character;
  updatedCharacter: Character;
  attribute: Attribute;
  updatedAttribute: Attribute;
  previousCharacterProgression: ReturnType<typeof progressionForXp>;
  currentCharacterProgression: ReturnType<typeof progressionForXp>;
  previousAttributeProgression: ReturnType<typeof progressionForXp>;
  currentAttributeProgression: ReturnType<typeof progressionForXp>;
  previousStreak: { currentStreak: number; longestStreak: number; lastActiveDate: Date | null };
  currentStreak: { currentStreak: number; longestStreak: number; lastActiveDate: Date | null };
}) {
  return {
    quest,
    completion,
    rewards: {
      characterXp: completion.awardedXp,
      gold: completion.awardedGold,
      attributeType: completion.attributeType,
      attributeXp: completion.awardedAttributeXp,
    },
    character: updatedCharacter,
    attribute: updatedAttribute,
    progression: {
      character: {
        previousTotalXp: character.totalXp,
        currentTotalXp: updatedCharacter.totalXp,
        previous: previousCharacterProgression,
        current: currentCharacterProgression,
        levelsGained: currentCharacterProgression.level - previousCharacterProgression.level,
      },
      attribute: {
        type: attribute.type,
        previousXp: attribute.xp,
        currentXp: updatedAttribute.xp,
        previous: previousAttributeProgression,
        current: currentAttributeProgression,
        levelsGained: currentAttributeProgression.level - previousAttributeProgression.level,
      },
    },
    streak: { previous: previousStreak, current: currentStreak },
  };
}
