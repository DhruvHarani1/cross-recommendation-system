import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

/* ─── Full-screen loading spinner ─── */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Animated ring */}
        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-purple-400 animate-spin" />
        <p className="text-white/30 text-sm tracking-wider">Authenticating…</p>
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────────
 * ProtectedRoute
 * Renders children if authenticated.
 * Shows spinner while auth state is loading.
 * Redirects to /login if not authenticated.
 * ──────────────────────────────────────────────── */
export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
