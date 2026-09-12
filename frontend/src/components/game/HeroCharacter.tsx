import { motion } from "framer-motion";

export function HeroCharacter() {
  return (
    <motion.div
      className="relative mx-auto hidden h-[28rem] w-full max-w-md items-end justify-center lg:flex"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.12 }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute bottom-2 h-10 w-72 rounded-full bg-black/35 blur-xl"
        animate={{ scaleX: [1, 1.08, 1], opacity: [0.28, 0.42, 0.28] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative grid place-items-center"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute -top-12 h-20 w-20 rounded-full border border-ember/30 bg-ember/10 blur-sm"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative h-80 w-56">
          <div className="absolute left-1/2 top-5 h-20 w-20 -translate-x-1/2 rounded-full border border-ember/45 bg-parchment shadow-glow" />
          <div className="absolute left-1/2 top-12 h-4 w-12 -translate-x-1/2 rounded-full bg-ink/80" />
          <div className="absolute left-1/2 top-24 h-32 w-32 -translate-x-1/2 rounded-t-[5rem] border border-vellum/20 bg-sapphire/75 shadow-glow" />
          <div className="absolute left-1/2 top-28 h-24 w-44 -translate-x-1/2 rounded-t-full bg-ink/70" />
          <div className="absolute left-[4.3rem] top-36 h-28 w-7 rotate-12 rounded-full bg-parchment" />
          <div className="absolute right-[4.3rem] top-36 h-28 w-7 -rotate-12 rounded-full bg-parchment" />
          <div className="absolute left-1/2 top-48 h-24 w-24 -translate-x-1/2 rounded-b-[3rem] bg-sapphire" />
          <div className="absolute left-[5.1rem] top-64 h-16 w-8 rounded-full bg-coal" />
          <div className="absolute right-[5.1rem] top-64 h-16 w-8 rounded-full bg-coal" />

          <motion.div
            className="absolute -right-7 top-20 h-44 w-6 origin-bottom rounded-full bg-ember"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute -right-12 top-10 h-16 w-16 rounded-full border-4 border-emerald/80 bg-emerald/15" />
        </div>
      </motion.div>
    </motion.div>
  );
}
