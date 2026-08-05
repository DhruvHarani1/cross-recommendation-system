import { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Gamepad2, BookOpen, Music, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';

const TYPE_ICONS = {
  movie: Film,
  game: Gamepad2,
  book: BookOpen,
  song: Music,
};

const TYPE_COLORS = {
  movie: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  game: { border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  book: { border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  song: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
};

export default function ContentCard({ item, onFeedback, onCardClick }) {
  const [hovered, setHovered] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  const Icon = TYPE_ICONS[item.type] || Film;
  const colors = TYPE_COLORS[item.type] || TYPE_COLORS.movie;

  const handleAction = (e, type) => {
    e.stopPropagation();
    setActiveFeedback(type);
    if (onFeedback) {
      onFeedback(item, type);
    }
  };

  return (
    <motion.div
      onClick={() => onCardClick?.(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.06, zIndex: 10 }}
      transition={{ duration: 0.25 }}
      className={`relative flex-shrink-0 w-[155px] sm:w-[175px] rounded-xl overflow-hidden border backdrop-blur-md transition-all duration-300 group ${
        activeFeedback === 'like'
          ? 'border-emerald-500/50 bg-emerald-500/[0.04]'
          : activeFeedback === 'superlike'
          ? 'border-purple-500/50 bg-purple-500/[0.04]'
          : activeFeedback === 'dislike'
          ? 'border-red-500/30 opacity-40'
          : 'border-white/[0.06] bg-white/[0.02]'
      }`}
    >
      {/* Cover image */}
      <div className="relative aspect-[2/3] overflow-hidden bg-white/[0.03]">
        {!imgLoaded && item.cover_path && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03] animate-pulse flex items-center justify-center">
            <Icon className="w-8 h-8 text-white/10" />
          </div>
        )}
        {item.cover_path ? (
          <img
            src={item.cover_path}
            alt={item.title}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:brightness-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
            <Icon className="w-10 h-10 text-white/10" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Match score badge */}
        {item.match_score && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 text-emerald-400 text-[10px] font-semibold">
            {item.match_score}%
          </div>
        )}

        {/* Type badge */}
        <div className={`absolute top-2 right-2 p-1.5 rounded-lg ${colors.bg} ${colors.border} border backdrop-blur-sm`}>
          <Icon className={`w-3 h-3 ${colors.text}`} />
        </div>

        {/* Action Overlay (Like / Superlike / Dislike) */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-0 p-3 space-y-2.5 z-20"
          >
            {/* Action buttons bar */}
            <div className="flex items-center justify-center gap-2">
              {/* Like */}
              <button
                type="button"
                onClick={(e) => handleAction(e, 'like')}
                title="Like — show more like this"
                className={`p-2 rounded-full border transition-all duration-200 ${
                  activeFeedback === 'like'
                    ? 'bg-emerald-500 text-white border-emerald-400 scale-110 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'bg-black/60 border-white/20 text-white/70 hover:text-white hover:bg-emerald-500/40 hover:border-emerald-400/60'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              {/* Superlike */}
              <button
                type="button"
                onClick={(e) => handleAction(e, 'superlike')}
                title="Superlike — heavily prioritize this vibe!"
                className={`p-2 rounded-full border transition-all duration-200 ${
                  activeFeedback === 'superlike'
                    ? 'bg-purple-500 text-white border-purple-400 scale-110 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : 'bg-black/60 border-white/20 text-white/70 hover:text-white hover:bg-purple-500/40 hover:border-purple-400/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>

              {/* Dislike */}
              <button
                type="button"
                onClick={(e) => handleAction(e, 'dislike')}
                title="Dislike — show less like this"
                className={`p-2 rounded-full border transition-all duration-200 ${
                  activeFeedback === 'dislike'
                    ? 'bg-red-500 text-white border-red-400 scale-110 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                    : 'bg-black/60 border-white/20 text-white/70 hover:text-white hover:bg-red-500/40 hover:border-red-400/60'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Explanation / Tags */}
            {item.because_explanation && (
              <p className="text-white/60 text-[10px] leading-tight line-clamp-2 text-center">
                {item.because_explanation}
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Title bar */}
      <div className="p-2.5 space-y-0.5">
        <div className="flex items-center justify-between gap-1">
          <p className="text-white/85 text-xs font-medium leading-tight line-clamp-1">
            {item.title}
          </p>
          {activeFeedback && (
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded capitalize ${
              activeFeedback === 'like' ? 'bg-emerald-500/20 text-emerald-300' :
              activeFeedback === 'superlike' ? 'bg-purple-500/20 text-purple-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              {activeFeedback}
            </span>
          )}
        </div>
        {item.artist && (
          <p className="text-white/30 text-[10px] line-clamp-1">{item.artist}</p>
        )}
        <div className="flex items-center gap-1 pt-0.5">
          <Icon className={`w-2.5 h-2.5 ${colors.text}`} />
          <span className="text-white/25 text-[9px] capitalize">{item.type}</span>
        </div>
      </div>
    </motion.div>
  );
}
