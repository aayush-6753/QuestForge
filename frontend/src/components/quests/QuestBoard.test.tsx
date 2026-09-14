import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CompleteQuestResponse, Quest } from "../../types/api";
import { QuestBoard } from "./QuestBoard";

const mocks = vi.hoisted(() => ({
  useQuests: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  archive: vi.fn(),
  complete: vi.fn(),
  reset: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("../../hooks/useQuests", () => ({
  useQuests: mocks.useQuests,
  useCreateQuest: () => ({ mutateAsync: mocks.create, reset: mocks.reset, isPending: false, error: null }),
  useUpdateQuest: () => ({ mutateAsync: mocks.update, reset: mocks.reset, isPending: false, error: null }),
  useArchiveQuest: () => ({
    mutateAsync: mocks.archive,
    reset: mocks.reset,
    isPending: false,
    error: null,
    variables: undefined,
  }),
  useCompleteQuest: () => ({
    mutateAsync: mocks.complete,
    reset: mocks.reset,
    isPending: false,
    error: null,
    variables: undefined,
  }),
}));

const quest: Quest = {
  id: "5debf760-d8f8-4077-8b72-e67a1df62ef6",
  userId: "52d2f4c8-f48e-4ccf-a08e-8187cd923bb3",
  title: "Read a chapter",
  description: "Finish the current chapter.",
  category: "LEARNING",
  difficulty: "MEDIUM",
  targetAttribute: "INTELLECT",
  status: "ACTIVE",
  recurrence: "NONE",
  baseXp: 25,
  baseGold: 10,
  dueAt: null,
  completedAt: null,
  createdAt: "2026-09-14T06:00:00.000Z",
  updatedAt: "2026-09-14T06:00:00.000Z",
};

const levelOneProgression = {
  level: 1,
  currentLevelStartXp: 0,
  nextLevelThreshold: 100,
  xpWithinLevel: 0,
  xpRequiredForNextLevel: 100,
  percentage: 0,
};
const completionResult: CompleteQuestResponse = {
  quest: { ...quest, status: "COMPLETED", completedAt: "2026-09-14T06:00:00.000Z" },
  completion: {
    id: "796eb5ac-8b04-4e5d-883a-28f94833bf2b",
    questId: quest.id,
    userId: quest.userId,
    completedAt: "2026-09-14T06:00:00.000Z",
    awardedXp: 100,
    awardedGold: 40,
    attributeType: "INTELLECT",
    awardedAttributeXp: 100,
  },
  rewards: { characterXp: 100, gold: 40, attributeType: "INTELLECT", attributeXp: 100 },
  character: {
    id: "ec78046c-25a4-4f52-a9df-f8b5c43ecbb4",
    userId: quest.userId,
    level: 2,
    totalXp: 100,
    gold: 40,
    currentStreak: 1,
    longestStreak: 1,
    lastActiveDate: "2026-09-14T00:00:00.000Z",
    createdAt: quest.createdAt,
    updatedAt: quest.updatedAt,
  },
  attribute: {
    id: "2a2a22d7-a6d5-43e9-957e-c3759faf577d",
    userId: quest.userId,
    type: "INTELLECT",
    level: 2,
    xp: 100,
    createdAt: quest.createdAt,
    updatedAt: quest.updatedAt,
  },
  progression: {
    character: {
      previousTotalXp: 0,
      currentTotalXp: 100,
      previous: levelOneProgression,
      current: { ...levelOneProgression, level: 2, currentLevelStartXp: 100, nextLevelThreshold: 300 },
      levelsGained: 1,
    },
    attribute: {
      type: "INTELLECT",
      previousXp: 0,
      currentXp: 100,
      previous: { ...levelOneProgression, nextLevelThreshold: 50, xpRequiredForNextLevel: 50 },
      current: {
        ...levelOneProgression,
        level: 2,
        currentLevelStartXp: 50,
        nextLevelThreshold: 150,
        xpWithinLevel: 50,
      },
      levelsGained: 1,
    },
  },
  streak: {
    previous: { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
    current: { currentStreak: 1, longestStreak: 1, lastActiveDate: "2026-09-14T00:00:00.000Z" },
  },
};

describe("QuestBoard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.archive.mockResolvedValue(quest);
    mocks.complete.mockResolvedValue(completionResult);
    mocks.useQuests.mockReturnValue({
      data: [quest],
      isLoading: false,
      isError: false,
      error: null,
      refetch: mocks.refetch,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows server reward snapshots and changes status filters", () => {
    render(<QuestBoard />);

    expect(screen.getByText("Read a chapter")).toBeInTheDocument();
    expect(screen.getByText("25 XP")).toBeInTheDocument();
    expect(screen.getByText("10 gold")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Archived" }));

    expect(mocks.useQuests).toHaveBeenLastCalledWith("ARCHIVED");
  });

  it("archives only after confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<QuestBoard />);

    fireEvent.click(screen.getByRole("button", { name: "Archive" }));

    await waitFor(() => expect(mocks.archive).toHaveBeenCalledWith(quest.id));
  });

  it("completes only after confirmation and shows server reward results", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<QuestBoard />);

    fireEvent.click(screen.getByRole("button", { name: "Complete" }));

    await waitFor(() => expect(mocks.complete).toHaveBeenCalledWith(quest.id));
    expect(screen.getByRole("status")).toHaveTextContent("Quest complete");
    expect(screen.getByText("+100 XP")).toBeInTheDocument();
    expect(screen.getByText("Level up: 1 to 2")).toBeInTheDocument();
  });

  it("opens the create and edit forms", () => {
    render(<QuestBoard />);

    fireEvent.click(screen.getByRole("button", { name: "New quest" }));
    expect(screen.getByRole("heading", { name: "Set your next objective" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByText("Edit quest")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("Read a chapter");
  });
});
