import { motion } from 'framer-motion';
import { History, X, Search } from 'lucide-react';

export default function RecentSearches({ searches, onSearch, onClearSearch, onClearAll }) {
  if (!searches || searches.length === 0) return null;

  return (
    <section className="w-full max-w-6xl mx-auto px-6 sm:px-12 py-12 border-t border-white/5">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-white/40" />
          <h2 className="text-xl font-semibold text-white/80 tracking-tight">Recent Searches</h2>
        </div>
        <button 
          onClick={onClearAll}
          className="text-xs text-white/30 hover:text-red-400 transition-colors uppercase tracking-wider font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {searches.map((query, idx) => (
          <motion.div
            key={`${query}-${idx}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="snap-start shrink-0 group flex items-center bg-white/[0.03] border border-white/5 rounded-2xl p-2 pr-4 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 cursor-pointer"
            onClick={() => onSearch(query)}
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mr-4 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
              <Search className="w-4 h-4 text-white/40 group-hover:text-purple-400 transition-colors" />
            </div>
            <span className="text-sm font-medium text-white/80 whitespace-nowrap mr-6 group-hover:text-white transition-colors">
              {query}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClearSearch(query);
              }}
              className="p-1.5 rounded-full text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
