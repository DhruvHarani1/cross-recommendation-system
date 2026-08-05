import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const TRENDING = [
  { label: 'Interstellar', type: 'Movie', color: 'from-blue-600/20 to-purple-600/20' },
  { label: 'Harry Potter', type: 'Book', color: 'from-yellow-600/20 to-red-600/20' },
  { label: 'Cyberpunk 2077', type: 'Game', color: 'from-yellow-400/20 to-cyan-500/20' },
  { label: 'Elden Ring', type: 'Game', color: 'from-amber-600/20 to-orange-600/20' },
  { label: 'The Matrix', type: 'Movie', color: 'from-green-600/20 to-emerald-600/20' },
  { label: 'Dune', type: 'Book', color: 'from-orange-600/20 to-amber-700/20' },
];

export default function TrendingSearches({ onSearch }) {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 sm:px-12 py-12">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-semibold text-white tracking-tight">Trending Searches</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {TRENDING.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => onSearch(item.label)}
            className="group cursor-pointer relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/10 hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.1)]"
          >
            {/* Hover Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative z-10">
              <span className="block text-[10px] uppercase tracking-wider text-white/40 font-medium mb-1 group-hover:text-white/60 transition-colors">
                {item.type}
              </span>
              <h3 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                {item.label}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
