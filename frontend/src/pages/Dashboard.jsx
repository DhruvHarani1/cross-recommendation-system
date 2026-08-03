import { motion } from 'framer-motion';
import { LogOut, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuroraBackground from '../components/auth/AuroraBackground';

const ease = [0.16, 1, 0.3, 1];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

/* ─── Greeting based on time of day ─── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  // ProtectedRoute guarantees user is non-null here
  const { user, logout } = useAuth();

  const displayName = user?.display_name || user?.username || 'there';

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex flex-col overflow-hidden">
      <AuroraBackground />

      {/* ─── Navbar ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="relative z-10 flex items-center justify-between px-8 py-6"
      >
        <Link to="/" className="text-[11px] uppercase tracking-[0.42em] text-white/30 font-medium hover:text-white/60 transition-colors">
          CrossRec
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/40 text-xs font-medium hover:text-white/70 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </motion.nav>

      {/* ─── Hero greeting ─── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-xl"
        >
          {/* Icon pill */}
          <motion.div variants={fadeUp} className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/[0.07] text-purple-300/70 text-xs tracking-wider">
              <Sparkles className="w-3 h-3" />
              Your recommendations await
            </span>
          </motion.div>

          {/* Greeting */}
          <motion.p
            variants={fadeUp}
            className="text-white/35 text-lg font-light tracking-wide mb-2"
          >
            {getGreeting()},
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl font-medium text-white tracking-[-0.035em] leading-none mb-6"
          >
            {displayName}
            <span className="text-white/20">.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-white/35 text-base leading-relaxed max-w-sm mx-auto mb-12"
          >
            CrossRec is learning your taste across every medium.
            <br />Your personalised story universe is being built.
          </motion.p>

          {/* Meta chips */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: 'Username', value: `@${user?.username}` },
              { label: 'Email',    value: user?.email },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-md"
              >
                <span className="text-[11px] uppercase tracking-widest text-white/20">{label}</span>
                <span className="text-sm text-white/55 font-medium">{value}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ─── Subtle bottom fade ─── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, rgba(5,5,5,0.8) 0%, transparent 100%)' }}
      />
    </div>
  );
}
