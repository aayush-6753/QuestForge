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
