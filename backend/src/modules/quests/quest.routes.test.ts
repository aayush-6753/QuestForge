import { AttributeType, QuestCategory, QuestDifficulty, QuestRecurrence, QuestStatus, type Quest } from "@prisma/client";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../app.js";
import { supabase } from "../../lib/supabase.js";
import { completeQuest } from "./quest-completion.service.js";
import { archiveQuest, createQuest, getQuest, listQuests, updateQuest } from "./quest.service.js";

vi.mock("../../lib/supabase.js", () => ({
  supabase: { auth: { getUser: vi.fn() } },
}));

vi.mock("./quest.service.js", () => ({
  archiveQuest: vi.fn(),
  createQuest: vi.fn(),
  getQuest: vi.fn(),
  listQuests: vi.fn(),
  updateQuest: vi.fn(),
}));

vi.mock("./quest-completion.service.js", () => ({ completeQuest: vi.fn() }));

const userId = "52d2f4c8-f48e-4ccf-a08e-8187cd923bb3";
const questId = "5debf760-d8f8-4077-8b72-e67a1df62ef6";
const authorization = { Authorization: "Bearer valid-token" };
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

const getUserMock = vi.mocked(supabase.auth.getUser);
const archiveQuestMock = vi.mocked(archiveQuest);
const createQuestMock = vi.mocked(createQuest);
const getQuestMock = vi.mocked(getQuest);
const listQuestsMock = vi.mocked(listQuests);
const updateQuestMock = vi.mocked(updateQuest);
const completeQuestMock = vi.mocked(completeQuest);

describe("quest routes", () => {
  const app = createApp();

  beforeEach(() => {
    vi.resetAllMocks();
    getUserMock.mockResolvedValue({
      data: { user: { id: userId, email: "hero@example.com" } },
      error: null,
    });
    archiveQuestMock.mockResolvedValue({ ...quest, status: QuestStatus.ARCHIVED });
    createQuestMock.mockResolvedValue(quest);
    getQuestMock.mockResolvedValue(quest);
    listQuestsMock.mockResolvedValue([quest]);
    updateQuestMock.mockResolvedValue(quest);
    completeQuestMock.mockResolvedValue({
      quest: { ...quest, status: QuestStatus.COMPLETED, completedAt: now },
      completion: {
        id: "796eb5ac-8b04-4e5d-883a-28f94833bf2b",
        questId,
        userId,
        completedAt: now,
        awardedXp: 25,
        awardedGold: 10,
        attributeType: AttributeType.INTELLECT,
        awardedAttributeXp: 25,
      },
      rewards: { characterXp: 25, gold: 10, attributeType: AttributeType.INTELLECT, attributeXp: 25 },
      character: {
        id: "ec78046c-25a4-4f52-a9df-f8b5c43ecbb4",
        userId,
        level: 1,
        totalXp: 25,
        gold: 10,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: now,
        createdAt: now,
        updatedAt: now,
      },
      attribute: {
        id: "2a2a22d7-a6d5-43e9-957e-c3759faf577d",
        userId,
        type: AttributeType.INTELLECT,
        level: 1,
        xp: 25,
        createdAt: now,
        updatedAt: now,
      },
      progression: {
        character: {
          previousTotalXp: 0,
          currentTotalXp: 25,
          previous: {
            level: 1,
            currentLevelStartXp: 0,
            nextLevelThreshold: 100,
            xpWithinLevel: 0,
            xpRequiredForNextLevel: 100,
            percentage: 0,
          },
          current: {
            level: 1,
            currentLevelStartXp: 0,
            nextLevelThreshold: 100,
            xpWithinLevel: 25,
            xpRequiredForNextLevel: 100,
            percentage: 25,
          },
          levelsGained: 0,
        },
        attribute: {
          type: AttributeType.INTELLECT,
          previousXp: 0,
          currentXp: 25,
          previous: {
            level: 1,
            currentLevelStartXp: 0,
            nextLevelThreshold: 50,
            xpWithinLevel: 0,
            xpRequiredForNextLevel: 50,
            percentage: 0,
          },
          current: {
            level: 1,
            currentLevelStartXp: 0,
            nextLevelThreshold: 50,
            xpWithinLevel: 25,
            xpRequiredForNextLevel: 50,
            percentage: 50,
          },
          levelsGained: 0,
        },
      },
      streak: {
        previous: { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
        current: { currentStreak: 1, longestStreak: 1, lastActiveDate: now },
      },
    });
  });

  it("lists only the requested status for the authenticated user", async () => {
    const response = await request(app).get("/api/v1/quests?status=ACTIVE").set(authorization);

    expect(response.status).toBe(200);
    expect(listQuestsMock).toHaveBeenCalledWith(expect.anything(), userId, QuestStatus.ACTIVE);
    expect(response.body.data).toHaveLength(1);
  });

  it("creates a validated one-time quest", async () => {
    const response = await request(app).post("/api/v1/quests").set(authorization).send({
      title: "  Read a chapter  ",
      description: null,
      category: "LEARNING",
      difficulty: "MEDIUM",
      dueAt: "2099-09-15T12:00:00.000Z",
    });

    expect(response.status).toBe(201);
    expect(createQuestMock).toHaveBeenCalledWith(expect.anything(), userId, {
      title: "Read a chapter",
      description: null,
      category: QuestCategory.LEARNING,
      difficulty: QuestDifficulty.MEDIUM,
      dueAt: new Date("2099-09-15T12:00:00.000Z"),
    });
  });

  it.each([
    [{ title: "Quest", category: "PERSONAL", difficulty: "EASY", baseXp: 999 }, "authoritative field"],
    [{ title: "Quest", category: "PERSONAL", difficulty: "EASY", dueAt: "2020-01-01T00:00:00.000Z" }, "past due date"],
    [{ title: "Quest", category: "PERSONAL", difficulty: "EASY", dueAt: "tomorrow" }, "malformed due date"],
    [{ title: "Quest", category: "UNKNOWN", difficulty: "EASY" }, "invalid category"],
    [{ title: "Quest", category: "PERSONAL", difficulty: "UNKNOWN" }, "invalid difficulty"],
    [{ title: " ", category: "PERSONAL", difficulty: "EASY" }, "blank title"],
    [{ title: "x".repeat(121), category: "PERSONAL", difficulty: "EASY" }, "overlong title"],
  ])("rejects an invalid create payload with a %s (%s)", async (body) => {
    const response = await request(app).post("/api/v1/quests").set(authorization).send(body);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(createQuestMock).not.toHaveBeenCalled();
  });

  it("gets one owned quest", async () => {
    const response = await request(app).get(`/api/v1/quests/${questId}`).set(authorization);

    expect(response.status).toBe(200);
    expect(getQuestMock).toHaveBeenCalledWith(expect.anything(), userId, questId);
  });

  it("completes an owned quest without accepting reward input", async () => {
    const response = await request(app).post(`/api/v1/quests/${questId}/complete`).set(authorization);

    expect(response.status).toBe(200);
    expect(response.body.data.rewards).toEqual({
      characterXp: 25,
      gold: 10,
      attributeType: "INTELLECT",
      attributeXp: 25,
    });
    expect(completeQuestMock).toHaveBeenCalledWith(expect.anything(), userId, questId);
  });

  it("rejects completion reward fields", async () => {
    const response = await request(app)
      .post(`/api/v1/quests/${questId}/complete`)
      .set(authorization)
      .send({ awardedXp: 10_000 });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(completeQuestMock).not.toHaveBeenCalled();
  });

  it("updates only editable quest fields", async () => {
    const response = await request(app)
      .patch(`/api/v1/quests/${questId}`)
      .set(authorization)
      .send({ title: "  Updated quest  ", difficulty: "HARD" });

    expect(response.status).toBe(200);
    expect(updateQuestMock).toHaveBeenCalledWith(expect.anything(), userId, questId, {
      title: "Updated quest",
      difficulty: QuestDifficulty.HARD,
    });
  });

  it.each([
    [{}, "empty payload"],
    [{ status: "COMPLETED" }, "status mutation"],
    [{ userId }, "ownership mutation"],
  ])("rejects an invalid update payload with a %s (%s)", async (body) => {
    const response = await request(app).patch(`/api/v1/quests/${questId}`).set(authorization).send(body);

    expect(response.status).toBe(400);
    expect(updateQuestMock).not.toHaveBeenCalled();
  });

  it("archives an owned quest", async () => {
    const response = await request(app).delete(`/api/v1/quests/${questId}`).set(authorization);

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("ARCHIVED");
    expect(archiveQuestMock).toHaveBeenCalledWith(expect.anything(), userId, questId);
  });

  it("rejects malformed quest IDs before calling the service", async () => {
    const response = await request(app).get("/api/v1/quests/not-a-uuid").set(authorization);

    expect(response.status).toBe(400);
    expect(getQuestMock).not.toHaveBeenCalled();
  });
});
