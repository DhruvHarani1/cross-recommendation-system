import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Film, Gamepad2, BookOpen, Music, Sparkles,
  ThumbsUp, ThumbsDown, ExternalLink, Share2, Info
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1];

const TYPE_ICONS = {
  movie: Film,
  game: Gamepad2,
  book: BookOpen,
  song: Music,
};

const TYPE_COLORS = {
  movie: { border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  game: { border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  book: { border: 'border-orange-500/40', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  song: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
};

export default function ItemModal({ item, onClose, onFeedback }) {
  if (!item) return null;

  const Icon = TYPE_ICONS[item.type] || Film;
  const colors = TYPE_COLORS[item.type] || TYPE_COLORS.movie;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease }}
          className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/15 bg-[#0a0a0c]/90 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Top backdrop banner blur */}
          {item.cover_path && (
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <img
                src={item.cover_path}
                alt=""
                className="w-full h-full object-cover opacity-35 blur-md scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-transparent" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Main content grid */}
          <div className="relative z-10 px-6 sm:px-8 pb-8 -mt-24 sm:-mt-28">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Poster Image */}
              {item.cover_path ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex-shrink-0 w-32 sm:w-40 aspect-[2/3] rounded-2xl overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                >
                  <img src={item.cover_path} alt={item.title} className="w-full h-full object-cover" />
                </motion.div>
              ) : (
                <div className="flex-shrink-0 w-32 sm:w-40 aspect-[2/3] rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                  <Icon className="w-12 h-12 text-white/20" />
                </div>
              )}

              {/* Details */}
              <div className="flex-1 space-y-4 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs uppercase tracking-wider font-semibold ${colors.bg} ${colors.border} ${colors.text}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {item.type}
                  </span>

                  {item.match_score && (
                    <span className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                      {item.match_score}% Match
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight leading-tight">
                    {item.title}
                  </h2>
                  {item.artist && (
                    <p className="text-white/40 text-sm mt-0.5 font-medium">by {item.artist}</p>
                  )}
                </div>

                {/* Explanation Banner */}
                {item.because_explanation && (
                  <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/[0.07] text-purple-200/80 text-xs flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{item.because_explanation}</p>
                  </div>
                )}

                {/* Theme tags */}
                {item.matched_tags?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-white/30">Theme Alignment:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.matched_tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => { onFeedback?.(item, 'like'); onClose(); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition-all duration-300"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Like
                  </button>

                  <button
                    onClick={() => { onFeedback?.(item, 'superlike'); onClose(); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium hover:bg-purple-500/20 transition-all duration-300"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Superlike
                  </button>

                  <button
                    onClick={() => { onFeedback?.(item, 'dislike'); onClose(); }}
                    className="flex items-center justify-center p-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-white/40 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-300"
                    title="Dislike"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
