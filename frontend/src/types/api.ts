export type AttributeType = "STRENGTH" | "INTELLECT" | "DISCIPLINE" | "CREATIVITY" | "VITALITY";

export const QUEST_CATEGORIES = ["FITNESS", "LEARNING", "WORK", "CREATIVE", "WELLNESS", "PERSONAL"] as const;
export const QUEST_DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "EPIC"] as const;
export const QUEST_STATUSES = ["ACTIVE", "COMPLETED", "ARCHIVED"] as const;

export type QuestCategory = (typeof QUEST_CATEGORIES)[number];
export type QuestDifficulty = (typeof QUEST_DIFFICULTIES)[number];
export type QuestStatus = (typeof QUEST_STATUSES)[number];

export type Profile = {
  id: string;
  userId: string;
  displayName: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export type Character = {
  id: string;
  userId: string;
  level: number;
  totalXp: number;
  gold: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CharacterAttribute = {
  id: string;
  userId: string;
  type: AttributeType;
  level: number;
  xp: number;
  createdAt: string;
  updatedAt: string;
};

export type ProgressionSummary = {
  level: number;
  currentLevelStartXp: number;
  nextLevelThreshold: number;
  xpWithinLevel: number;
  xpRequiredForNextLevel: number;
  percentage: number;
};

export type MeResponse = {
  profile: Profile;
  character: Character;
  attributes: CharacterAttribute[];
  progression: {
    character: ProgressionSummary;
    attributes: Array<ProgressionSummary & { type: AttributeType }>;
  };
};

export type UpdateProfileInput = {
  displayName?: string | null;
  timezone?: string;
};

export type Quest = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  targetAttribute: AttributeType;
  status: QuestStatus;
  recurrence: "NONE";
  baseXp: number;
  baseGold: number;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SaveQuestInput = {
  title: string;
  description?: string | null;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  dueAt?: string | null;
};

export type QuestCompletion = {
  id: string;
  questId: string;
  userId: string;
  completedAt: string;
  awardedXp: number;
  awardedGold: number;
  attributeType: AttributeType;
  awardedAttributeXp: number;
};

export type CompleteQuestResponse = {
  quest: Quest;
  completion: QuestCompletion;
  rewards: {
    characterXp: number;
    gold: number;
    attributeType: AttributeType;
    attributeXp: number;
  };
  character: Character;
  attribute: CharacterAttribute;
  progression: {
    character: {
      previousTotalXp: number;
      currentTotalXp: number;
      previous: ProgressionSummary;
      current: ProgressionSummary;
      levelsGained: number;
    };
    attribute: {
      type: AttributeType;
      previousXp: number;
      currentXp: number;
      previous: ProgressionSummary;
      current: ProgressionSummary;
      levelsGained: number;
    };
  };
  streak: {
    previous: Pick<Character, "currentStreak" | "longestStreak" | "lastActiveDate">;
    current: Pick<Character, "currentStreak" | "longestStreak" | "lastActiveDate">;
  };
};
