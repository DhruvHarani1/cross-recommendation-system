import { motion } from 'framer-motion';
import { Sparkles, Film, Gamepad2, BookOpen, Music, ThumbsUp, Info, Play } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1];

const TYPE_ICONS = {
  movie: Film,
  game: Gamepad2,
  book: BookOpen,
  song: Music,
};

const TYPE_COLORS = {
  movie: 'text-purple-400',
  game: 'text-cyan-400',
  book: 'text-orange-400',
  song: 'text-emerald-400',
};

export default function HeroCard({ item, onCardClick, onFeedback }) {
  if (!item) return null;

  const Icon = TYPE_ICONS[item.type] || Film;
  const typeColor = TYPE_COLORS[item.type] || 'text-white/60';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease }}
      className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-purple-900/10 via-black to-black mb-10 shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
      style={{ minHeight: '360px' }}
    >
      {/* Ambient Backdrop Blur */}
      {item.cover_path && (
        <div className="absolute inset-0">
          <img
            src={item.cover_path}
            alt=""
            className="w-full h-full object-cover opacity-35 blur-xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex items-end p-8 sm:p-12" style={{ minHeight: '360px' }}>
        <div className="flex gap-8 items-center sm:items-end w-full">
          {/* Poster */}
          {item.cover_path && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
              onClick={() => onCardClick?.(item)}
              className="hidden sm:block flex-shrink-0 w-[160px] h-[235px] rounded-2xl overflow-hidden border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.6)] cursor-pointer group hover:border-purple-500/40 transition-all duration-300"
            >
              <img src={item.cover_path} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </motion.div>
          )}

          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/40 bg-purple-500/15 text-purple-300 text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <Sparkles className="w-3.5 h-3.5" />
                #1 Spotlight Recommendation
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider ${typeColor}`}>
                <Icon className="w-3.5 h-3.5" />
                {item.type}
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-medium text-white tracking-tight leading-tight">
              {item.title}
            </h2>

            {item.because_explanation && (
              <p className="text-white/50 text-sm sm:text-base max-w-lg leading-relaxed">
                {item.because_explanation}
              </p>
            )}

            {item.match_score && (
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  {item.match_score}% Compatibility Match
                </span>
                {item.matched_tags?.length > 0 && (
                  <div className="flex gap-1.5">
                    {item.matched_tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.09] text-white/50 text-[11px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onCardClick?.(item)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs font-semibold shadow-lg hover:brightness-110 transition-all duration-300"
              >
                <Info className="w-4 h-4" />
                View Details
              </button>

              <button
                onClick={() => onFeedback?.(item, 'superlike')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-md text-white/80 text-xs font-medium hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Superlike
              </button>

              <button
                onClick={() => onFeedback?.(item, 'like')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-md text-white/80 text-xs font-medium hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                Like
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
