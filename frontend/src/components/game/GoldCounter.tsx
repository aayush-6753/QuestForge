import { Coins } from "lucide-react";

export function GoldCounter({ gold }: { gold: number }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-ember/25 bg-ember/10 px-3 py-2 text-ember">
      <Coins className="h-5 w-5" aria-hidden="true" />
      <span className="font-bold">{gold}</span>
      <span className="text-sm text-parchment/70">Gold</span>
    </div>
  );
}
