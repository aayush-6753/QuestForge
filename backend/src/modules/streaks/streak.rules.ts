export type StreakState = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
};

export function isValidTimezone(timezone: string) {
  if (!timezone.trim()) return false;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function localDateForInstant(instant: Date, timezone: string) {
  if (Number.isNaN(instant.getTime())) throw new RangeError("Instant must be a valid date.");
  if (!isValidTimezone(timezone)) throw new RangeError("Timezone must be a valid IANA timezone.");

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;

  return `${value("year")}-${value("month")}-${value("day")}`;
}

function dateOnlyKey(date: Date) {
  if (Number.isNaN(date.getTime())) throw new RangeError("Last active date must be valid.");
  return date.toISOString().slice(0, 10);
}

function dateOnlyFromKey(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function calendarDay(value: string) {
  return Date.parse(`${value}T00:00:00.000Z`) / 86_400_000;
}

export function advanceStreak(state: StreakState, timezone: string, now: Date): StreakState {
  if (
    !Number.isInteger(state.currentStreak) ||
    !Number.isInteger(state.longestStreak) ||
    state.currentStreak < 0 ||
    state.longestStreak < state.currentStreak
  ) {
    throw new RangeError("Streak state is invalid.");
  }

  const activeDate = localDateForInstant(now, timezone);

  if (!state.lastActiveDate) {
    return { currentStreak: 1, longestStreak: Math.max(1, state.longestStreak), lastActiveDate: dateOnlyFromKey(activeDate) };
  }

  const previousDate = dateOnlyKey(state.lastActiveDate);
  const elapsedDays = calendarDay(activeDate) - calendarDay(previousDate);

  if (elapsedDays <= 0) return { ...state };

  const currentStreak = elapsedDays === 1 ? state.currentStreak + 1 : 1;

  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, state.longestStreak),
    lastActiveDate: dateOnlyFromKey(activeDate),
  };
}
