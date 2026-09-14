import { AttributeType, QuestCategory, QuestDifficulty } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  ATTRIBUTE_XP_STEP,
  attributeForCategory,
  initialProgressionState,
  levelForXp,
  progressionForXp,
  rewardsForDifficulty,
  serverAuthorityInvariants,
  xpThresholdForLevel,
} from "./progression.rules.js";

describe("progression foundation", () => {
  it("starts new characters from a neutral server-owned progression state", () => {
    expect(initialProgressionState).toEqual({
      level: 1,
      totalXp: 0,
      gold: 0,
      currentStreak: 0,
      longestStreak: 0,
    });
  });

  it("documents progression authority boundaries", () => {
    expect(serverAuthorityInvariants).toContain("XP is server controlled");
    expect(serverAuthorityInvariants).toContain("Gold is server controlled");
  });

  it.each([
    [1, 0],
    [2, 100],
    [3, 300],
    [4, 600],
    [5, 1000],
  ])("sets character level %i threshold to %i XP", (level, threshold) => {
    expect(xpThresholdForLevel(level)).toBe(threshold);
  });

  it.each([
    [1, 0],
    [2, 50],
    [3, 150],
    [4, 300],
  ])("sets attribute level %i threshold to %i XP", (level, threshold) => {
    expect(xpThresholdForLevel(level, ATTRIBUTE_XP_STEP)).toBe(threshold);
  });

  it.each([
    [0, 1],
    [99, 1],
    [100, 2],
    [299, 2],
    [300, 3],
    [999, 4],
    [1000, 5],
  ])("maps %i total XP to level %i", (totalXp, level) => {
    expect(levelForXp(totalXp)).toBe(level);
  });

  it("summarizes progress within the current nonlinear level", () => {
    expect(progressionForXp(450)).toEqual({
      level: 3,
      currentLevelStartXp: 300,
      nextLevelThreshold: 600,
      xpWithinLevel: 150,
      xpRequiredForNextLevel: 300,
      percentage: 50,
    });
  });

  it.each([-1, 1.5, Number.POSITIVE_INFINITY, 2_147_483_648])("rejects invalid stored XP: %s", (totalXp) => {
    expect(() => progressionForXp(totalXp)).toThrow(RangeError);
  });

  it.each([
    [QuestDifficulty.EASY, { characterXp: 10, gold: 5, attributeXp: 10 }],
    [QuestDifficulty.MEDIUM, { characterXp: 25, gold: 10, attributeXp: 25 }],
    [QuestDifficulty.HARD, { characterXp: 50, gold: 20, attributeXp: 50 }],
    [QuestDifficulty.EPIC, { characterXp: 100, gold: 40, attributeXp: 100 }],
  ])("maps %s difficulty to server-owned rewards", (difficulty, rewards) => {
    expect(rewardsForDifficulty(difficulty)).toEqual(rewards);
  });

  it.each([
    [QuestCategory.FITNESS, AttributeType.STRENGTH],
    [QuestCategory.LEARNING, AttributeType.INTELLECT],
    [QuestCategory.WORK, AttributeType.DISCIPLINE],
    [QuestCategory.CREATIVE, AttributeType.CREATIVITY],
    [QuestCategory.WELLNESS, AttributeType.VITALITY],
    [QuestCategory.PERSONAL, AttributeType.DISCIPLINE],
  ])("maps %s quests to %s", (category, attribute) => {
    expect(attributeForCategory(category)).toBe(attribute);
  });
});
