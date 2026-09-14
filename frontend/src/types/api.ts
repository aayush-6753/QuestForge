export type AttributeType = "STRENGTH" | "INTELLECT" | "DISCIPLINE" | "CREATIVITY" | "VITALITY";

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
