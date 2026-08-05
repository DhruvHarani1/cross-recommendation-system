import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Film, Gamepad2, BookOpen, Music,
  ArrowRight, ArrowLeft, Search, Sparkles,
  Check, Loader2, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import AuroraBackground from '../components/auth/AuroraBackground';

const ease = [0.16, 1, 0.3, 1];

const CONTENT_TYPES = [
  { id: 'movie', label: 'Movies', icon: Film, color: '#a855f7', gradient: 'from-purple-500 to-violet-600', emoji: '🎬' },
  { id: 'game', label: 'Games', icon: Gamepad2, color: '#22d3ee', gradient: 'from-cyan-400 to-blue-500', emoji: '🎮' },
  { id: 'book', label: 'Books', icon: BookOpen, color: '#f97316', gradient: 'from-orange-400 to-amber-500', emoji: '📚' },
  { id: 'song', label: 'Music', icon: Music, color: '#34d399', gradient: 'from-emerald-400 to-green-500', emoji: '🎵' },
];

const KEYWORD_PRESETS = [
  'sci-fi', 'dark fantasy', 'horror', 'adventure', 'mystery',
  'romance', 'action', 'survival', 'philosophical', 'cozy',
  'dystopian', 'epic', 'comedy', 'thriller', 'puzzle',
  'magical', 'noir', 'cyberpunk', 'historical', 'psychological',
];

/* ─── Step Indicator ─── */
function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <motion.div
            animate={{
              width: i === current ? 40 : 10,
              backgroundColor: i <= current ? 'rgba(168,85,247,0.8)' : 'rgba(255,255,255,0.1)',
            }}
            transition={{ duration: 0.4, ease }}
            className="h-[3px] rounded-full"
          />
        </div>
      ))}
      <span className="ml-3 text-[11px] text-white/25 tracking-wider uppercase">
        {current + 1} / {total}
      </span>
    </div>
  );
}

/* ─── Step 1: Content Type Picker ─── */
function TypePicker({ selected, onToggle }) {
  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="text-3xl sm:text-4xl font-medium text-white tracking-tight mb-3"
      >
        What do you love?
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease }}
        className="text-white/40 text-base mb-10 max-w-md"
      >
        Pick the types of media you enjoy most. We'll tailor your experience around these.
      </motion.p>

      <div className="grid grid-cols-2 gap-4">
        {CONTENT_TYPES.map((ct, i) => {
          const isSelected = selected.includes(ct.id);
          const Icon = ct.icon;
          return (
            <motion.button
              key={ct.id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onToggle(ct.id)}
              className={`relative flex flex-col items-center justify-center gap-3 py-8 px-4 rounded-2xl border backdrop-blur-md transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'border-purple-500/40 bg-purple-500/[0.12] shadow-[0_0_30px_rgba(168,85,247,0.15)]'
                  : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
              }`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
              <span className="text-3xl">{ct.emoji}</span>
              <span className={`text-sm font-medium tracking-wide ${isSelected ? 'text-white' : 'text-white/50'}`}>
                {ct.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Step 2: Item Picker ─── */
function ItemPicker({ selectedTypes, selectedAnchors, onToggleAnchor }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // Load popular items initially
  useEffect(() => {
    loadPopular();
  }, [selectedTypes]);

  const loadPopular = async () => {
    setLoading(true);
    try {
      const promises = selectedTypes.map((t) =>
        api.get(`/content/popular?type=${t}&limit=6`)
      );
      const results = await Promise.all(promises);
      const allItems = results.flatMap((r) => r.data.results || []);
      setItems(allItems);
    } catch {
      // Fallback: empty
    } finally {
      setLoading(false);
    }
  };

  const searchItems = async (q) => {
    if (q.length < 2) {
      loadPopular();
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/content/search?q=${encodeURIComponent(q)}&limit=16`);
      setItems(res.data.results || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (val) => {
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchItems(val), 400);
  };

  const isSelected = (item) =>
    selectedAnchors.some((a) => a.content_id === item.content_id && a.content_type === item.content_type);

  const typeIcon = (t) => {
    const map = { movie: Film, game: Gamepad2, book: BookOpen, song: Music };
    return map[t] || Film;
  };

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="text-3xl sm:text-4xl font-medium text-white tracking-tight mb-3"
      >
        Pick your favorites
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease }}
        className="text-white/40 text-base mb-6 max-w-md"
      >
        Choose 3–5 items you love. This helps us understand your taste.
      </motion.p>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease }}
        className="relative mb-6"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by title..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/25 focus:shadow-[0_0_0_1px_rgba(139,92,246,0.25)] transition-all duration-300"
        />
        {selectedAnchors.length > 0 && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-purple-400 font-medium">
            {selectedAnchors.length} selected
          </span>
        )}
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
        {loading && items.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-12 text-white/25 text-sm">
            No items found. Try a different search.
          </div>
        ) : (
          items.map((item, i) => {
            const sel = isSelected(item);
            const TypeIcon = typeIcon(item.content_type);
            return (
              <motion.button
                key={`${item.content_type}-${item.content_id}`}
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleAnchor(item)}
                className={`relative group rounded-xl overflow-hidden border transition-all duration-300 aspect-[2/3] ${
                  sel
                    ? 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)] ring-2 ring-purple-500/30'
                    : 'border-white/[0.06] hover:border-white/15'
                }`}
              >
                {item.cover_path ? (
                  <img
                    src={item.cover_path}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-all duration-300 ${sel ? 'brightness-75' : 'brightness-90 group-hover:brightness-100'}`}
                  />
                ) : (
                  <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                    <TypeIcon className="w-8 h-8 text-white/15" />
                  </div>
                )}

                {/* Bottom gradient + title */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                  <p className="text-[10px] text-white/70 leading-tight line-clamp-2">{item.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <TypeIcon className="w-2.5 h-2.5 text-white/30" />
                    <span className="text-[9px] text-white/30 capitalize">{item.content_type}</span>
                  </div>
                </div>

                {/* Checkmark */}
                {sel && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ─── Step 3: Keyword Tags ─── */
function KeywordPicker({ selected, onToggle, customKeyword, onCustomChange, onAddCustom }) {
  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="text-3xl sm:text-4xl font-medium text-white tracking-tight mb-3"
      >
        Describe your vibe
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease }}
        className="text-white/40 text-base mb-8 max-w-md"
      >
        Pick themes and moods that resonate with you. We'll use these to find hidden gems.
      </motion.p>

      {/* Custom keyword input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease }}
        className="flex gap-2 mb-6"
      >
        <input
          type="text"
          value={customKeyword}
          onChange={(e) => onCustomChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAddCustom()}
          placeholder="Add your own keyword..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/25 transition-all duration-300"
        />
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddCustom}
          disabled={!customKeyword.trim()}
          className="px-4 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
        >
          Add
        </motion.button>
      </motion.div>

      {/* Preset chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        {KEYWORD_PRESETS.map((kw, i) => {
          const isSel = selected.includes(kw);
          return (
            <motion.button
              key={kw}
              type="button"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.02 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onToggle(kw)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
                isSel
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                  : 'bg-white/[0.02] border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/15'
              }`}
            >
              {isSel && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
              {kw}
            </motion.button>
          );
        })}

        {/* Custom keywords that aren't presets */}
        {selected
          .filter((kw) => !KEYWORD_PRESETS.includes(kw))
          .map((kw) => (
            <motion.button
              key={kw}
              type="button"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onToggle(kw)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium border bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
            >
              <Check className="w-3 h-3 inline mr-1 -mt-0.5" />
              {kw}
              <X className="w-3 h-3 inline ml-1 -mt-0.5" />
            </motion.button>
          ))}
      </motion.div>
    </div>
  );
}

/* ─── Main Onboarding Page ─── */
export default function Onboarding() {
  const navigate = useNavigate();
  const { user, token, checkAuth } = useAuth();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 state
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Step 2 state
  const [selectedAnchors, setSelectedAnchors] = useState([]);

  // Step 3 state
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [customKeyword, setCustomKeyword] = useState('');

  const toggleType = (id) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleAnchor = (item) => {
    setSelectedAnchors((prev) => {
      const exists = prev.some(
        (a) => a.content_id === item.content_id && a.content_type === item.content_type
      );
      if (exists) {
        return prev.filter(
          (a) => !(a.content_id === item.content_id && a.content_type === item.content_type)
        );
      }
      return [...prev, { content_id: item.content_id, content_type: item.content_type }];
    });
  };

  const toggleKeyword = (kw) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  };

  const addCustomKeyword = () => {
    const kw = customKeyword.trim().toLowerCase();
    if (kw && !selectedKeywords.includes(kw)) {
      setSelectedKeywords((prev) => [...prev, kw]);
      setCustomKeyword('');
    }
  };

  const canProceed = () => {
    if (step === 0) return selectedTypes.length >= 1;
    if (step === 1) return selectedAnchors.length >= 1;
    if (step === 2) return selectedKeywords.length >= 1;
    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/users/${user.user_id}/onboard-preferences`, {
        favorite_types: selectedTypes,
        keywords: selectedKeywords,
        anchors: selectedAnchors,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh auth context to get updated is_onboarded
      await checkAuth();
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding failed:', err);
      // Still navigate — onboarding data may have been partially saved
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex items-center justify-center overflow-hidden">
      <AuroraBackground />

      <div className="relative z-10 w-full max-w-lg px-6 py-12">
        <StepIndicator current={step} total={3} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease }}
          >
            {step === 0 && (
              <TypePicker selected={selectedTypes} onToggle={toggleType} />
            )}
            {step === 1 && (
              <ItemPicker
                selectedTypes={selectedTypes}
                selectedAnchors={selectedAnchors}
                onToggleAnchor={toggleAnchor}
              />
            )}
            {step === 2 && (
              <KeywordPicker
                selected={selectedKeywords}
                onToggle={toggleKeyword}
                customKeyword={customKeyword}
                onCustomChange={setCustomKeyword}
                onAddCustom={addCustomKeyword}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mt-10"
        >
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              step === 0
                ? 'text-white/15 cursor-not-allowed'
                : 'text-white/50 hover:text-white/80 border border-white/[0.08] hover:border-white/20'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <motion.button
            type="button"
            onClick={handleNext}
            disabled={!canProceed() || submitting}
            whileHover={canProceed() ? { y: -2, boxShadow: '0 8px 32px rgba(139,92,246,0.25)' } : {}}
            whileTap={canProceed() ? { scale: 0.97 } : {}}
            className={`flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              canProceed() && !submitting
                ? 'bg-gradient-to-b from-white to-white/90 text-black shadow-[0_8px_24px_rgba(255,255,255,0.1)] cursor-pointer'
                : 'bg-white/15 text-white/30 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up...
              </>
            ) : step === 2 ? (
              <>
                <Sparkles className="w-4 h-4" />
                Launch My Feed
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
