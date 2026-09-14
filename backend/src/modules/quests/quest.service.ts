import {
  ActivityEventType,
  QuestRecurrence,
  QuestStatus,
  type Prisma,
  type PrismaClient,
  type QuestCategory,
  type QuestDifficulty,
} from "@prisma/client";
import { ApiError } from "../../utils/api-error.js";
import { attributeForCategory, rewardsForDifficulty } from "../progression/progression.rules.js";
import { ensureUserFoundation } from "../users/me.service.js";

export type CreateQuestInput = {
  title: string;
  description?: string | null;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  dueAt?: Date | null;
};

export type UpdateQuestInput = Partial<CreateQuestInput>;

function questNotFound() {
  return new ApiError(404, "QUEST_NOT_FOUND", "Quest not found.");
}

function questNotActive() {
  return new ApiError(409, "QUEST_NOT_ACTIVE", "Only active quests can be changed.");
}

export async function listQuests(prisma: PrismaClient, userId: string, status?: QuestStatus) {
  return prisma.quest.findMany({
    where: { userId, ...(status ? { status } : {}) },
    orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
  });
}

export async function getQuest(prisma: PrismaClient, userId: string, questId: string) {
  const quest = await prisma.quest.findFirst({ where: { id: questId, userId } });

  if (!quest) throw questNotFound();

  return quest;
}

export async function createQuest(prisma: PrismaClient, userId: string, input: CreateQuestInput) {
  return prisma.$transaction(async (tx) => {
    await ensureUserFoundation(tx, userId);

    const rewards = rewardsForDifficulty(input.difficulty);
    const quest = await tx.quest.create({
      data: {
        userId,
        title: input.title,
        description: input.description ?? null,
        category: input.category,
        difficulty: input.difficulty,
        targetAttribute: attributeForCategory(input.category),
        status: QuestStatus.ACTIVE,
        recurrence: QuestRecurrence.NONE,
        baseXp: rewards.characterXp,
        baseGold: rewards.gold,
        dueAt: input.dueAt ?? null,
      },
    });

    await tx.activityEvent.create({
      data: {
        userId,
        type: ActivityEventType.QUEST_CREATED,
        metadata: { questId: quest.id, category: quest.category, difficulty: quest.difficulty },
      },
    });

    return quest;
  });
}

export async function updateQuest(prisma: PrismaClient, userId: string, questId: string, input: UpdateQuestInput) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.quest.findFirst({ where: { id: questId, userId } });

    if (!current) throw questNotFound();
    if (current.status !== QuestStatus.ACTIVE) throw questNotActive();

    if (
      input.dueAt &&
      input.dueAt.getTime() <= Date.now() &&
      input.dueAt.getTime() !== current.dueAt?.getTime()
    ) {
      throw new ApiError(400, "VALIDATION_ERROR", "Quest due date must be in the future.");
    }

    const data: Prisma.QuestUpdateManyMutationInput = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.dueAt !== undefined) data.dueAt = input.dueAt;
    if (input.category !== undefined) {
      data.category = input.category;
      data.targetAttribute = attributeForCategory(input.category);
    }
    if (input.difficulty !== undefined) {
      const rewards = rewardsForDifficulty(input.difficulty);
      data.difficulty = input.difficulty;
      data.baseXp = rewards.characterXp;
      data.baseGold = rewards.gold;
    }

    const updated = await tx.quest.updateMany({
      where: { id: questId, userId, status: QuestStatus.ACTIVE },
      data,
    });

    if (updated.count !== 1) throw questNotActive();

    const quest = await tx.quest.findFirst({ where: { id: questId, userId } });
    if (!quest) throw questNotFound();

    return quest;
  });
}

export async function archiveQuest(prisma: PrismaClient, userId: string, questId: string) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.quest.findFirst({ where: { id: questId, userId } });

    if (!current) throw questNotFound();
    if (current.status !== QuestStatus.ACTIVE) throw questNotActive();

    const archived = await tx.quest.updateMany({
      where: { id: questId, userId, status: QuestStatus.ACTIVE },
      data: { status: QuestStatus.ARCHIVED },
    });

    if (archived.count !== 1) throw questNotActive();

    const quest = await tx.quest.findFirst({ where: { id: questId, userId } });
    if (!quest) throw questNotFound();

    await tx.activityEvent.create({
      data: {
        userId,
        type: ActivityEventType.QUEST_ARCHIVED,
        metadata: { questId },
      },
    });

    return quest;
  });
}
