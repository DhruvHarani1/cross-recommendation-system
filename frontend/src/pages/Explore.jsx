import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// New Modular Components
import MainNavbar from '../components/MainNavbar';
import ExploreHero from '../components/explore/ExploreHero';
import TrendingSearches from '../components/explore/TrendingSearches';
import MoodSection from '../components/explore/MoodSection';
import CategorySection from '../components/explore/CategorySection';
import HiddenGems from '../components/explore/HiddenGems';
import SurpriseCard from '../components/explore/SurpriseCard';
import RecentSearches from '../components/explore/RecentSearches';
import ContentCard from '../components/dashboard/ContentCard';
import { getLibrary, saveToLibrary, removeFromLibrary } from '../api/user';

export default function Explore() {
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  
  // Library State
  const [savedItems, setSavedItems] = useState([]);
  
  // Recent Searches State
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    // Load recent searches from localStorage
    try {
      const saved = localStorage.getItem('crossrec_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading recent searches', e);
    }

    if (user?.user_id) {
      getLibrary(user.user_id).then(items => {
        setSavedItems(items.map(i => i.id));
      }).catch(console.error);
    }

    if (initialQuery) {
      executeSearch(initialQuery);
    }
  }, []);

  const saveRecentSearch = (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) return;
    const term = searchTerm.trim();
    
    setRecentSearches((prev) => {
      // Remove if already exists to push to front
      const filtered = prev.filter(t => t.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, 10); // Keep top 10
      localStorage.setItem('crossrec_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentSearch = (term) => {
    setRecentSearches((prev) => {
      const updated = prev.filter(t => t !== term);
      localStorage.setItem('crossrec_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('crossrec_recent_searches');
  };

  const executeSearch = async (searchQuery, targetType = 'all') => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    
    setQuery(searchQuery);
    setLoading(true);
    setError('');
    setActiveFilter('all');
    
    saveRecentSearch(searchQuery);

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

  const handleCategorySelect = (categoryId) => {
    // If they click a category without a query, we can't easily "search" nothing via the current API.
    // We'll prompt them to enter a query, or run a generic search.
    const q = query.trim().length >= 2 ? query : 'masterpiece';
    executeSearch(q, categoryId);
  };

  const handleSurprise = () => {
    const surprises = ['Mind bending thriller', 'Cozy wholesome', 'Dark fantasy epic', 'Cyberpunk masterpiece'];
    const random = surprises[Math.floor(Math.random() * surprises.length)];
    executeSearch(random);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchData(null);
    setError('');
    setActiveFilter('all');
    setSearchParams({});
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

  const handleSaveToggle = async (item) => {
    if (!user?.user_id) return;
    const isSaved = savedItems.some(id => String(id) === String(item.id));
    const itemType = item.type?.toLowerCase();
    try {
      if (isSaved) {
        await removeFromLibrary(user.user_id, String(item.id), itemType);
        setSavedItems(prev => prev.filter(id => String(id) !== String(item.id)));
        setToast({ message: "Removed from library", type: "save" });
      } else {
        await saveToLibrary(user.user_id, String(item.id), itemType);
        setSavedItems(prev => [...prev, String(item.id)]);
        setToast({ message: "Saved to library", type: "save" });
      }
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const isSearchActive = searchData || loading || error;

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex flex-col overflow-x-hidden font-sans">
      {/* Premium Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-[#050505] to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
      </div>

      <MainNavbar />

      <main className="relative z-10 flex-1 w-full pb-20">
        <ExploreHero 
          query={query} 
          setQuery={setQuery} 
          onSearch={(q) => executeSearch(q)} 
          loading={loading} 
        />

        <AnimatePresence mode="wait">
          {!isSearchActive ? (
            <motion.div
              key="playground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col gap-8"
            >
              <RecentSearches 
                searches={recentSearches} 
                onSearch={(q) => executeSearch(q)} 
                onClearSearch={removeRecentSearch}
                onClearAll={clearAllRecentSearches}
              />
              <TrendingSearches onSearch={(q) => executeSearch(q)} />
              <MoodSection onSearch={(q) => executeSearch(q)} />
              <CategorySection onSelectCategory={handleCategorySelect} />
              <HiddenGems />
              <SurpriseCard onSurprise={handleSurprise} />
            </motion.div>
          ) : (
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-7xl mx-auto px-6 sm:px-12 pt-8"
            >
              {/* Back to Explore Button */}
              <button 
                onClick={clearSearch}
                className="mb-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Explore
              </button>

              {loading && (
                <div className="flex flex-col items-center justify-center py-32 gap-4 text-white/30">
                  <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                  <p className="text-sm font-medium tracking-wide">Searching the multiverse...</p>
                </div>
              )}

              {error && !loading && (
                <div className="text-center py-32">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-red-400 text-lg">{error}</p>
                </div>
              )}

              {!loading && searchData && (
                <div className="space-y-10">
                  {/* Matched Source Banner */}
                  {searchData.source_title && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-8 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-transparent backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[11px] uppercase tracking-[0.2em] text-purple-300/60 font-semibold block mb-1">
                            Matched Context
                          </span>
                          <h3 className="text-2xl font-bold text-white tracking-tight">{searchData.source_title}</h3>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Results Grid */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                      <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-semibold text-white tracking-tight">
                          Recommendations
                        </h3>
                        <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/50">
                          {searchData.recommendations?.filter(rec => activeFilter === 'all' || rec.type.toLowerCase() === activeFilter.toLowerCase()).length || 0} found
                        </span>
                      </div>

                      {/* Pill Bar Filter */}
                      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-x-auto scrollbar-hide">
                        {['all', 'movie', 'game', 'book', 'song'].map((f) => (
                          <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium tracking-wide transition-all capitalize whitespace-nowrap ${
                              activeFilter === f
                                ? f === 'all' ? 'bg-white/20 text-white shadow-lg'
                                : f === 'movie' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : f === 'game' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                : f === 'book' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'text-white/40 hover:text-white hover:bg-white/10'
                            } border border-transparent`}
                          >
                            {f === 'all' ? 'All' : f + 's'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(() => {
                      const filtered = searchData.recommendations?.filter(rec => activeFilter === 'all' || rec.type.toLowerCase() === activeFilter.toLowerCase()) || [];
                      return filtered.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                          {filtered.map((rec, i) => (
                            <motion.div
                              key={`${rec.type}-${rec.id}-${i}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: i * 0.05 }}
                            >
                              <ContentCard 
                                item={rec} 
                                onFeedback={handleFeedback} 
                                onSave={handleSaveToggle}
                                savedItems={savedItems}
                              />
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-20 text-white/30 text-lg">
                          No {activeFilter !== 'all' ? activeFilter : ''} matches found in this result. Try broadening your search.
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Feedback Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border border-purple-500/30 bg-black/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          >
            <Sparkles className="w-5 h-5 text-purple-400" />
            <p className="text-white text-sm font-medium tracking-wide">
              {toast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
