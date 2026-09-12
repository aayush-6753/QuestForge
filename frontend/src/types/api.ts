export type AttributeType = "STRENGTH" | "INTELLECT" | "DISCIPLINE" | "CREATIVITY" | "VITALITY";

export type Profile = {
  id: string;
  userId: string;
  displayName: string | null;
  timezone: string | null;
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
  xp: number;
  createdAt: string;
  updatedAt: string;
};

export type MeResponse = {
  profile: Profile;
  character: Character;
  attributes: CharacterAttribute[];
};
