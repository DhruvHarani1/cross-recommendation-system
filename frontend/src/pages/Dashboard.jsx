import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Sparkles, Loader2, RefreshCw, ThumbsUp, ThumbsDown,
  Film, Gamepad2, BookOpen, Music
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import AuroraBackground from '../components/auth/AuroraBackground';
import HeroCard from '../components/dashboard/HeroCard';
import ContentRow from '../components/dashboard/ContentRow';
import ExperienceBundleRow from '../components/dashboard/ExperienceBundleRow';
import ItemModal from '../components/dashboard/ItemModal';

const ease = [0.16, 1, 0.3, 1];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Feed', emoji: '✨' },
  { id: 'movie', label: 'Movies', icon: Film, emoji: '🎬' },
  { id: 'game', label: 'Games', icon: Gamepad2, emoji: '🎮' },
  { id: 'book', label: 'Books', icon: BookOpen, emoji: '📚' },
  { id: 'song', label: 'Music', icon: Music, emoji: '🎵' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [feedData, setFeedData] = useState(null);
  const [bundleData, setBundleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Filter & Modal State
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItemModal, setSelectedItemModal] = useState(null);

  const displayName = user?.display_name || user?.username || 'there';

  const fetchFeed = async () => {
    if (!user?.user_id) return;
    if (!feedData) setLoading(true);
    setError('');

    try {
      const res = await api.get(`/users/${user.user_id}/dashboard-feed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedData(res.data);
      if (res.data?.experience_bundle) {
        setBundleData(res.data.experience_bundle);
      }
      setError('');
    } catch (err) {
      console.error('Failed to load dashboard feed:', err);
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : (err?.message || 'Could not load personalized recommendations. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [user]);

  const handleFeedback = async (item, interactionType) => {
    if (!user?.user_id) return;

    try {
      const res = await api.post(`/users/${user.user_id}/feedback`, {
        content_id: item.id,
        content_type: item.type,
        interaction_type: interactionType,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const ackMessage = res.data?.system_acknowledgment || `Feedback recorded for ${item.title}`;
      setToast({ message: ackMessage, type: interactionType });

      setTimeout(() => setToast(null), 3500);

      if (interactionType === 'dislike' && feedData?.sections) {
        setFeedData((prev) => ({
          ...prev,
          sections: prev.sections.map((sec) => ({
            ...sec,
            items: sec.items.filter((i) => i.id !== item.id),
          })),
        }));
      }
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  // Top spotlight item
  const topPicksSection = feedData?.sections?.find((s) => s.id === 'top-picks') || feedData?.sections?.[0];
  const heroItem = topPicksSection?.items?.[0];

  // Filter sections by selected category tab
  const visibleSections = feedData?.sections?.map((sec) => {
    if (activeCategory === 'all') return sec;
    return {
      ...sec,
      items: sec.items.filter((i) => i.type === activeCategory),
    };
  }).filter((sec) => sec.items.length > 0);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex flex-col overflow-x-hidden">
      <AuroraBackground />

      {/* ─── Navbar ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="relative z-20 flex items-center justify-between px-6 sm:px-12 py-6 bg-gradient-to-b from-[#050505] to-transparent"
      >
        <div className="flex items-center gap-6">
          <Link to="/" className="text-[11px] uppercase tracking-[0.42em] text-white/40 font-medium hover:text-white/80 transition-colors">
            CrossRec
          </Link>
          <span className="hidden sm:inline-block w-px h-3 bg-white/10" />
          <span className="hidden sm:inline-block text-xs text-white/30 font-medium">
            Personalized Story Universe
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/[0.12] text-purple-300 text-xs font-medium hover:bg-purple-500/20 hover:border-purple-500/50 shadow-[0_0_16px_rgba(168,85,247,0.15)] transition-all duration-300"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Explore Search
          </button>

          <button
            onClick={() => navigate('/onboarding')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/40 text-xs font-medium hover:text-white/70 hover:border-white/20 transition-all duration-300"
          >
            Update Preferences
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/40 text-xs font-medium hover:text-white/70 hover:border-white/20 transition-all duration-300"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </motion.nav>

      {/* ─── Main Feed Content ─── */}
      <main className="relative z-10 flex-1 px-6 sm:px-12 pb-16 max-w-7xl mx-auto w-full">
        {/* User Greeting Bar + Taste DNA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pt-2"
        >
          <div>
            <p className="text-white/35 text-sm font-light tracking-wide">
              {getGreeting()},
            </p>
            <h1 className="text-3xl sm:text-4xl font-medium text-white tracking-tight">
              {displayName}
            </h1>
          </div>

          {/* Taste tags chips */}
          {feedData?.user?.taste_tags?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-white/25 mr-1 font-semibold">Your Taste DNA:</span>
              {feedData.user.taste_tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full border border-purple-500/25 bg-purple-500/[0.09] text-purple-300/90 text-xs font-medium shadow-[0_0_12px_rgba(168,85,247,0.1)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Category Tabs */}
        {!loading && feedData && (
          <div className="mb-8 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {CATEGORY_TABS.map((tab) => {
                const isSel = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                      isSel
                        ? 'bg-white text-black font-semibold shadow-md'
                        : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{tab.emoji}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/30">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <p className="text-sm font-medium tracking-wide">Building your personalized story universe...</p>
          </div>
        )}

        {/* Error state */}
        {error && !feedData && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={fetchFeed}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        )}

        {/* Feed layout */}
        {!loading && feedData && (
          <div>
            {/* Hero Spotlight Banner */}
            {heroItem && (
              <HeroCard
                item={heroItem}
                onCardClick={(item) => setSelectedItemModal(item)}
                onFeedback={handleFeedback}
              />
            )}

            {/* 4-Domain Curated Experience Bundle */}
            {bundleData && (
              <ExperienceBundleRow
                bundleData={bundleData}
                onCardClick={(item) => setSelectedItemModal(item)}
              />
            )}

            {/* Recommendation Rows */}
            {visibleSections?.map((section, idx) => (
              <ContentRow
                key={section.id || idx}
                title={section.title}
                subtitle={section.subtitle}
                items={section.items}
                delay={0.1 * idx}
                onFeedback={handleFeedback}
                onCardClick={(item) => setSelectedItemModal(item)}
              />
            ))}

            {(!visibleSections || visibleSections.length === 0) && (
              <div className="text-center py-16 text-white/30 text-sm">
                No recommendations match this filter. Try selecting 'All Feed'.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Item Detail Quick-View Modal */}
      {selectedItemModal && (
        <ItemModal
          item={selectedItemModal}
          onClose={() => setSelectedItemModal(null)}
          onFeedback={handleFeedback}
        />
      )}

      {/* Instant Feedback Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-purple-500/30 bg-black/85 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          >
            {toast.type === 'like' && <ThumbsUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'superlike' && <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />}
            {toast.type === 'dislike' && <ThumbsDown className="w-4 h-4 text-red-400 flex-shrink-0" />}
            <p className="text-white/90 text-xs sm:text-sm font-medium tracking-wide">
              {toast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Fade */}
      <div
        className="fixed bottom-0 left-0 right-0 h-24 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, rgba(5,5,5,0.9) 0%, transparent 100%)' }}
      />
    </div>
  );
}
