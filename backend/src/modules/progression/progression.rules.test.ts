import { describe, expect, it } from "vitest";
import { initialProgressionState, serverAuthorityInvariants } from "./progression.rules.js";

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
});
