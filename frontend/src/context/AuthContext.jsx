import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

/* ─── Constants ─── */
const TOKEN_KEY = 'crossrec_access_token';

/* ─── Context ─── */
const AuthContext = createContext(null);

/* ─── Provider ─── */
export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser]           = useState(null);
  const [token, setToken]         = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading]     = useState(true); // true until checkAuth resolves

  /* ── helpers ── */
  const persistToken = (t) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  /* ────────────────────────────────────────────────
   * checkAuth
   * Called once on mount. Validates the stored token
   * against GET /auth/me and hydrates the user state.
   * ──────────────────────────────────────────────── */
  const checkAuth = useCallback(async () => {
    const stored = localStorage.getItem(TOKEN_KEY);

    if (!stored) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${stored}` },
      });
      setUser(res.data);
      setToken(stored);
    } catch {
      // Token is expired or invalid — clean up
      clearSession();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /* ────────────────────────────────────────────────
   * login({ email, password })
   * Calls POST /auth/login, persists the JWT, and
   * stores the user in context.
   * Returns the user object so callers can navigate.
   * ──────────────────────────────────────────────── */
  const login = useCallback(async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: loggedInUser } = res.data;

    persistToken(access_token);
    setUser(loggedInUser);

    return loggedInUser; // caller uses this to e.g. show welcome message
  }, []);

  /* ────────────────────────────────────────────────
   * googleLogin(googleAccessToken)
   * Calls POST /auth/google with Google access token,
   * persists the JWT, and stores the user in context.
   * ──────────────────────────────────────────────── */
  const googleLogin = useCallback(async (googleAccessToken) => {
    const res = await api.post('/auth/google', { access_token: googleAccessToken });
    const { access_token, user: loggedInUser } = res.data;

    persistToken(access_token);
    setUser(loggedInUser);

    return loggedInUser;
  }, []);

  /* ────────────────────────────────────────────────
   * logout()
   * Clears everything and sends the user to /login.
   * ──────────────────────────────────────────────── */
  const logout = useCallback(() => {
    clearSession();
    navigate('/login');
  }, [navigate]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    googleLogin,
    logout,
    checkAuth,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* ────────────────────────────────────────────────
 * useAuth()
 * Custom hook — throws if used outside AuthProvider
 * so bugs surface immediately during development.
 * ──────────────────────────────────────────────── */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
