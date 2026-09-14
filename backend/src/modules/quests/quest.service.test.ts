import {
  ActivityEventType,
  AttributeType,
  QuestCategory,
  QuestDifficulty,
  QuestRecurrence,
  QuestStatus,
  type Prisma,
  type PrismaClient,
  type Quest,
} from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ensureUserFoundation } from "../users/me.service.js";
import { archiveQuest, createQuest, getQuest, listQuests, updateQuest } from "./quest.service.js";

vi.mock("../users/me.service.js", () => ({ ensureUserFoundation: vi.fn() }));

const userId = "52d2f4c8-f48e-4ccf-a08e-8187cd923bb3";
const questId = "5debf760-d8f8-4077-8b72-e67a1df62ef6";
const now = new Date("2026-09-14T06:00:00.000Z");
const quest: Quest = {
  id: questId,
  userId,
  title: "Read a chapter",
  description: null,
  category: QuestCategory.LEARNING,
  difficulty: QuestDifficulty.MEDIUM,
  targetAttribute: AttributeType.INTELLECT,
  status: QuestStatus.ACTIVE,
  recurrence: QuestRecurrence.NONE,
  baseXp: 25,
  baseGold: 10,
  dueAt: null,
  completedAt: null,
  createdAt: now,
  updatedAt: now,
};

const ensureUserFoundationMock = vi.mocked(ensureUserFoundation);

function transactionClient(tx: Prisma.TransactionClient) {
  return {
    $transaction: vi.fn(async (callback: (client: Prisma.TransactionClient) => unknown) => callback(tx)),
  } as unknown as PrismaClient;
}

describe("quest service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("lists quests through a user-scoped predicate", async () => {
    const findMany = vi.fn().mockResolvedValue([quest]);
    const prisma = { quest: { findMany } } as unknown as PrismaClient;

    const result = await listQuests(prisma, userId, QuestStatus.ACTIVE);

    expect(result).toEqual([quest]);
    expect(findMany).toHaveBeenCalledWith({
      where: { userId, status: QuestStatus.ACTIVE },
      orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    });
  });

  it("returns 404 for a missing or foreign-owned quest", async () => {
    const prisma = { quest: { findFirst: vi.fn().mockResolvedValue(null) } } as unknown as PrismaClient;

    await expect(getQuest(prisma, userId, questId)).rejects.toMatchObject({
      statusCode: 404,
      code: "QUEST_NOT_FOUND",
    });
    expect(prisma.quest.findFirst).toHaveBeenCalledWith({ where: { id: questId, userId } });
  });

  it("derives rewards and target attribute while creating the activity event atomically", async () => {
    const tx = {
      quest: { create: vi.fn().mockResolvedValue(quest) },
      activityEvent: { create: vi.fn().mockResolvedValue({}) },
    } as unknown as Prisma.TransactionClient;
    const prisma = transactionClient(tx);

    const result = await createQuest(prisma, userId, {
      title: quest.title,
      category: QuestCategory.LEARNING,
      difficulty: QuestDifficulty.MEDIUM,
    });

    expect(result).toBe(quest);
    expect(ensureUserFoundationMock).toHaveBeenCalledWith(tx, userId);
    expect(tx.quest.create).toHaveBeenCalledWith({
      data: {
        userId,
        title: quest.title,
        description: null,
        category: QuestCategory.LEARNING,
        difficulty: QuestDifficulty.MEDIUM,
        targetAttribute: AttributeType.INTELLECT,
        status: QuestStatus.ACTIVE,
        recurrence: QuestRecurrence.NONE,
        baseXp: 25,
        baseGold: 10,
        dueAt: null,
      },
    });
    expect(tx.activityEvent.create).toHaveBeenCalledWith({
      data: {
        userId,
        type: ActivityEventType.QUEST_CREATED,
        metadata: {
          questId,
          questTitle: quest.title,
          category: QuestCategory.LEARNING,
          difficulty: QuestDifficulty.MEDIUM,
        },
      },
    });
  });

  it("updates active quests and recalculates authoritative fields", async () => {
    const updatedQuest = {
      ...quest,
      category: QuestCategory.FITNESS,
      targetAttribute: AttributeType.STRENGTH,
      difficulty: QuestDifficulty.HARD,
      baseXp: 50,
      baseGold: 20,
    };
    const tx = {
      quest: {
        findFirst: vi.fn().mockResolvedValueOnce(quest).mockResolvedValueOnce(updatedQuest),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    } as unknown as Prisma.TransactionClient;

    const result = await updateQuest(transactionClient(tx), userId, questId, {
      category: QuestCategory.FITNESS,
      difficulty: QuestDifficulty.HARD,
    });

    expect(result).toEqual(updatedQuest);
    expect(tx.quest.updateMany).toHaveBeenCalledWith({
      where: { id: questId, userId, status: QuestStatus.ACTIVE },
      data: {
        category: QuestCategory.FITNESS,
        targetAttribute: AttributeType.STRENGTH,
        difficulty: QuestDifficulty.HARD,
        baseXp: 50,
        baseGold: 20,
      },
    });
  });

  it("rejects updates to non-active quests", async () => {
    const tx = {
      quest: {
        findFirst: vi.fn().mockResolvedValue({ ...quest, status: QuestStatus.ARCHIVED }),
        updateMany: vi.fn(),
      },
    } as unknown as Prisma.TransactionClient;

    await expect(updateQuest(transactionClient(tx), userId, questId, { title: "Nope" })).rejects.toMatchObject({
      statusCode: 409,
      code: "QUEST_NOT_ACTIVE",
    });
    expect(tx.quest.updateMany).not.toHaveBeenCalled();
  });

  it("archives an active quest and records the event atomically", async () => {
    const archivedQuest = { ...quest, status: QuestStatus.ARCHIVED };
    const tx = {
      quest: {
        findFirst: vi.fn().mockResolvedValueOnce(quest).mockResolvedValueOnce(archivedQuest),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      activityEvent: { create: vi.fn().mockResolvedValue({}) },
    } as unknown as Prisma.TransactionClient;

    const result = await archiveQuest(transactionClient(tx), userId, questId);

    expect(result).toEqual(archivedQuest);
    expect(tx.quest.updateMany).toHaveBeenCalledWith({
      where: { id: questId, userId, status: QuestStatus.ACTIVE },
      data: { status: QuestStatus.ARCHIVED },
    });
    expect(tx.activityEvent.create).toHaveBeenCalledWith({
      data: { userId, type: ActivityEventType.QUEST_ARCHIVED, metadata: { questId, questTitle: quest.title } },
    });
  });
});
