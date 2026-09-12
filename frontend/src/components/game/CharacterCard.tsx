import type { Character, Profile } from "../../types/api";
import { GoldCounter } from "./GoldCounter";
import { StreakIndicator } from "./StreakIndicator";
import { XPProgressBar } from "./XPProgressBar";

export function CharacterCard({ character, profile }: { character: Character; profile: Profile }) {
  return (
    <section className="rounded-lg border border-vellum/10 bg-coal/90 p-5 shadow-glow">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-ember">Character</p>
          <h2 className="mt-1 font-display text-3xl text-vellum">
            {profile.displayName ?? "Unnamed Adventurer"}
          </h2>
          <p className="mt-2 text-parchment/70">Level {character.level} seeker of better days.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <GoldCounter gold={character.gold} />
          <StreakIndicator current={character.currentStreak} longest={character.longestStreak} />
        </div>
      </div>
      <div className="mt-6">
        <XPProgressBar totalXp={character.totalXp} />
      </div>
    </section>
  );
}
