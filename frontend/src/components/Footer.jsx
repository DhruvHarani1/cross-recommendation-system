import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const easeOut = [0.16, 1, 0.3, 1];

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } },
};

const NAV_LINKS = ["Home", "Features", "How It Works", "About"];

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <footer ref={ref} className="relative w-full bg-[#050505] overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-[#7C3AED] opacity-[0.18] blur-[220px]"
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[20%] right-[5%] w-[550px] h-[550px] rounded-full bg-[#EC4899] opacity-[0.15] blur-[200px]"
          animate={{
            x: [0, -70, 50, 0],
            y: [0, 50, -30, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-15%] left-[30%] w-[650px] h-[650px] rounded-full bg-[#3B82F6] opacity-[0.14] blur-[240px]"
          animate={{
            x: [0, 60, -80, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[20%] w-[450px] h-[450px] rounded-full bg-[#4C1D95] opacity-[0.16] blur-[190px]"
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 40, -50, 0],
            scale: [1, 0.95, 1.08, 1],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(5,5,5,0.6) 100%)",
        }}
      />

      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* CTA section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="relative flex flex-col items-center text-center pt-32 pb-24"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/[0.08] rounded-full blur-[150px] pointer-events-none" />

          <motion.span
            variants={fadeUp}
            className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-white/30 mb-6"
          >
            Ready to discover more?
          </motion.span>

          <motion.h2
            variants={fadeUp}
            className="text-4xl sm:text-6xl font-medium text-white tracking-[-0.02em] leading-[1.1] mb-6 max-w-2xl"
          >
            Your next favorite story is waiting.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-white/45 text-base sm:text-lg leading-relaxed max-w-xl mb-10"
          >
            Explore meaningful recommendations across movies, books, games, and
            music — powered by AI, connected by stories.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <button className="group flex items-center gap-2 px-7 py-3 rounded-full text-black text-sm font-medium bg-gradient-to-b from-white to-white/90 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_32px_rgba(124,58,237,0.35)] hover:-translate-y-0.5 transition-all duration-300 ease-out">
              Get Started
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <a
              href="#how-it-works"
              className="text-white/50 text-sm font-medium hover:text-white transition-colors duration-300"
            >
              Learn how CrossRec works
            </a>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.3, ease: easeOut }}
          className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />

        {/* Bottom footer */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="py-14 flex flex-col md:flex-row items-center md:items-start justify-between gap-10 text-center md:text-left"
        >
          {/* Left: logo + tagline */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center md:items-start gap-3"
          >
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6V18C4 19.1046 4.89543 20 6 20H8.5V14L12 17.5L15.5 14V20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H15.5V10L12 6.5L8.5 10V4H6C4.89543 4 4 4.89543 4 6Z"
                  fill="white"
                />
              </svg>
              <span className="text-white text-base font-semibold tracking-wide">
                CrossRec
              </span>
            </Link>
            <p className="text-white/35 text-sm max-w-[220px]">
              Discover stories beyond categories.
            </p>
          </motion.div>

          {/* Center: nav */}
          <motion.nav
            variants={fadeUp}
            className="flex flex-wrap justify-center gap-x-8 gap-y-3"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-white/45 text-sm hover:text-white transition-colors duration-300"
              >
                {link}
              </a>
            ))}
          </motion.nav>

          {/* Right: social icons */}
          <motion.div variants={fadeUp} className="flex items-center gap-4">
            {[
              { icon: FaGithub, href: "https://github.com", label: "GitHub" },
              {
                icon: FaLinkedin,
                href: "https://linkedin.com",
                label: "LinkedIn",
              },
              { icon: Mail, href: "mailto:hello@crossrec.app", label: "Email" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/50 hover:text-white hover:border-white/25 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(124,58,237,0.25)] transition-all duration-300 ease-out"
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
              </a>
            ))}
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="h-px w-full bg-white/[0.06]" />

        {/* Bottom row */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="py-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center"
        >
          <p className="text-white/25 text-xs">© 2026 CrossRec</p>
          <p className="text-white/25 text-xs">
            Built with React, FastAPI &amp; AI.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
