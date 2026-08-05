import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Film, Gamepad2, BookOpen, Music, Sparkles,
  ArrowLeft, Loader2, X, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import AuroraBackground from '../components/auth/AuroraBackground';
import ContentCard from '../components/dashboard/ContentCard';

const ease = [0.16, 1, 0.3, 1];

const PROMPT_CHIPS = [
  { label: 'The Matrix', query: 'The Matrix', type: 'movie' },
  { label: 'Cyberpunk Dystopia', query: 'cyberpunk dystopian rebellion free will', type: null },
  { label: 'Elden Ring', query: 'Elden Ring', type: 'game' },
  { label: 'Dark Fantasy & Magic', query: 'dark fantasy dragons magic ancient mystery', type: null },
  { label: 'Dune', query: 'Dune', type: 'book' },
  { label: 'Cozy Slice of Life', query: 'cozy relaxing wholesome gentle warm', type: null },
];

const MEDIA_FILTERS = [
  { id: 'all', label: 'All Media', emoji: '✨' },
  { id: 'movie', label: 'Movies', icon: Film, emoji: '🎬' },
  { id: 'game', label: 'Games', icon: Gamepad2, emoji: '🎮' },
  { id: 'book', label: 'Books', icon: BookOpen, emoji: '📚' },
  { id: 'song', label: 'Music', icon: Music, emoji: '🎵' },
];

export default function Explore() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const debounceRef = useRef(null);

  const executeSearch = async (searchQuery, targetType = 'all') => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    setLoading(true);
    setError('');

    try {
      let url = `/recommendations/search?q=${encodeURIComponent(searchQuery.trim())}&limit=12`;
      if (targetType && targetType !== 'all') {
        url += `&target_types=${targetType}`;
      }

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchData(res.data);
      setSearchParams({ q: searchQuery });
    } catch (err) {
      console.error('Search error:', err);
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'No recommendations found matching your query. Try a different term.';
      setError(msg);
      setSearchData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery, selectedType);
    }
  }, []);

  const handleInputChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        executeSearch(val, selectedType);
      }, 500);
    }
  };

  const handlePromptClick = (chip) => {
    setQuery(chip.query);
    executeSearch(chip.query, selectedType);
  };

  const handleFilterChange = (typeId) => {
    setSelectedType(typeId);
    if (query.trim().length >= 2) {
      executeSearch(query, typeId);
    }
  };

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
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

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
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/50 text-xs font-medium hover:text-white hover:border-white/20 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs uppercase tracking-[0.3em] text-white/40 font-medium">
            Cross-Domain Search & Discover
          </span>
        </div>
      </motion.nav>

      {/* ─── Search Hero ─── */}
      <main className="relative z-10 flex-1 px-6 sm:px-12 pb-20 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="text-center max-w-2xl mx-auto mb-10 pt-4"
        >
          <h1 className="text-4xl sm:text-5xl font-medium text-white tracking-tight mb-3">
            Search by feeling.
          </h1>
          <p className="text-white/40 text-base leading-relaxed">
            Type any title, concept, or vibe. CrossRec finds connected stories across film, games, books, and music.
          </p>
        </motion.div>

        {/* Large Search Input */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="relative max-w-2xl mx-auto mb-6"
        >
          <div className="relative flex items-center rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300 focus-within:border-purple-500/40 focus-within:shadow-[0_0_40px_rgba(168,85,247,0.2)]">
            <Search className="w-5 h-5 text-white/30 ml-5 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeSearch(query, selectedType)}
              placeholder="e.g. The Matrix, dark cyberpunk, or mind bending time travel..."
              className="w-full px-4 py-4 bg-transparent text-white text-base placeholder-white/25 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSearchData(null); }}
                className="mr-3 p-1 rounded-full text-white/30 hover:text-white/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => executeSearch(query, selectedType)}
              disabled={loading || !query.trim()}
              className="mr-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs font-medium shadow-md hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Explore'}
            </button>
          </div>
        </motion.div>

        {/* Prompt Suggestion Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto mb-10"
        >
          <span className="text-[11px] text-white/25 uppercase tracking-wider mr-1">Try searching:</span>
          {PROMPT_CHIPS.map((chip) => (
            <motion.button
              key={chip.label}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePromptClick(chip)}
              className="px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md text-white/40 text-xs font-medium hover:text-white/80 hover:border-white/20 transition-all duration-300"
            >
              ✨ {chip.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Media Type Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex p-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md">
            {MEDIA_FILTERS.map((f) => {
              const active = selectedType === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFilterChange(f.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                    active
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_16px_rgba(168,85,247,0.15)]'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <span>{f.emoji}</span>
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/30">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <p className="text-sm tracking-wide">Searching across mediums & mapping semantic themes...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16 text-red-400 text-sm max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* Search Results Display */}
        {!loading && searchData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="space-y-10"
          >
            {/* Matched Source Item Banner */}
            {searchData.source_title && (
              <div className="p-6 rounded-2xl border border-purple-500/20 bg-purple-500/[0.06] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-purple-300/60 font-medium">Matched Query Source</span>
                    <h3 className="text-xl font-medium text-white tracking-tight">{searchData.source_title}</h3>
                  </div>
                </div>
                <span className="text-xs text-white/35">
                  Showing cross-domain recommendations
                </span>
              </div>
            )}

            {/* Results Grid */}
            <div>
              <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-xl font-medium text-white tracking-tight">
                  Cross-Medium Recommendations
                </h3>
                <span className="text-xs text-white/30">
                  {searchData.recommendations?.length || 0} matches found
                </span>
              </div>

              {searchData.recommendations?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {searchData.recommendations.map((rec, i) => (
                    <motion.div
                      key={`${rec.type}-${rec.id}-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <ContentCard item={rec} onFeedback={handleFeedback} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-white/30 text-sm">
                  No recommendations found for this specific filter. Try selecting 'All Media'.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* Feedback Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-purple-500/30 bg-black/85 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          >
            <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <p className="text-white/90 text-xs sm:text-sm font-medium tracking-wide">
              {toast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
