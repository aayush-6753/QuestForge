import { describe, expect, it } from "vitest";
import { advanceStreak, isValidTimezone, localDateForInstant } from "./streak.rules.js";

const dateOnly = (value: string) => new Date(`${value}T00:00:00.000Z`);

describe("streak rules", () => {
  it("starts the first qualifying completion at one", () => {
    expect(
      advanceStreak(
        { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
        "Asia/Kolkata",
        new Date("2026-09-14T20:00:00.000Z"),
      ),
    ).toEqual({ currentStreak: 1, longestStreak: 1, lastActiveDate: dateOnly("2026-09-15") });
  });

  it("does not increment twice on the same local day", () => {
    const state = { currentStreak: 4, longestStreak: 7, lastActiveDate: dateOnly("2026-09-15") };

    expect(advanceStreak(state, "Asia/Kolkata", new Date("2026-09-15T12:00:00.000Z"))).toEqual(state);
  });

  it("increments on the next local calendar day across DST", () => {
    expect(
      advanceStreak(
        { currentStreak: 2, longestStreak: 2, lastActiveDate: dateOnly("2026-03-07") },
        "America/New_York",
        new Date("2026-03-08T05:30:00.000Z"),
      ),
    ).toEqual({ currentStreak: 3, longestStreak: 3, lastActiveDate: dateOnly("2026-03-08") });
  });

  it("resets after a missed local calendar day", () => {
    expect(
      advanceStreak(
        { currentStreak: 5, longestStreak: 8, lastActiveDate: dateOnly("2026-09-10") },
        "UTC",
        new Date("2026-09-14T09:00:00.000Z"),
      ),
    ).toEqual({ currentStreak: 1, longestStreak: 8, lastActiveDate: dateOnly("2026-09-14") });
  });

  it("uses the current timezone without rewriting the stored calendar date", () => {
    const state = { currentStreak: 3, longestStreak: 5, lastActiveDate: dateOnly("2026-01-01") };
    const now = new Date("2026-01-02T00:30:00.000Z");

    expect(advanceStreak(state, "America/Los_Angeles", now)).toEqual(state);
    expect(advanceStreak(state, "UTC", now).currentStreak).toBe(4);
  });

  it("does not move streak state backward for a future last-active date", () => {
    const state = { currentStreak: 3, longestStreak: 5, lastActiveDate: dateOnly("2026-09-16") };

    expect(advanceStreak(state, "UTC", new Date("2026-09-15T12:00:00.000Z"))).toEqual(state);
  });

  it("validates IANA timezones and local date boundaries", () => {
    expect(isValidTimezone("Asia/Kolkata")).toBe(true);
    expect(isValidTimezone("Not/A_Timezone")).toBe(false);
    expect(localDateForInstant(new Date("2026-01-02T00:30:00.000Z"), "America/Los_Angeles")).toBe("2026-01-01");
    expect(() => localDateForInstant(new Date(), "Not/A_Timezone")).toThrow(RangeError);
  });
});
