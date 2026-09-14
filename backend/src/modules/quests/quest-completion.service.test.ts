import {
  ActivityEventType,
  AttributeType,
  QuestCategory,
  QuestDifficulty,
  QuestRecurrence,
  QuestStatus,
  type Attribute,
  type Character,
  type Prisma,
  type PrismaClient,
  type Profile,
  type Quest,
  type QuestCompletion,
} from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_STORED_XP } from "../progression/progression.rules.js";
import { ensureUserFoundation } from "../users/me.service.js";
import { completeQuest } from "./quest-completion.service.js";

vi.mock("../users/me.service.js", () => ({ ensureUserFoundation: vi.fn() }));

const userId = "52d2f4c8-f48e-4ccf-a08e-8187cd923bb3";
const questId = "5debf760-d8f8-4077-8b72-e67a1df62ef6";
const completedAt = new Date("2026-09-14T06:00:00.000Z");
const createdAt = new Date("2026-09-01T06:00:00.000Z");
const profile: Profile = {
  id: "b9616bbd-43a6-4fb4-9d18-678dab497ae3",
  userId,
  displayName: null,
  avatarKey: null,
  title: null,
  timezone: "Asia/Kolkata",
  createdAt,
  updatedAt: createdAt,
};
const character: Character = {
  id: "ec78046c-25a4-4f52-a9df-f8b5c43ecbb4",
  userId,
  level: 1,
  totalXp: 0,
  gold: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  createdAt,
  updatedAt: createdAt,
};
const attribute: Attribute = {
  id: "2a2a22d7-a6d5-43e9-957e-c3759faf577d",
  userId,
  type: AttributeType.DISCIPLINE,
  level: 1,
  xp: 0,
  createdAt,
  updatedAt: createdAt,
};
const quest: Quest = {
  id: questId,
  userId,
  title: "Finish the prototype",
  description: null,
  category: QuestCategory.PERSONAL,
  difficulty: QuestDifficulty.EPIC,
  targetAttribute: AttributeType.DISCIPLINE,
  status: QuestStatus.ACTIVE,
  recurrence: QuestRecurrence.NONE,
  baseXp: 100,
  baseGold: 40,
  dueAt: null,
  completedAt: null,
  createdAt,
  updatedAt: createdAt,
};
const completion: QuestCompletion = {
  id: "796eb5ac-8b04-4e5d-883a-28f94833bf2b",
  questId,
  userId,
  completedAt,
  awardedXp: 100,
  awardedGold: 40,
  attributeType: AttributeType.DISCIPLINE,
  awardedAttributeXp: 100,
};

const ensureFoundationMock = vi.mocked(ensureUserFoundation);

function transactionClient(tx: Prisma.TransactionClient) {
  return {
    $transaction: vi.fn(async (callback: (client: Prisma.TransactionClient) => unknown) => callback(tx)),
  } as unknown as PrismaClient;
}

function successfulTransaction() {
  const updatedCharacter = {
    ...character,
    level: 2,
    totalXp: 100,
    gold: 40,
    currentStreak: 1,
    longestStreak: 1,
    lastActiveDate: new Date("2026-09-14T00:00:00.000Z"),
    updatedAt: completedAt,
  };
  const updatedAttribute = { ...attribute, level: 2, xp: 100, updatedAt: completedAt };
  const completedQuest = { ...quest, status: QuestStatus.COMPLETED, completedAt, updatedAt: completedAt };
  const tx = {
    $queryRaw: vi.fn().mockResolvedValue([{ id: "locked" }]),
    character: {
      findUnique: vi.fn().mockResolvedValue(character),
      update: vi.fn().mockResolvedValue(updatedCharacter),
    },
    quest: {
      findFirst: vi.fn().mockResolvedValueOnce(quest).mockResolvedValueOnce(completedQuest),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    attribute: {
      findUnique: vi.fn().mockResolvedValue(attribute),
      update: vi.fn().mockResolvedValue(updatedAttribute),
    },
    questCompletion: { create: vi.fn().mockResolvedValue(completion) },
    activityEvent: { createMany: vi.fn().mockResolvedValue({ count: 3 }) },
  } as unknown as Prisma.TransactionClient;

  return { tx, updatedCharacter, updatedAttribute, completedQuest };
}

describe("completeQuest", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    ensureFoundationMock.mockResolvedValue({ profile, character });
  });

  it("claims the quest and applies every reward in one transaction", async () => {
    const { tx, updatedCharacter, updatedAttribute, completedQuest } = successfulTransaction();

    const result = await completeQuest(transactionClient(tx), userId, questId, completedAt);

    expect(ensureFoundationMock).toHaveBeenCalledWith(tx, userId);
    expect(tx.$queryRaw).toHaveBeenCalledTimes(3);
    expect(tx.quest.updateMany).toHaveBeenCalledWith({
      where: { id: questId, userId, status: QuestStatus.ACTIVE },
      data: { status: QuestStatus.COMPLETED, completedAt },
    });
    expect(tx.character.update).toHaveBeenCalledWith({
      where: { userId },
      data: {
        totalXp: 100,
        level: 2,
        gold: 40,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date("2026-09-14T00:00:00.000Z"),
      },
    });
    expect(tx.attribute.update).toHaveBeenCalledWith({
      where: { userId_type: { userId, type: AttributeType.DISCIPLINE } },
      data: { xp: 100, level: 2 },
    });
    expect(tx.questCompletion.create).toHaveBeenCalledWith({
      data: {
        questId,
        userId,
        completedAt,
        awardedXp: 100,
        awardedGold: 40,
        attributeType: AttributeType.DISCIPLINE,
        awardedAttributeXp: 100,
      },
    });
    expect(tx.activityEvent.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ type: ActivityEventType.QUEST_COMPLETED }),
        expect.objectContaining({ type: ActivityEventType.LEVEL_UP }),
        expect.objectContaining({ type: ActivityEventType.STREAK_UPDATED }),
      ]),
    });
    expect(result).toMatchObject({
      quest: completedQuest,
      character: updatedCharacter,
      attribute: updatedAttribute,
      rewards: { characterXp: 100, gold: 40, attributeType: AttributeType.DISCIPLINE, attributeXp: 100 },
      progression: {
        character: { previousTotalXp: 0, currentTotalXp: 100, levelsGained: 1, current: { level: 2 } },
        attribute: { previousXp: 0, currentXp: 100, levelsGained: 1, current: { level: 2 } },
      },
      streak: { previous: { currentStreak: 0 }, current: { currentStreak: 1 } },
    });
    expect(tx.quest.updateMany.mock.invocationCallOrder[0]).toBeLessThan(tx.character.update.mock.invocationCallOrder[0]);
  });

  it.each([
    [QuestStatus.COMPLETED, "QUEST_ALREADY_COMPLETED"],
    [QuestStatus.ARCHIVED, "QUEST_NOT_ACTIVE"],
  ])("rejects a %s quest", async (status, code) => {
    const tx = {
      $queryRaw: vi.fn().mockResolvedValue([{ id: "locked" }]),
      character: { findUnique: vi.fn().mockResolvedValue(character) },
      quest: { findFirst: vi.fn().mockResolvedValue({ ...quest, status }), updateMany: vi.fn() },
    } as unknown as Prisma.TransactionClient;

    await expect(completeQuest(transactionClient(tx), userId, questId, completedAt)).rejects.toMatchObject({
      statusCode: 409,
      code,
    });
    expect(tx.quest.updateMany).not.toHaveBeenCalled();
  });

  it("returns 404 without revealing a foreign quest", async () => {
    const tx = {
      $queryRaw: vi.fn().mockResolvedValueOnce([{ id: "character" }]).mockResolvedValueOnce([]),
      character: { findUnique: vi.fn().mockResolvedValue(character) },
    } as unknown as Prisma.TransactionClient;

    await expect(completeQuest(transactionClient(tx), userId, questId, completedAt)).rejects.toMatchObject({
      statusCode: 404,
      code: "QUEST_NOT_FOUND",
    });
  });

  it("rejects integer overflow after the claim so the transaction can roll it back", async () => {
    const fullCharacter = { ...character, totalXp: MAX_STORED_XP };
    const tx = {
      $queryRaw: vi.fn().mockResolvedValue([{ id: "locked" }]),
      character: { findUnique: vi.fn().mockResolvedValue(fullCharacter), update: vi.fn() },
      quest: {
        findFirst: vi.fn().mockResolvedValue(quest),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      attribute: { findUnique: vi.fn().mockResolvedValue(attribute), update: vi.fn() },
    } as unknown as Prisma.TransactionClient;

    await expect(completeQuest(transactionClient(tx), userId, questId, completedAt)).rejects.toMatchObject({
      statusCode: 409,
      code: "PROGRESSION_LIMIT_REACHED",
    });
    expect(tx.quest.updateMany).toHaveBeenCalledOnce();
    expect(tx.character.update).not.toHaveBeenCalled();
  });
});
