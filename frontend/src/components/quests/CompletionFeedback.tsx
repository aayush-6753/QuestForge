import { motion, useReducedMotion } from "framer-motion";
import { Coins, Flame, Sparkles, Trophy, X } from "lucide-react";
import type { CompleteQuestResponse } from "../../types/api";
import { Button } from "../ui/AppButton";

function label(value: string) {
  const lower = value.toLowerCase();
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
}

export function CompletionFeedback({ result, onDismiss }: { result: CompleteQuestResponse; onDismiss: () => void }) {
  const reduceMotion = useReducedMotion();
  const characterLevel = result.progression.character.current.level;
  const attributeLevel = result.progression.attribute.current.level;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-y border-emerald/40 bg-emerald/10 px-4 py-5"
      role="status"
      aria-labelledby="completion-title"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Trophy className="mt-1 h-6 w-6 shrink-0 text-citrine" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold uppercase text-emerald">Quest complete</p>
            <h3 id="completion-title" className="break-words font-display text-xl text-vellum">
              {result.quest.title}
            </h3>
          </div>
        </div>
        <Button type="button" variant="ghost" className="min-h-10 px-3" onClick={onDismiss} aria-label="Dismiss completion results">
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <span className="inline-flex items-center gap-2 font-semibold text-vellum">
          <Sparkles className="h-4 w-4 text-ember" aria-hidden="true" />
          +{result.rewards.characterXp} XP
        </span>
        <span className="inline-flex items-center gap-2 font-semibold text-vellum">
          <Coins className="h-4 w-4 text-citrine" aria-hidden="true" />
          +{result.rewards.gold} gold
        </span>
        <span className="inline-flex items-center gap-2 font-semibold text-vellum">
          <Sparkles className="h-4 w-4 text-amethyst" aria-hidden="true" />
          +{result.rewards.attributeXp} {label(result.rewards.attributeType)} XP
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-vellum/10 pt-3 text-sm text-parchment/75">
        <span>Character level {characterLevel}</span>
        <span>{label(result.progression.attribute.type)} level {attributeLevel}</span>
        <span className="inline-flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-ruby" aria-hidden="true" />
          {result.streak.previous.currentStreak === result.streak.current.currentStreak
            ? `${result.streak.current.currentStreak} day streak`
            : `Streak ${result.streak.previous.currentStreak} to ${result.streak.current.currentStreak} days`}
        </span>
      </div>

      <div className="mt-3 grid gap-1">
        {result.progression.character.levelsGained > 0 ? (
          <motion.p initial={reduceMotion ? false : { scale: 0.96 }} animate={{ scale: 1 }} className="font-display text-lg text-citrine">
            Level up: {result.progression.character.previous.level} to {characterLevel}
          </motion.p>
        ) : null}
        {result.progression.attribute.levelsGained > 0 ? (
          <motion.p initial={reduceMotion ? false : { scale: 0.96 }} animate={{ scale: 1 }} className="font-display text-base text-amethyst">
            {label(result.progression.attribute.type)} level up: {result.progression.attribute.previous.level} to {attributeLevel}
          </motion.p>
        ) : null}
      </div>
    </motion.section>
  );
}
