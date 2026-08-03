import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const easeOut = [0.16, 1, 0.3, 1];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

/* ─── Google SVG ─── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

/* ─── Floating Input ─── */
function FloatingInput({ label, type = 'text', icon: Icon, value, onChange, disabled }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const active = focused || value.length > 0;

  return (
    <div className="relative">
      <div
        className={`relative flex items-center rounded-xl border bg-white/[0.03] backdrop-blur-md transition-all duration-300 ${
          focused
            ? 'border-white/25 shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_0_24px_rgba(139,92,246,0.15)]'
            : 'border-white/10'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* Left icon */}
        {Icon && <Icon className="w-4 h-4 text-white/30 ml-4 flex-shrink-0" />}

        {/* Label + input wrapper */}
        <div className="relative flex-1 px-4">
          {/* Floating label */}
          <label
            style={{
              position: 'absolute',
              left: '1rem',
              top: active ? '0.35rem' : '50%',
              transform: active ? 'translateY(0) scale(0.75)' : 'translateY(-50%) scale(1)',
              transformOrigin: 'left center',
              fontSize: '0.875rem',
              color: 'rgba(255,255,255, ' + (active ? '0.5' : '0.35') + ')',
              pointerEvents: 'none',
              userSelect: 'none',
              transition: 'top 0.2s cubic-bezier(0.16,1,0.3,1), transform 0.2s cubic-bezier(0.16,1,0.3,1), color 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </label>

          {/* Input */}
          <input
            type={inputType}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            style={{
              paddingTop: active ? '1.25rem' : '0.875rem',
              paddingBottom: active ? '0.375rem' : '0.875rem',
              transition: 'padding-top 0.2s cubic-bezier(0.16,1,0.3,1), padding-bottom 0.2s cubic-bezier(0.16,1,0.3,1)',
            }}
            className="w-full bg-transparent border-none text-white text-sm focus:outline-none"
          />
        </div>

        {/* Eye / EyeOff toggle for password fields */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="mr-4 flex-shrink-0 text-white/30 hover:text-white/60 transition-colors duration-200 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Error banner ─── */
function ErrorBanner({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: easeOut }}
          className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm border bg-red-500/[0.08] border-red-500/20 text-red-300 mb-5"
        >
          <X className="w-4 h-4 flex-shrink-0" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Success banner ─── */
function SuccessBanner({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: easeOut }}
          className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm border bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-300 mb-5"
        >
          <Check className="w-4 h-4 flex-shrink-0" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── LoginForm ─── */
export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const canSubmit = !loading && email.length > 0 && password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const loggedInUser = await login({ email, password });

      setSuccess(`Welcome back, ${loggedInUser.display_name || loggedInUser.username}! Redirecting…`);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      if (err?.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err?.code === 'ERR_NETWORK') {
        setError('Cannot reach the server. Make sure the backend is running on port 8000.');
      } else {
        setError(err?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: easeOut }}
      className="relative w-full max-w-sm"
    >
      <div className="absolute -inset-6 bg-purple-500/[0.06] rounded-[2rem] blur-2xl -z-10" />

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        <motion.form
          variants={stagger}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          noValidate
        >
          <motion.h1 variants={fadeUp} className="text-2xl sm:text-3xl font-medium text-white tracking-[-0.02em] mb-2">
            Welcome back.
          </motion.h1>
          <motion.p variants={fadeUp} className="text-white/40 text-sm mb-7 leading-relaxed">
            Sign in to continue discovering stories beyond categories.
          </motion.p>

          {/* banners */}
          <motion.div variants={fadeUp}>
            <ErrorBanner message={error} />
            <SuccessBanner message={success} />
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-4 mb-3">
            <FloatingInput
              label="Email"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              disabled={loading}
            />
            <FloatingInput
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              disabled={loading}
            />
          </motion.div>

          <motion.div variants={fadeUp} className="flex justify-end mb-6">
            <a href="#" className="text-xs text-white/35 hover:text-white/70 transition-colors duration-300">
              Forgot password?
            </a>
          </motion.div>

          {/* Submit */}
          <motion.button
            variants={fadeUp}
            type="submit"
            disabled={!canSubmit}
            whileHover={canSubmit ? { y: -2, boxShadow: '0 8px 32px rgba(139,92,246,0.25)' } : {}}
            whileTap={canSubmit ? { scale: 0.98 } : {}}
            transition={{ duration: 0.2 }}
            className={`group w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium mb-6 transition-all duration-300 ease-out ${
              canSubmit
                ? 'bg-gradient-to-b from-white to-white/90 text-black shadow-[0_8px_24px_rgba(255,255,255,0.1)] cursor-pointer'
                : 'bg-white/20 text-white/40 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </motion.button>

          {/* Divider */}
          <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-[11px] uppercase tracking-wider text-white/25">or</span>
            <div className="h-px flex-1 bg-white/[0.08]" />
          </motion.div>

          {/* Google */}
          <motion.button
            variants={fadeUp}
            type="button"
            whileHover={{ y: -2, borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.055)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm font-medium mb-8"
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>

          {/* Sign up link */}
          <motion.p variants={fadeUp} className="text-center text-sm text-white/35">
            Don't have an account?{' '}
            <a
              href="/signup"
              className="relative text-white/80 hover:text-white transition-colors duration-300 font-medium group"
            >
              Sign Up
              <span className="absolute -bottom-px left-0 right-0 h-px bg-white/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              {' '}→
            </a>
          </motion.p>
        </motion.form>
      </div>
    </motion.div>
  );
}