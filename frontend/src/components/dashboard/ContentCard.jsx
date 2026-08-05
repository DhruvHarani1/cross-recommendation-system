import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Gamepad2, BookOpen, Music, Heart, Star, X, Sparkles, Bookmark } from 'lucide-react';

const TYPE_ICONS = {
  movie: Film,
  game: Gamepad2,
  book: BookOpen,
  song: Music,
};

const getBadge = (item) => {
  if (item.match_score >= 92) return { text: 'Excellent Match', color: 'bg-emerald-500/90' };
  if (item.because_explanation && item.because_explanation.toLowerCase().includes('because')) return { text: 'Because You Liked', color: 'bg-purple-500/90' };
  if (item.match_score >= 80) return { text: 'Recommended', color: 'bg-blue-500/90' };
  return { text: 'Trending', color: 'bg-orange-500/90' };
};

export default function ContentCard({ item, onFeedback, onCardClick, onSave, savedItems = [] }) {
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const Icon = TYPE_ICONS[item.type?.toLowerCase()] || Film;
  const badge = getBadge(item);
  const isSaved = savedItems.some(id => String(id) === String(item.id));

  return (
    <motion.div
      onClick={() => onCardClick?.(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -8 }}
      className="relative flex-shrink-0 w-[160px] sm:w-[200px] rounded-[18px] overflow-hidden cursor-pointer group transition-all duration-500 hover:shadow-[0_20px_40px_rgba(139,92,246,0.15)]"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full bg-[#111] overflow-hidden rounded-[18px]">
        {/* Placeholder skeleton */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-white/[0.02] animate-pulse flex items-center justify-center">
            <Icon className="w-8 h-8 text-white/10" />
          </div>
        )}
        
        {item.cover_path ? (
          <img
            src={item.cover_path}
            alt={item.title}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-[#111] flex items-center justify-center">
            <Icon className="w-10 h-10 text-white/20" />
          </div>
        )}

        {/* Dark gradient at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/20 to-transparent opacity-80" />

        {/* Hover glass overlay */}
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Recommendation Badge (Single) */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase text-white shadow-lg ${badge.color}`}>
            {badge.text}
          </span>
        </div>

        {/* Hover Action Buttons */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center gap-3 z-20"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onFeedback?.(item, 'dislike'); }}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-red-500 hover:border-red-500 transition-all duration-200 shadow-lg hover:scale-110"
                title="Not Interested"
              >
                <X className="w-4 h-4" />
              </button>
              
              <button
                onClick={(e) => { e.stopPropagation(); onFeedback?.(item, 'like'); }}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-200 shadow-lg hover:scale-110"
                title="Like"
              >
                <Heart className="w-5 h-5" />
              </button>
              
              <button
                onClick={(e) => { e.stopPropagation(); onFeedback?.(item, 'superlike'); }}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-purple-500 hover:border-purple-500 transition-all duration-200 shadow-lg hover:scale-110"
                title="Super Like"
              >
                <Star className="w-4 h-4" />
              </button>
              
              <button
                onClick={(e) => { e.stopPropagation(); onSave?.(item); }}
                className={`w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 ${isSaved ? 'text-blue-400 border-blue-400 bg-blue-500/20' : 'text-white hover:bg-blue-500 hover:border-blue-500'}`}
                title={isSaved ? "Saved to Library" : "Save to Library"}
              >
                <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Area (Always visible, inside the poster bounds) */}
        <div className="absolute bottom-0 inset-x-0 p-4 z-10">
          <div className="flex items-center gap-1.5 text-white/60 mb-1">
            <Icon className="w-3 h-3" />
            <span className="text-[10px] font-medium tracking-widest uppercase">{item.type}</span>
          </div>
          <h3 className="text-white font-semibold text-sm sm:text-base leading-tight line-clamp-2">
            {item.title}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}
