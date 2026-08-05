import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Loader2, X, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MainNavbar from '../components/MainNavbar';
import ContentCard from '../components/dashboard/ContentCard';
import { getLibrary, saveToLibrary, removeFromLibrary } from '../api/user';

const TABS = [
  { id: 'all', label: 'All Items' },
  { id: 'movie', label: 'Movies' },
  { id: 'book', label: 'Books' },
  { id: 'game', label: 'Games' },
  { id: 'song', label: 'Music' }
];

export default function Library() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user?.user_id) {
      loadLibrary();
    }
  }, [user]);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const data = await getLibrary(user.user_id);
      setItems(data);
    } catch (err) {
      console.error("Failed to load library", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async (item) => {
    if (!user?.user_id) return;
    
    // In Library, clicking bookmark means they want to remove it.
    try {
      const itemType = item.type?.toLowerCase();
      await removeFromLibrary(user.user_id, String(item.id), itemType);
      setItems((prev) => prev.filter(i => String(i.id) !== String(item.id)));
      setToast({ message: `Removed from library` });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const filteredItems = items.filter(
    item => activeTab === 'all' || item.type === activeTab
  );

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex flex-col font-sans overflow-x-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/10 via-[#050505] to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/5 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
      </div>

      <MainNavbar />

      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <BookMarked className="w-5 h-5" />
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Your Library</h1>
            </div>
            <p className="text-white/50 text-lg">Your personal collection of saved masterpieces.</p>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                    : 'bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <p className="text-white/40">Loading your collection...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 border border-white/5 rounded-[32px] bg-white/[0.02]">
            <BookMarked className="w-16 h-16 text-white/10 mb-6" />
            <h3 className="text-2xl font-semibold text-white mb-2">Your library is empty</h3>
            <p className="text-white/40 text-center max-w-md">
              When you discover something you love on the Explore or Dashboard pages, click the bookmark icon to save it here.
            </p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
          >
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <ContentCard 
                    item={item} 
                    onSave={handleSaveToggle}
                    savedItems={[item.id]} // it's already saved if it's in the library
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border border-blue-500/30 bg-black/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          >
            <BookMarked className="w-5 h-5 text-blue-400" />
            <p className="text-white text-sm font-medium tracking-wide">
              {toast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
