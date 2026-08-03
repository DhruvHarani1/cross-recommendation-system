import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PosterWall from './PosterWall';
import { useImagePreload } from '../hooks/useImagePreload';
import { ALL_POSTERS } from '../data/posters';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function Hero() {
  const posterWallReady = useImagePreload(ALL_POSTERS);

  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden bg-[#050505] flex items-center justify-center">
      {/* Static dark base always present — never an empty flash, even pre-load */}
      <div className="absolute inset-0 bg-[#050505]" />

      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          posterWallReady ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <PosterWall />
      </div>

      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[#6d28d9]/10 rounded-full blur-[160px] pointer-events-none animate-pulse-slow" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl"
      >
        <motion.span
          variants={item}
          className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-white/30 mb-10"
        >
          Movies · Books · Games · Music
        </motion.span>

        <motion.h1
          variants={item}
          className="text-4xl sm:text-6xl md:text-7xl font-semibold text-white tracking-tight leading-[1.08] mb-10"
        >
          Discover Stories
          <br />
          Beyond Categories
        </motion.h1>

        <motion.p
          variants={item}
          className="text-base sm:text-lg text-white/50 max-w-xl mb-14 leading-relaxed"
        >
          One search away from your next favorite film, book, game, or album—
          matched by the stories and ideas you already love.
        </motion.p>

        <motion.div variants={item} className="flex items-center gap-4">
          <Link to="/signup" className="px-7 py-3 rounded-full text-black text-sm font-medium bg-gradient-to-b from-white to-white/90 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_28px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 transition-all duration-300">
            Get Started
          </Link>
          <a href="#how-it-works" className="px-7 py-3 rounded-full border border-white/15 text-white text-sm font-medium bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/30 hover:-translate-y-0.5 transition-all duration-300">
            See how it works
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}