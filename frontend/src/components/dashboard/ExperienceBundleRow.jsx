import { motion } from 'framer-motion';
import { Film, Gamepad2, BookOpen, Music, Sparkles } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1];

const TYPE_ICONS = {
  movie: Film,
  game: Gamepad2,
  book: BookOpen,
  song: Music,
};

const DOMAIN_ROLES = {
  movie: 'The Movie to Watch',
  game: 'The Game to Live In',
  book: 'The Book to Read Deeper',
  song: 'The Soundtrack for the Vibe',
};

export default function ExperienceBundleRow({ bundleData, onCardClick }) {
  if (!bundleData || !bundleData.experience_bundle) return null;

  const { source_item, experience_bundle } = bundleData;
  const items = Object.entries(experience_bundle).map(([type, data]) => ({
    ...data,
    type,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease }}
      className="mb-12 p-6 sm:p-8 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.06] via-white/[0.01] to-transparent backdrop-blur-xl relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] uppercase tracking-wider font-semibold mb-2">
            <Sparkles className="w-3 h-3" />
            Curated Experience Bundle
          </span>
          <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight">
            Complete the Universe of {source_item?.title || 'Your Taste'}
          </h3>
          <p className="text-white/30 text-xs mt-0.5">
            4 media formats connected by the exact same thematic DNA
          </p>
        </div>
      </div>

      {/* 4-Domain Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item, idx) => {
          const Icon = TYPE_ICONS[item.type] || Film;
          const role = DOMAIN_ROLES[item.type] || item.type;

          return (
            <motion.div
              key={`${item.type}-${item.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease }}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => onCardClick?.(item)}
              className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-3.5 flex flex-col justify-between cursor-pointer group hover:border-purple-500/40 transition-all duration-300"
            >
              {/* Top role pill */}
              <div className="flex items-center justify-between gap-1 mb-3">
                <span className="text-[9px] uppercase tracking-wider text-white/40 line-clamp-1 font-medium">
                  {role}
                </span>
                <Icon className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              </div>

              {/* Poster + details */}
              <div className="space-y-3">
                <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 relative">
                  {item.cover_path ? (
                    <img src={item.cover_path} alt={item.title} className="w-full h-full object-cover group-hover:brightness-110 transition-all" />
                  ) : (
                    <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white/15" />
                    </div>
                  )}
                  {item.match_score && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-emerald-400 text-[9px] font-semibold">
                      {item.match_score}%
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-white/85 text-xs font-medium leading-tight line-clamp-1 group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </h4>
                  {item.artist && (
                    <p className="text-white/30 text-[10px] line-clamp-1">{item.artist}</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
