// HowItWorks.jsx
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Film, BookOpen, Gamepad2, Music, ArrowRight } from "lucide-react";

/* ───────────────────────────  ANIMATION PRESETS  ─────────────────────────── */

const easeOut = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay, ease: easeOut },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 1, delay, ease: easeOut },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, delay, ease: easeOut },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const tagOrbital = {
  hidden: { opacity: 0, scale: 0.5, x: 0, y: 0 },
  visible: (custom) => ({
    opacity: 1,
    scale: 1,
    x: custom.x,
    y: custom.y,
    transition: { duration: 0.8, ease: easeOut, delay: custom.delay },
  }),
};

/* ───────────────────────────  UI PRIMITIVES  ─────────────────────────── */

function GlassCard({ children, className = "", glow = false }) {
  return (
    <div
      className={`relative rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl ${className}`}
    >
      {glow && (
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-amber-500/10 blur-lg opacity-60 pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function CategoryBadge({ type }) {
  const icons = { film: Film, book: BookOpen, game: Gamepad2, music: Music };
  const labels = { film: "FILM", book: "BOOK", game: "GAME", music: "MUSIC" };
  const Icon = icons[type];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
      {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />}
      {labels[type]}
    </span>
  );
}

function MatchBar({ pct, delay = 0 }) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">
          Match
        </span>
        <span className="text-sm font-bold text-white/90 tabular-nums">
          {pct}
        </span>
      </div>
      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: pct }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: delay + 0.3, ease: easeOut }}
          className="h-full rounded-full bg-gradient-to-r from-purple-500/80 to-pink-500/60"
        />
      </div>
    </div>
  );
}

function ThemeTag({ children }) {
  return (
    <span className="px-2.5 py-1 rounded-md text-[11px] font-medium text-white/50 bg-white/[0.04] border border-white/[0.06]">
      {children}
    </span>
  );
}

/* ───────────────────────────  SCENE 1  ─────────────────────────── */

function SceneOne() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <div
      ref={ref}
      className="relative min-h-screen flex items-center py-24 overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* LEFT: Text */}
          <div className="order-2 lg:order-1">
            <motion.span
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="block text-xs uppercase tracking-[0.3em] text-white/25 mb-6"
            >
              The Beginning
            </motion.span>

            <motion.h2
              custom={0.1}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-[-0.03em] leading-[1.05] mb-8"
            >
              Start with something
              <br />
              you already love.
            </motion.h2>

            <motion.p
              custom={0.2}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="text-lg text-white/40 leading-relaxed max-w-md"
            >
              Choose any movie, book, game or album. No filters. No categories.
              Just the stories that moved you.
            </motion.p>
          </div>

          {/* RIGHT: Floating Card */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="relative"
            >
              {/* Float animation wrapper */}
              <motion.div
                animate={{ y: [0, -18, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-[280px] h-[380px]"
              >
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/[0.07]">
                  <img
                    src="https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
                    alt="Interstellar"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="absolute -bottom-4 -left-6 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-sm font-medium text-white"
                >
                  Interstellar · Film
                </motion.div>

                {/* Soft outer glow */}
                <div className="absolute -inset-4 bg-purple-500/[0.07] rounded-[2rem] blur-2xl -z-10" />
                <div className="absolute -inset-8 bg-amber-500/[0.03] rounded-[3rem] blur-3xl -z-10" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────  SCENE 2  ─────────────────────────── */

const THEME_KEYWORDS = [
  { label: "Hope", x: -170, y: -130, delay: 0.1 },
  { label: "Isolation", x: 190, y: -110, delay: 0.2 },
  { label: "Wonder", x: -150, y: 120, delay: 0.3 },
  { label: "Humanity", x: 180, y: 140, delay: 0.35 },
  { label: "Survival", x: -190, y: 10, delay: 0.25 },
  { label: "Adventure", x: 200, y: 30, delay: 0.4 },
];

function SceneTwo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <div
      ref={ref}
      className="relative min-h-screen flex items-center py-24 overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* LEFT: Card with orbiting themes */}
          <div className="flex justify-center lg:justify-start">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="relative"
            >
              {/* Connection lines SVG */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                  transform: "translate(-50%, -50%)",
                  top: "50%",
                  left: "50%",
                  width: "200%",
                  height: "200%",
                }}
              >
                <defs>
                  <linearGradient
                    id="lineGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="rgba(139,92,246,0.3)" />
                    <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                  </linearGradient>
                </defs>
                {THEME_KEYWORDS.map((tag, i) => (
                  <motion.line
                    key={i}
                    x1="50%"
                    y1="50%"
                    x2={`calc(50% + ${tag.x * 0.6}px)`}
                    y2={`calc(50% + ${tag.y * 0.6}px)`}
                    stroke="url(#lineGrad)"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={
                      isInView
                        ? { pathLength: 1, opacity: 0.4 }
                        : { pathLength: 0, opacity: 0 }
                    }
                    transition={{
                      duration: 0.8,
                      delay: tag.delay + 0.2,
                      ease: easeOut,
                    }}
                  />
                ))}
              </svg>

              {/* Central card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-[280px] h-[380px]"
              >
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/[0.07]">
                  <img
                    src="https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"
                    alt="The Matrix"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                </div>

                <div className="absolute -bottom-4 -left-6 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-sm font-medium text-white">
                  The Matrix · Film
                </div>
              </motion.div>

              {/* Orbiting tags */}
              {THEME_KEYWORDS.map((tag, i) => (
                <motion.div
                  key={i}
                  custom={tag}
                  variants={tagOrbital}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  className="absolute top-1/2 left-1/2 pointer-events-none"
                  style={{ marginLeft: -40, marginTop: -14 }}
                >
                  <motion.div
                    animate={{ y: [0, -5, 0], x: [0, 2, 0] }}
                    transition={{
                      duration: 4 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                    className="flex items-center gap-2 pl-0 pr-3 py-1.5 rounded-lg
                      bg-[#0d0d14] border border-purple-500/[0.18]
                      shadow-[0_0_12px_rgba(139,92,246,0.08)]
                      backdrop-blur-md overflow-hidden whitespace-nowrap"
                  >
                    {/* Left accent bar */}
                    <span className="w-[3px] self-stretch rounded-r-full bg-gradient-to-b from-purple-400/80 to-purple-600/40 flex-shrink-0" />
                    <span className="text-[10px] font-mono font-semibold tracking-widest text-purple-300/60 select-none">
                      #
                    </span>
                    <span className="text-[11px] font-medium text-white/75 tracking-wide">
                      {tag.label}
                    </span>
                  </motion.div>
                </motion.div>
              ))}

              <div className="absolute -inset-6 bg-purple-500/[0.05] rounded-[2rem] blur-2xl -z-10" />
            </motion.div>
          </div>

          {/* RIGHT: Text */}
          <div>
            <motion.span
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="block text-xs uppercase tracking-[0.3em] text-white/25 mb-6"
            >
              Understanding
            </motion.span>

            <motion.h2
              custom={0.1}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-[-0.03em] leading-[1.05] mb-8"
            >
              We understand the
              <br />
              story beneath it.
            </motion.h2>

            <motion.p
              custom={0.2}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="text-lg text-white/40 leading-relaxed max-w-md"
            >
              Not genres. Not metadata. We extract the emotional DNA — the
              themes, tone, and ideas that make a story resonate.
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────  SCENE 3  ─────────────────────────── */

const RECOMMENDATIONS = [
  {
    type: "film",
    title: "Blade Runner 2049",
    img: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    match: "93%",
    tags: ["Isolation", "Ruined World"],
    delay: 0.2,
    position: "top-0 right-0",
  },
  {
    type: "book",
    title: "Berserk",
    img: "https://covers.openlibrary.org/b/isbn/9781593070205-L.jpg",
    match: "97%",
    tags: ["Dark Fantasy", "Struggle"],
    delay: 0.45,
    position: "top-24 left-0",
  },
  {
    type: "game",
    title: "Elden Ring",
    img: "https://media.rawg.io/media/games/5ec/5ecac5cb026ec26a56efcc546364e348.jpg",
    match: "94%",
    tags: ["Ruin", "Mythology"],
    delay: 0.7,
    position: "bottom-24 right-4",
  },
  {
    type: "music",
    title: "Dark Souls OST",
    img: "https://media.rawg.io/media/games/4be/4be6a6ad0364751a96229c56bf69be59.jpg",
    match: "90%",
    tags: ["Melancholy", "Grandeur"],
    delay: 0.95,
    position: "bottom-0 left-8",
  },
];

function SceneThree() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div
      ref={ref}
      className="relative min-h-screen flex items-center py-24 overflow-hidden"
    >
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-purple-600/[0.03] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* LEFT: Text */}
          <div>
            <motion.span
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="block text-xs uppercase tracking-[0.3em] text-white/25 mb-6"
            >
              Connection
            </motion.span>

            <motion.h2
              custom={0.1}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-[-0.03em] leading-[1.05] mb-8"
            >
              Meaning connects
              <br />
              every medium.
            </motion.h2>

            <motion.p
              custom={0.2}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="text-lg text-white/40 leading-relaxed max-w-md"
            >
              Our engine finds stories that feel alike — not just look alike.
              One search. Four mediums. Infinite resonance.
            </motion.p>
          </div>

          {/* RIGHT: Constellation of connections */}
          <div className="relative h-[520px] sm:h-[580px]">
            {/* Central source card */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-[180px] h-[245px]"
              >
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/[0.07]">
                  <img
                    src="https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg"
                    alt="The Witcher 3"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                </div>

                <div className="absolute -bottom-3 -left-4 px-3 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-xs font-medium text-white">
                  The Witcher 3
                </div>
              </motion.div>
            </motion.div>

            {/* Connection lines from center */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient
                  id="connGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="rgba(139,92,246,0.2)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0.05)" />
                </linearGradient>
              </defs>
              {/* Line to top-right */}
              <motion.line
                x1="50%"
                y1="50%"
                x2="85%"
                y2="15%"
                stroke="url(#connGrad)"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.3, ease: easeOut }}
              />
              {/* Line to top-left */}
              <motion.line
                x1="50%"
                y1="50%"
                x2="15%"
                y2="25%"
                stroke="url(#connGrad)"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.5, ease: easeOut }}
              />
              {/* Line to bottom-right */}
              <motion.line
                x1="50%"
                y1="50%"
                x2="80%"
                y2="80%"
                stroke="url(#connGrad)"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.7, ease: easeOut }}
              />
              {/* Line to bottom-left */}
              <motion.line
                x1="50%"
                y1="50%"
                x2="20%"
                y2="75%"
                stroke="url(#connGrad)"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.9, ease: easeOut }}
              />
            </svg>

            {/* Recommendation cards */}
            {RECOMMENDATIONS.map((rec, i) => (
              <motion.div
                key={rec.title}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: rec.delay, ease: easeOut }}
                className={`absolute ${rec.position} z-10`}
                style={{
                  top:
                    i === 0 ? "0%" : i === 1 ? "18%" : i === 2 ? "58%" : "78%",
                  left: i === 1 ? "0%" : i === 3 ? "5%" : undefined,
                  right: i === 0 ? "0%" : i === 2 ? "2%" : undefined,
                }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <GlassCard className="w-52 sm:w-56 p-4">
                    <div className="flex items-start gap-3">
                      {/* Mini poster */}
                      <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/[0.06]">
                        <img
                          src={rec.img}
                          alt={rec.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CategoryBadge type={rec.type} />
                        <h4 className="text-sm font-semibold text-white mt-1 truncate">
                          {rec.title}
                        </h4>
                        <MatchBar pct={rec.match} delay={rec.delay} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {rec.tags.map((tag) => (
                        <ThemeTag key={tag}>{tag}</ThemeTag>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────  ENDING  ─────────────────────────── */

// function Ending() {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, amount: 0.6 });
//   const { scrollYProgress } = useScroll({
//     target: ref,
//     offset: ["start end", "end start"],
//   });
//   const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
//   const scale = useTransform(
//     scrollYProgress,
//     [0, 0.3, 0.7, 1],
//     [0.95, 1, 1, 0.95],
//   );

//   return (
//     <div
//       ref={ref}
//       className="relative min-h-[80vh] flex items-center justify-center py-32"
//     >
//       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/[0.02] to-transparent pointer-events-none" />

//       <motion.div style={{ opacity, scale }} className="text-center px-6">
//         <motion.h2
//           initial={{ opacity: 0, y: 30 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 1, ease: easeOut }}
//           className="text-5xl sm:text-6xl md:text-7xl font-semibold text-white tracking-[-0.03em] leading-[1.1] mb-6"
//         >
//           One story.
//           <br />
//           <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
//             Infinite connections.
//           </span>
//         </motion.h2>

//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={isInView ? { opacity: 1 } : {}}
//           transition={{ duration: 1, delay: 0.3, ease: easeOut }}
//           className="text-lg text-white/40 mb-12"
//         >
//           Discover your next favorite story.
//         </motion.p>

//         <motion.button
//           initial={{ opacity: 0, y: 20 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.8, delay: 0.5, ease: easeOut }}
//           whileHover={{ scale: 1.03 }}
//           whileTap={{ scale: 0.98 }}
//           className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-colors"
//         >
//           Start Exploring
//           <ArrowRight
//             className="w-4 h-4 transition-transform group-hover:translate-x-1"
//             strokeWidth={2.5}
//           />
//         </motion.button>
//       </motion.div>
//     </div>
//   );
// }

/* ───────────────────────────  EXPORT  ─────────────────────────── */

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-[#050505]">
      <SceneOne />
      <SceneTwo />
      <SceneThree />
      {/* <Ending /> */}
    </section>
  );
}
