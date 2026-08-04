import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Eye, EyeOff, ArrowRight,
  Check, X, AtSign, Loader2,
} from 'lucide-react';
import { signup, checkUsername, checkEmail } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

/* ─── shared easing ─── */
const ease = [0.16, 1, 0.3, 1];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
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

/* ─── FloatingInput ─── */
function FloatingInput({ label, type = 'text', icon: Icon, value, onChange, suffix, disabled }) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPw = type === 'password';
  const inputType = isPw ? (showPw ? 'text' : 'password') : type;
  const active = focused || value.length > 0;

  return (
    <div
      className={`relative flex items-center rounded-xl border bg-white/[0.03] backdrop-blur-md transition-all duration-300 ${
        focused
          ? 'border-white/25 shadow-[0_0_0_1px_rgba(139,92,246,0.22),0_0_28px_rgba(139,92,246,0.12)]'
          : 'border-white/[0.09]'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {Icon && <Icon className="w-4 h-4 text-white/30 ml-4 flex-shrink-0" />}

      <div className="relative flex-1 px-4">
        <label
          style={{
            position: 'absolute',
            left: '1rem',
            top: active ? '0.35rem' : '50%',
            transform: active ? 'translateY(0) scale(0.75)' : 'translateY(-50%) scale(1)',
            transformOrigin: 'left center',
            fontSize: '0.875rem',
            color: `rgba(255,255,255,${active ? 0.5 : 0.35})`,
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            transition:
              'top 0.2s cubic-bezier(0.16,1,0.3,1), transform 0.2s cubic-bezier(0.16,1,0.3,1), color 0.2s ease',
          }}
        >
          {label}
        </label>
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
            transition:
              'padding-top 0.2s cubic-bezier(0.16,1,0.3,1), padding-bottom 0.2s cubic-bezier(0.16,1,0.3,1)',
          }}
          className="w-full bg-transparent border-none text-white text-sm focus:outline-none"
        />
      </div>

      {isPw ? (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPw((p) => !p)}
          className="mr-4 flex-shrink-0 text-white/30 hover:text-white/60 transition-colors duration-200 focus:outline-none"
          aria-label={showPw ? 'Hide password' : 'Show password'}
        >
          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      ) : suffix ? (
        <div className="mr-4 flex-shrink-0">{suffix}</div>
      ) : null}
    </div>
  );
}

/* ─── Username field with real backend availability check ─── */
function UsernameField({ value, onChange, disabled }) {
  const [status, setStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'too_short'
  const timerRef = useRef(null);

  useEffect(() => {
    if (!value) { setStatus(null); return; }
    setStatus('checking');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const result = await checkUsername(value);
      setStatus(result); // 'available' | 'taken' | 'too_short' | 'error'
    }, 700);
    return () => clearTimeout(timerRef.current);
  }, [value]);

  const statusEl =
    status === 'checking' ? (
      <span className="flex gap-[3px]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1 h-1 rounded-full bg-white/30"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </span>
    ) : status === 'available' ? (
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1 text-[11px] text-emerald-400"
      >
        <Check className="w-3 h-3" /> Available
      </motion.span>
    ) : status === 'taken' ? (
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1 text-[11px] text-red-400"
      >
        <X className="w-3 h-3" /> Taken
      </motion.span>
    ) : null;

  return (
    <div className="space-y-2">
      <FloatingInput
        label="Username"
        type="text"
        icon={AtSign}
        value={value}
        onChange={onChange}
        suffix={statusEl}
        disabled={disabled}
      />
      <AnimatePresence>
        {value && status && status !== 'checking' && status !== 'too_short' && (
          <motion.div
            key="pill"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] text-white/40 tracking-wide"
          >
            <span className="text-white/20">crossrec.app/</span>
            <span className={status === 'available' ? 'text-white/60' : 'text-white/30'}>
              @{value}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Email field with real-time uniqueness check ─── */
function EmailField({ value, onChange, disabled, onStatusChange }) {
  const [status, setStatus] = useState(null);
  const timerRef = useRef(null);

  const updateStatus = (s) => {
    setStatus(s);
    onStatusChange?.(s);
  };

  useEffect(() => {
    if (!value) { updateStatus(null); return; }
    updateStatus('checking');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const result = await checkEmail(value);
      updateStatus(result);
    }, 700);
    return () => clearTimeout(timerRef.current);
  }, [value]);


  const statusEl =
    status === 'checking' ? (
      <span className="flex gap-[3px]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1 h-1 rounded-full bg-white/30"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </span>
    ) : status === 'available' ? (
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-emerald-400"
      >
        <Check className="w-3.5 h-3.5" />
      </motion.span>
    ) : status === 'taken' ? (
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1 text-[11px] text-red-400"
      >
        <X className="w-3 h-3" /> Already registered
      </motion.span>
    ) : null;

  return (
    <div className="space-y-1">
      <FloatingInput
        label="Email"
        type="email"
        icon={Mail}
        value={value}
        onChange={onChange}
        suffix={statusEl}
        disabled={disabled}
      />
      <AnimatePresence>
        {status === 'taken' && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[11px] text-red-400 pl-1"
          >
            This email is already linked to an account.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Password Strength ─── */
function strengthScore(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const LEVELS = [
  { label: 'Weak',      color: '#ef4444', gradient: 'from-red-500 to-red-400' },
  { label: 'Fair',      color: '#f97316', gradient: 'from-orange-500 to-orange-400' },
  { label: 'Strong',    color: '#a855f7', gradient: 'from-violet-500 to-purple-400' },
  { label: 'Excellent', color: '#22d3ee', gradient: 'from-cyan-400 to-violet-400' },
];

function PasswordStrength({ password }) {
  const score = strengthScore(password);
  const level = LEVELS[Math.max(0, score - 1)];
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSpec = /[^A-Za-z0-9]/.test(password);

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease }}
      className="space-y-2.5 pt-1"
    >
      <div className="flex gap-1.5 items-center">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-[3px] flex-1 rounded-full bg-white/[0.07] overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${score >= n ? level.gradient : ''}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: score >= n ? 1 : 0 }}
              transition={{ duration: 0.35, ease, delay: (n - 1) * 0.04 }}
              style={{ transformOrigin: 'left' }}
            />
          </div>
        ))}
        <motion.span
          key={level.label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] font-medium ml-1"
          style={{ color: level.color }}
        >
          {level.label}
        </motion.span>
      </div>

      <div className="flex gap-4">
        {[
          { ok: hasUpper, label: 'Uppercase' },
          { ok: hasNum, label: 'Number' },
          { ok: hasSpec, label: 'Symbol' },
        ].map(({ ok, label }) => (
          <span
            key={label}
            className={`flex items-center gap-1 text-[11px] transition-colors duration-300 ${
              ok ? 'text-emerald-400' : 'text-white/25'
            }`}
          >
            <Check className={`w-3 h-3 transition-transform duration-300 ${ok ? 'scale-100' : 'scale-75 opacity-40'}`} />
            {label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Inline error/success banner ─── */
function Banner({ type, message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease }}
          className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm border ${
            type === 'error'
              ? 'bg-red-500/[0.08] border-red-500/20 text-red-300'
              : 'bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-300'
          }`}
        >
          {type === 'error' ? (
            <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Main SignUpForm ─── */
export default function SignUpForm() {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const confirmMatch = confirm.length > 0 && confirm === password;
  const confirmMiss  = confirm.length > 0 && confirm !== password;

  const [emailStatus, setEmailStatus] = useState(null);

  const canSubmit =
    !loading &&
    username.length >= 3 &&
    email.length > 0 &&
    emailStatus === 'available' &&
    password.length >= 8 &&
    confirmMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signup({ username, email, password });
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      // Backend returned a JSON error (e.g. duplicate username/email)
      if (err?.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err?.code === 'ERR_NETWORK' || err?.code === 'ECONNREFUSED') {
        setError('Cannot reach the server. Make sure the backend is running on port 8000.');
      } else {
        setError(err?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setSuccess('');
      setLoading(true);
      try {
        const loggedInUser = await googleLogin(tokenResponse.access_token);
        setSuccess(`Welcome, ${loggedInUser.display_name || loggedInUser.username}! Redirecting…`);
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (err) {
        setError(err?.response?.data?.detail ?? 'Google signup failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google signup failed. Please try again.');
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease }}
      className="relative w-full max-w-md"
    >
      <div className="absolute -inset-8 bg-purple-500/[0.07] rounded-[2.5rem] blur-3xl -z-10" />

      <div className="rounded-[1.5rem] border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl p-8 sm:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <motion.form
          variants={stagger}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* heading */}
          <motion.h1
            variants={fadeUp}
            className="text-2xl sm:text-3xl font-medium text-white tracking-[-0.025em] mb-1"
          >
            Create your account.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-white/40 text-sm mb-7 leading-relaxed"
          >
            Join thousands of story lovers discovering recommendations beyond genres.
          </motion.p>

          {/* global error / success */}
          <motion.div variants={fadeUp} className="mb-4">
            <Banner type="error" message={error} />
            <Banner type="success" message={success} />
          </motion.div>

          {/* fields */}
          <motion.div variants={fadeUp} className="space-y-4 mb-5">
            <UsernameField
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              disabled={loading}
            />

            <EmailField
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailStatus(null); setError(''); }}
              disabled={loading}
              onStatusChange={setEmailStatus}
            />

            {/* password + strength */}
            <div className="space-y-2">
              <FloatingInput
                label="Password"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <AnimatePresence>
                {password && <PasswordStrength password={password} />}
              </AnimatePresence>
            </div>

            {/* confirm password */}
            <div className="space-y-1">
              <FloatingInput
                label="Confirm Password"
                type="password"
                icon={Lock}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={loading}
                suffix={
                  confirm.length > 0 ? (
                    <AnimatePresence mode="wait">
                      {confirmMatch ? (
                        <motion.span
                          key="ok"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="text-emerald-400"
                        >
                          <Check className="w-4 h-4" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="no"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  ) : null
                }
              />
              <AnimatePresence>
                {confirmMiss && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] text-red-400 pl-1"
                  >
                    Passwords don't match
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.button
            variants={fadeUp}
            type="submit"
            disabled={!canSubmit}
            whileHover={canSubmit ? { y: -2, boxShadow: '0 12px 36px rgba(139,92,246,0.28)' } : {}}
            whileTap={canSubmit ? { scale: 0.98 } : {}}
            transition={{ duration: 0.2 }}
            className={`group w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium mb-5 transition-all duration-300 ${
              canSubmit
                ? 'bg-gradient-to-b from-white to-white/90 text-black shadow-[0_8px_24px_rgba(255,255,255,0.1)] cursor-pointer'
                : 'bg-white/20 text-white/40 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </motion.button>

          {/* divider */}
          <motion.div variants={fadeUp} className="flex items-center gap-4 mb-5">
            <div className="h-px flex-1 bg-white/[0.07]" />
            <span className="text-[11px] uppercase tracking-wider text-white/20">or</span>
            <div className="h-px flex-1 bg-white/[0.07]" />
          </motion.div>

          {/* Google */}
          <motion.button
            variants={fadeUp}
            type="button"
            onClick={() => handleGoogleLogin()}
            whileHover={{ y: -2, borderColor: 'rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.055)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm font-medium mb-7"
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>

          {/* sign in link */}
          <motion.p variants={fadeUp} className="text-center text-sm text-white/35">
            Already have an account?{' '}
            <a
              href="/login"
              className="relative text-white/75 hover:text-white font-medium transition-colors duration-300 group"
            >
              Sign In
              <span className="absolute -bottom-px left-0 right-0 h-px bg-white/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              {' '}→
            </a>
          </motion.p>
        </motion.form>
      </div>
    </motion.div>
  );
}
