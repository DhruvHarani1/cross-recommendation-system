import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Sparkles, Film, Gamepad2, BookOpen, Music, Bookmark, ArrowRight } from 'lucide-react';

const TYPE_ICONS = {
  movie: Film,
  game: Gamepad2,
  book: BookOpen,
  song: Music,
};

const ease = [0.16, 1, 0.3, 1];

export default function HeroCard({ item, onCardClick, onSave, savedItems = [] }) {
  const [showExplanation, setShowExplanation] = useState(false);

  if (!item) return null;

  const isSaved = savedItems.some(id => String(id) === String(item.id));
  const Icon = TYPE_ICONS[item.type] || Film;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease }}
      className="relative w-full rounded-[24px] overflow-hidden mb-12 shadow-[0_30px_90px_rgba(0,0,0,0.6)] group"
      style={{ minHeight: '480px' }}
    >
      {/* Background Poster */}
      {item.cover_path && (
        <div className="absolute inset-0">
          <img
            src={item.cover_path}
            alt={item.title}
            className="w-full h-full object-cover object-top opacity-80 group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
          />
          {/* Gradients to blend into background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#090909] via-[#090909]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/40 to-transparent opacity-90" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end p-8 sm:p-14 h-full" style={{ minHeight: '480px' }}>
        <div className="max-w-2xl space-y-5">
          
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-[10px] tracking-wider uppercase shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Featured Universe
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 font-semibold text-[10px] tracking-wider uppercase">
              <Icon className="w-3 h-3" />
              {item.type}
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.1]">
            {item.title}
          </h2>

          <div className="flex items-center gap-3">
            {item.match_score && (
              <span className="text-emerald-400 font-semibold text-sm">
                {item.match_score}% Match
              </span>
            )}
            
            {/* Show tags on hero */}
            {item.matched_tags?.length > 0 && (
              <div className="hidden sm:flex gap-2">
                {item.matched_tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-white/40 text-sm">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Animated Explanation */}
          <AnimatePresence>
            {showExplanation && item.because_explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-md">
                  <p className="text-purple-200/90 text-sm md:text-base leading-relaxed flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    "{item.because_explanation}"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onCardClick?.(item)}
              className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-semibold rounded-full hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              <Play className="w-4 h-4 fill-black" />
              Explore
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {item.because_explanation && (
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-full backdrop-blur-md border font-semibold text-sm transition-all duration-300 ${
                  showExplanation 
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-200'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30'
                }`}
              >
                <Info className="w-4 h-4" />
                {showExplanation ? 'Hide Reason' : 'Why Recommended'}
              </button>
            )}

            {onSave && (
              <button
                onClick={(e) => { e.stopPropagation(); onSave?.(item); }}
                className={`flex items-center justify-center p-3.5 rounded-full backdrop-blur-md border transition-all duration-300 ${
                  isSaved 
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30'
                }`}
                title={isSaved ? "Saved to Library" : "Save to Library"}
              >
                <Bookmark className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
