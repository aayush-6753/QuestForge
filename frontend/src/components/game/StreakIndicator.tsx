import { Flame } from "lucide-react";

export function StreakIndicator({ current, longest }: { current: number; longest: number }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-ruby/25 bg-ruby/10 px-3 py-2 text-ruby">
      <Flame className="h-5 w-5" aria-hidden="true" />
      <span className="font-bold">{current}</span>
      <span className="text-sm text-parchment/70">day streak</span>
      <span className="sr-only">Longest streak: {longest} days</span>
    </div>
  );
}
