import { ArrowRight, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HeroCharacter } from "../components/game/HeroCharacter";
import { PageContainer } from "../components/ui/PageContainer";

export function LandingPage() {
  return (
    <PageContainer className="flex min-h-screen items-center py-10">
      <div className="grid w-full gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-3xl"
        >
          <p className="text-sm font-bold uppercase text-ember">Life RPG</p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-vellum sm:text-6xl lg:text-7xl">
            Turn real life into your greatest quest.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-parchment/78">
            Convert everyday commitments into quests, build attributes through action, and let your progress feel like a
            character sheet for the person you are becoming.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-ink shadow-lg shadow-black/20 transition hover:bg-[#e0ad58]"
            >
              Begin Your Journey
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-vellum/15 px-4 py-2 text-sm font-bold text-vellum transition hover:bg-vellum/10"
            >
              <LogIn className="h-5 w-5 text-ember" aria-hidden="true" />
              Sign In
            </Link>
          </div>
        </motion.section>

        <HeroCharacter />
      </div>
    </PageContainer>
  );
}
