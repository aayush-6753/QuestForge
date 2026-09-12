export function XPProgressBar({ totalXp }: { totalXp: number }) {
  const xpIntoLevel = totalXp % 100;
  const percent = Math.min(100, xpIntoLevel);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-parchment/80">XP Progress</span>
        <span className="text-ember">{xpIntoLevel}/100</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-ink/70">
        <div className="h-full rounded-full bg-gradient-to-r from-ember via-citrine to-emerald" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
