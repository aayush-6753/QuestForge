import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Dumbbell,
  Flame,
  History,
  LogIn,
  Palette,
  ScrollText,
  Shield,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { HeroCharacter } from "../components/game/HeroCharacter";
import { PageContainer } from "../components/ui/PageContainer";

const title = "Turn real life into your greatest quest.";
const titleWords = title.split(" ");

const steps = [
  {
    label: "01",
    title: "Create Your Quest",
    body: "Turn a goal, habit, or responsibility into a clear mission.",
    examples: ["Run 3 km.", "Study for 45 minutes.", "Finish my portfolio."],
  },
  {
    label: "02",
    title: "Complete The Mission",
    body: "Take action in the real world and check it off when it is done.",
  },
  {
    label: "03",
    title: "Earn XP & Grow",
    body: "Completed quests reward XP and strengthen attributes like Strength, Knowledge, Discipline, Creativity, and more.",
  },
  {
    label: "04",
    title: "Build Your Character",
    body: "Watch your stats, streaks, achievements, and completed adventures become a record of who you are becoming.",
  },
];

const features: Array<{ title: string; body: string; icon: LucideIcon }> = [
  { title: "Quests", body: "Turn intimidating goals into missions you can actually complete.", icon: ScrollText },
  { title: "Attributes", body: "Build your real-world stats through the actions that matter.", icon: Shield },
  { title: "XP & Levels", body: "Every completed quest moves your character forward.", icon: Trophy },
  { title: "Streaks", body: "Build momentum by showing up consistently.", icon: Flame },
  { title: "Achievements", body: "Unlock milestones worth remembering.", icon: Sparkles },
  { title: "Progress History", body: "Look back and see proof that you have changed.", icon: History },
];

const questExamples: Array<{ title: string; body: string; reward: string; icon: LucideIcon }> = [
  { title: "Strength Quest", body: "Train at the gym for 45 minutes", reward: "+100 XP", icon: Dumbbell },
  { title: "Knowledge Quest", body: "Read 20 pages", reward: "+60 XP", icon: Brain },
  { title: "Discipline Quest", body: "Complete the task you have been avoiding", reward: "+120 XP", icon: CheckCircle2 },
  { title: "Creativity Quest", body: "Create something for 30 minutes", reward: "+80 XP", icon: Palette },
  { title: "Adventure Quest", body: "Try somewhere you have never been before", reward: "+150 XP", icon: Target },
];

const madeFor = [
  "For the student building Knowledge.",
  "For the athlete building Strength.",
  "For the creator building Creativity.",
  "For the founder building Discipline.",
  "For anyone trying to become a stronger version of themselves.",
];

const faqs = [
  {
    question: "Is Life RPG a game?",
    answer:
      "Not exactly. Your real life is the game. Life RPG gives your goals and habits the progression systems that make RPGs satisfying.",
  },
  {
    question: "What can become a quest?",
    answer: "Almost anything: workouts, studying, reading, projects, routines, personal challenges, or long-term goals.",
  },
  {
    question: "Do I choose my own attributes?",
    answer: "You can shape your character around the areas of life you want to develop.",
  },
  {
    question: "Do I have to be productive all the time?",
    answer: "No. The goal is not endless productivity. It is intentional progress toward the life you want.",
  },
];

export function LandingPage() {
  const reduceMotion = useReducedMotion();

  return (
    <PageContainer className="py-0">
      <section className="grid min-h-[72svh] w-full gap-10 py-6 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-3xl"
        >
          <p className="text-sm font-bold uppercase text-ember">Life RPG</p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-vellum sm:text-6xl lg:text-7xl" aria-label={title}>
            {reduceMotion ? title : <RollingTitle />}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-parchment/78">
            Convert everyday commitments into quests, build attributes through action, and let your progress feel like a
            character sheet for the person you are becoming.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryLink>Begin Your Journey</PrimaryLink>
            <Link
              to="/auth"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-vellum/15 px-4 py-2 text-sm font-bold text-vellum transition hover:bg-vellum/10"
            >
              <LogIn className="h-5 w-5 text-ember" aria-hidden="true" />
              Sign In
            </Link>
          </div>
        </motion.div>

        <HeroCharacter />
      </section>

      <section className="border-y border-vellum/10 py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase text-ember">How it works</p>
          <h2 className="mt-3 font-display text-4xl text-vellum sm:text-5xl">Every great journey starts with a quest.</h2>
          <p className="mt-4 text-lg leading-8 text-parchment/75">
            Life RPG turns the things you already want to accomplish into a progression system that makes improvement
            visible.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {steps.map((step) => (
            <article key={step.label} className="rounded-lg border border-vellum/10 bg-coal/70 p-5">
              <p className="text-sm font-bold text-ember">{step.label}</p>
              <h3 className="mt-2 font-display text-2xl text-vellum">{step.title}</h3>
              <p className="mt-3 leading-7 text-parchment/70">{step.body}</p>
              {step.examples ? (
                <p className="mt-4 text-sm leading-6 text-parchment/55">{step.examples.join("  ")}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase text-ember">Features</p>
          <h2 className="mt-3 font-display text-4xl text-vellum sm:text-5xl">Your life. Your character build.</h2>
          <p className="mt-4 text-lg leading-8 text-parchment/75">
            You are already gaining experience. Life RPG simply makes it visible.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-lg border border-vellum/10 bg-ink/45 p-5">
              <feature.icon className="h-6 w-6 text-ember" aria-hidden="true" />
              <h3 className="mt-4 font-display text-xl text-vellum">{feature.title}</h3>
              <p className="mt-2 leading-7 text-parchment/70">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-8 border-y border-vellum/10 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase text-ember">Character sheet</p>
          <h2 className="mt-3 font-display text-4xl text-vellum sm:text-5xl">Your progress should feel like progress.</h2>
          <p className="mt-4 text-lg leading-8 text-parchment/75">
            Instead of another checklist that disappears when you tick a box, Life RPG transforms your actions into a
            character sheet.
          </p>
          <div className="mt-8">
            <PrimaryLink>Build Your Character</PrimaryLink>
          </div>
        </div>

        <div className="rounded-lg border border-ember/25 bg-coal/80 p-6 shadow-glow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-ember">Level 12</p>
              <h3 className="font-display text-3xl text-vellum">Adventurer</h3>
            </div>
            <p className="rounded-md border border-vellum/10 bg-ink/65 px-3 py-2 text-sm font-bold text-citrine">
              3,420 XP
            </p>
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Strength", "18"],
              ["Knowledge", "24"],
              ["Discipline", "21"],
              ["Creativity", "16"],
            ].map(([stat, value]) => (
              <div key={stat} className="border-b border-vellum/10 pb-3">
                <dt className="text-sm text-parchment/60">{stat}</dt>
                <dd className="mt-1 font-display text-2xl text-vellum">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 rounded-lg border border-vellum/10 bg-ink/55 p-4">
            <p className="text-sm font-bold uppercase text-ember">Current Quest</p>
            <p className="mt-2 font-semibold text-vellum">Complete 5 workouts this week</p>
            <p className="mt-2 text-sm text-parchment/70">Reward: +350 XP / +2 Strength / +1 Discipline</p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase text-ember">Quest examples</p>
          <h2 className="mt-3 font-display text-4xl text-vellum sm:text-5xl">Quests for the life you actually live.</h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {questExamples.map((quest) => (
            <article key={quest.title} className="rounded-lg border border-vellum/10 bg-coal/70 p-5">
              <quest.icon className="h-6 w-6 text-ember" aria-hidden="true" />
              <h3 className="mt-4 font-display text-xl text-vellum">{quest.title}</h3>
              <p className="mt-2 min-h-14 text-sm leading-6 text-parchment/70">{quest.body}</p>
              <p className="mt-4 text-sm font-bold text-citrine">{quest.reward}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 max-w-2xl">
          <h3 className="font-display text-2xl text-vellum">There are no meaningless side quests.</h3>
          <p className="mt-2 text-lg text-parchment/70">If it moves your life forward, it counts.</p>
        </div>
      </section>

      <section className="border-y border-vellum/10 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase text-ember">Philosophy</p>
          <h2 className="mt-3 font-display text-4xl text-vellum sm:text-5xl">The final boss isn't your to-do list.</h2>
          <p className="mt-5 text-lg leading-8 text-parchment/75">
            It is inconsistency. Procrastination. Losing sight of how far you have come.
          </p>
          <p className="mt-4 text-lg leading-8 text-parchment/75">
            Life RPG gives everyday effort a sense of momentum. Small actions earn experience. Consistency builds
            attributes. Difficult goals become quests you can approach one step at a time.
          </p>
          <p className="mt-8 font-display text-2xl text-vellum">
            You do not become your ideal character by selecting them.
          </p>
          <p className="mt-2 font-display text-3xl text-ember">You become them by playing.</p>
        </div>
      </section>

      <section className="grid gap-10 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-sm font-bold uppercase text-ember">Made for</p>
          <h2 className="mt-3 font-display text-4xl text-vellum sm:text-5xl">Choose your own adventure.</h2>
          <p className="mt-4 text-lg leading-8 text-parchment/75">There is no predetermined build.</p>
          <p className="mt-6 font-display text-2xl text-ember">You decide what deserves XP.</p>
        </div>

        <div className="grid gap-3">
          {madeFor.map((line) => (
            <p key={line} className="rounded-lg border border-vellum/10 bg-coal/70 px-5 py-4 text-parchment/80">
              {line}
            </p>
          ))}
        </div>
      </section>

      <section className="border-y border-vellum/10 py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase text-ember">FAQ</p>
          <h2 className="mt-3 font-display text-4xl text-vellum sm:text-5xl">Questions before you begin?</h2>
        </div>

        <div className="mt-10 divide-y divide-vellum/10 border-y border-vellum/10">
          {faqs.map((faq) => (
            <article key={faq.question} className="grid gap-3 py-6 md:grid-cols-[0.45fr_1fr]">
              <h3 className="font-display text-xl text-vellum">{faq.question}</h3>
              <p className="leading-7 text-parchment/70">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-24 text-center">
        <p className="text-sm font-bold uppercase text-ember">Final call</p>
        <h2 className="mx-auto mt-3 max-w-4xl font-display text-5xl leading-tight text-vellum sm:text-6xl">
          Your next quest is waiting.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-parchment/75">
          You already know the person you want to become. Start earning the experience it takes to become them.
        </p>
        <div className="mt-8 flex justify-center">
          <PrimaryLink>Begin Your Journey</PrimaryLink>
        </div>
        <p className="mt-4 text-sm text-parchment/55">Create your character. Choose your quests. Start at Level 1.</p>
      </section>
    </PageContainer>
  );
}

function RollingTitle() {
  return (
    <span aria-hidden="true">
      {titleWords.map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap">
          {word.split("").map((letter, letterIndex) => (
            <span key={`${letter}-${letterIndex}`} className="inline-block overflow-hidden align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: "0.95em", rotateX: -90 }}
                animate={{ y: 0, rotateX: 0 }}
                transition={{
                  delay: wordIndex * 0.12 + letterIndex * 0.025,
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {letter}
              </motion.span>
            </span>
          ))}
          {wordIndex < titleWords.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </span>
  );
}

function PrimaryLink({ children }: { children: string }) {
  return (
    <Link
      to="/auth"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-ink shadow-lg shadow-black/20 transition hover:bg-[#e0ad58]"
    >
      {children}
      <ArrowRight className="h-5 w-5" aria-hidden="true" />
    </Link>
  );
}
