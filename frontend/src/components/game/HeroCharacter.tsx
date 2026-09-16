import { Check, Flame, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export function HeroCharacter() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative mx-auto w-full max-w-xl"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.12 }}
    >
      <div className="panel relative overflow-hidden p-4 sm:p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-ember" />
        <div className="flex items-start justify-between gap-4 border-b border-vellum/10 pb-4">
          <div>
            <p className="eyebrow">Character sheet</p>
            <h2 className="mt-1 font-display text-3xl text-vellum">Level 12 <span className="text-ember">Adventurer</span></h2>
          </div>
          <div className="border border-ember/45 bg-ember/10 px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-parchment/60">Current streak</p>
            <p className="mt-1 flex items-center justify-end gap-1 font-display text-xl text-vellum"><Flame className="h-4 w-4 text-ruby" /> 14 days</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1.1fr_.9fr]">
          <div className="border border-vellum/10 bg-ink/60 p-4">
            <div className="flex items-center justify-between gap-3"><p className="eyebrow">Current quest</p><span className="border border-system/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-system">Active</span></div>
            <p className="mt-3 font-display text-xl leading-snug text-vellum">Complete 5 workouts this week</p>
            <div className="mt-4 h-2 bg-vellum/10"><motion.div className="h-full bg-ember" initial={reduceMotion ? false : { width: 0 }} animate={{ width: "60%" }} transition={{ duration: 0.7, delay: 0.35 }} /></div>
            <p className="mt-2 text-xs text-parchment/60">3 of 5 complete</p>
            <p className="mt-4 flex items-center gap-1.5 border-t border-vellum/10 pt-3 text-xs font-bold text-citrine"><Sparkles className="h-3.5 w-3.5" /> +350 XP · +2 Strength</p>
          </div>
          <dl className="grid grid-cols-2 border border-vellum/10 bg-ink/35">
            {[['Strength', '18', 'text-ruby'], ['Knowledge', '24', 'text-sapphire'], ['Discipline', '21', 'text-citrine'], ['Creativity', '16', 'text-amethyst']].map(([label, value, color]) => <div key={label} className="border-b border-r border-vellum/10 p-3 odd:border-r-0 even:border-r-0 sm:odd:border-r sm:even:border-r-0"><dt className="text-[10px] font-bold uppercase tracking-wider text-parchment/55">{label}</dt><dd className={`mt-1 font-display text-2xl ${color}`}>{value}</dd></div>)}
          </dl>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-vellum/10 pt-3 text-xs text-parchment/65"><Check className="h-4 w-4 text-emerald" /> Real actions become permanent character growth.</div>
      </div>
    </motion.div>
  );
}
