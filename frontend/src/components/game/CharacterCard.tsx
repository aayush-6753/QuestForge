import { Pencil } from "lucide-react";
import type { Character, Profile, ProgressionSummary } from "../../types/api";
import { Button } from "../ui/Button";
import { GoldCounter } from "./GoldCounter";
import { StreakIndicator } from "./StreakIndicator";
import { XPProgressBar } from "./XPProgressBar";

export function CharacterCard({
  character,
  profile,
  progression,
  onEdit,
}: {
  character: Character;
  profile: Profile;
  progression: ProgressionSummary;
  onEdit: () => void;
}) {
  return (
    <section className="rounded-lg border border-vellum/10 bg-coal/90 p-5 shadow-glow">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-ember">Character</p>
          <h2 className="mt-1 font-display text-3xl text-vellum">
            {profile.displayName ?? "Unnamed Adventurer"}
          </h2>
          <p className="mt-2 text-parchment/70">Level {progression.level} seeker of better days.</p>
        </div>
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-3">
            <GoldCounter gold={character.gold} />
            <StreakIndicator current={character.currentStreak} longest={character.longestStreak} />
          </div>
          <Button type="button" variant="secondary" className="justify-self-start md:justify-self-end" onClick={onEdit}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit profile
          </Button>
        </div>
      </div>
      <div className="mt-6">
        <XPProgressBar progression={progression} label="Character XP" />
      </div>
    </section>
  );
}
