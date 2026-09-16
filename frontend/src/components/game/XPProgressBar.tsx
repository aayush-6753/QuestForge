import type { ProgressionSummary } from "../../types/api";

export function XPProgressBar({ progression, label = "XP Progress" }: { progression: ProgressionSummary; label?: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-parchment/80">{label}</span>
        <span className="text-ember">
          {progression.xpWithinLevel}/{progression.xpRequiredForNextLevel}
        </span>
      </div>
      <div
        className="h-3 overflow-hidden border border-vellum/15 bg-ink/70"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={progression.xpRequiredForNextLevel}
        aria-valuenow={progression.xpWithinLevel}
      >
        <div
          className="h-full bg-ember"
          style={{ width: `${progression.percentage}%` }}
        />
      </div>
    </div>
  );
}
