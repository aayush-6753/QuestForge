import { AttributeType, QuestCategory, QuestDifficulty } from "@prisma/client";

export const CHARACTER_XP_STEP = 100;
export const ATTRIBUTE_XP_STEP = 50;
export const MAX_STORED_XP = 2_147_483_647;

export const initialProgressionState = {
  level: 1,
  totalXp: 0,
  gold: 0,
  currentStreak: 0,
  longestStreak: 0,
} as const;

export const serverAuthorityInvariants = [
  "XP is server controlled",
  "Gold is server controlled",
  "Levels are server controlled",
  "Streaks are server controlled",
  "Reward prices are server controlled",
] as const;

const difficultyRewards = {
  [QuestDifficulty.EASY]: { characterXp: 10, gold: 5, attributeXp: 10 },
  [QuestDifficulty.MEDIUM]: { characterXp: 25, gold: 10, attributeXp: 25 },
  [QuestDifficulty.HARD]: { characterXp: 50, gold: 20, attributeXp: 50 },
  [QuestDifficulty.EPIC]: { characterXp: 100, gold: 40, attributeXp: 100 },
} as const satisfies Record<QuestDifficulty, { characterXp: number; gold: number; attributeXp: number }>;

const categoryAttributes = {
  [QuestCategory.FITNESS]: AttributeType.STRENGTH,
  [QuestCategory.LEARNING]: AttributeType.INTELLECT,
  [QuestCategory.WORK]: AttributeType.DISCIPLINE,
  [QuestCategory.CREATIVE]: AttributeType.CREATIVITY,
  [QuestCategory.WELLNESS]: AttributeType.VITALITY,
  [QuestCategory.PERSONAL]: AttributeType.DISCIPLINE,
} as const satisfies Record<QuestCategory, AttributeType>;

function assertStoredXp(totalXp: number) {
  if (!Number.isInteger(totalXp) || totalXp < 0 || totalXp > MAX_STORED_XP) {
    throw new RangeError(`XP must be an integer between 0 and ${MAX_STORED_XP}.`);
  }
}

function assertPositiveInteger(value: number, name: string) {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive integer.`);
  }
}

export function xpThresholdForLevel(level: number, step = CHARACTER_XP_STEP) {
  assertPositiveInteger(level, "Level");
  assertPositiveInteger(step, "XP step");

  const threshold = (step * level * (level - 1)) / 2;

  if (!Number.isSafeInteger(threshold)) {
    throw new RangeError("XP threshold exceeds the safe integer range.");
  }

  return threshold;
}

export function levelForXp(totalXp: number, step = CHARACTER_XP_STEP) {
  assertStoredXp(totalXp);
  assertPositiveInteger(step, "XP step");

  return Math.floor((1 + Math.sqrt(1 + (8 * totalXp) / step)) / 2);
}

export function progressionForXp(totalXp: number, step = CHARACTER_XP_STEP) {
  const level = levelForXp(totalXp, step);
  const currentLevelStartXp = xpThresholdForLevel(level, step);
  const nextLevelThreshold = xpThresholdForLevel(level + 1, step);
  const xpWithinLevel = totalXp - currentLevelStartXp;
  const xpRequiredForNextLevel = nextLevelThreshold - currentLevelStartXp;
  const percentage = Math.min(100, Math.max(0, Math.round((xpWithinLevel / xpRequiredForNextLevel) * 10_000) / 100));

  return {
    level,
    currentLevelStartXp,
    nextLevelThreshold,
    xpWithinLevel,
    xpRequiredForNextLevel,
    percentage,
  };
}

export function rewardsForDifficulty(difficulty: QuestDifficulty) {
  return difficultyRewards[difficulty];
}

export function attributeForCategory(category: QuestCategory) {
  return categoryAttributes[category];
}
