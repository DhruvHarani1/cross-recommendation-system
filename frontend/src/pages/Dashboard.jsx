import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getLibrary, saveToLibrary, removeFromLibrary } from '../api/user';
import MainNavbar from '../components/MainNavbar';
import HeroCard from '../components/dashboard/HeroCard';
import ContentRow from '../components/dashboard/ContentRow';
import ExperienceBundleRow from '../components/dashboard/ExperienceBundleRow';
import ItemModal from '../components/dashboard/ItemModal';

const ease = [0.16, 1, 0.3, 1];

// Global cache to prevent re-fetching on navigation
let globalFeedCache = null;
let globalBundleCache = null;
let lastFetchUserId = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function Dashboard() {
  const { user, token } = useAuth();
  
  const [feedData, setFeedData] = useState(null);
  const [bundleData, setBundleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [savedItems, setSavedItems] = useState([]);

  const [selectedItemModal, setSelectedItemModal] = useState(null);

  const fetchFeed = async (forceRefresh = false) => {
    if (!user?.user_id) return;
    
    if (!forceRefresh && globalFeedCache && lastFetchUserId === user.user_id && (Date.now() - lastFetchTime < CACHE_TTL)) {
      setFeedData(globalFeedCache);
      if (globalBundleCache) setBundleData(globalBundleCache);
      setLoading(false);
      return;
    }

    if (!feedData) setLoading(true);
    setError('');

    try {
      const res = await api.get(`/users/${user.user_id}/dashboard-feed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setFeedData(res.data);
      globalFeedCache = res.data;
      
      if (res.data?.experience_bundle) {
        setBundleData(res.data.experience_bundle);
        globalBundleCache = res.data.experience_bundle;
      }
      
      lastFetchUserId = user.user_id;
      lastFetchTime = Date.now();
      
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
    if (user?.user_id) {
      getLibrary(user.user_id).then(items => {
        setSavedItems(items.map(i => i.id));
      }).catch(console.error);
    }
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

  const topPicksSection = feedData?.sections?.find((s) => s.id === 'top-picks') || feedData?.sections?.[0];
  const heroItem = topPicksSection?.items?.[0];

  // We remove the hero item from the first row to avoid duplication
  const processedSections = feedData?.sections?.map((sec, idx) => {
    if (idx === 0 && heroItem && sec.items[0]?.id === heroItem.id) {
      return { ...sec, items: sec.items.slice(1) };
    }
    return sec;
  }).filter(sec => sec.items.length > 0);

  return (
    <div className="relative min-h-screen w-full bg-[#090909] flex flex-col font-sans overflow-x-hidden">
      
      {/* Global Navigation */}
      <MainNavbar />

      <div className="flex-1 max-w-[1400px] w-full mx-auto px-6 pt-24 pb-16 flex gap-8">
        
        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-white/30">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <p className="text-sm tracking-widest uppercase font-semibold">Generating Universe...</p>
            </div>
          )}

          {error && !feedData && (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={fetchFeed}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/20 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
              </button>
            </div>
          )}

          {!loading && feedData && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              {/* Hero Spotlight */}
              {heroItem && (
                <HeroCard
                  item={heroItem}
                  onCardClick={(item) => setSelectedItemModal(item)}
                />
              )}

              {/* Complete the Universe */}
              {bundleData && (
                <ExperienceBundleRow
                  bundleData={bundleData}
                  onCardClick={(item) => setSelectedItemModal(item)}
                  onSave={handleSaveToggle}
                  savedItems={savedItems}
                />
              )}

              {/* Discovery Sections */}
              {processedSections?.map((section, idx) => (
                <ContentRow
                  key={section.id || idx}
                  title={section.title}
                  subtitle={section.subtitle}
                  items={section.items}
                  delay={0.1 * idx}
                  onFeedback={handleFeedback}
                  onCardClick={(item) => setSelectedItemModal(item)}
                  onSave={handleSaveToggle}
                  savedItems={savedItems}
                />
              ))}
            </motion.div>
          )}

        </main>
      </div>

      {/* Modals & Overlays */}
      {selectedItemModal && (
        <ItemModal
          item={selectedItemModal}
          onClose={() => setSelectedItemModal(null)}
          onFeedback={handleFeedback}
        />
      )}

      {/* Toast Notification */}
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

    </div>
  );
}
