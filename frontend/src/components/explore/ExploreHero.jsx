import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, X } from 'lucide-react';

export default function ExploreHero({ query, setQuery, onSearch, loading }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative pt-32 pb-16 px-6 sm:px-12 max-w-6xl mx-auto w-full flex flex-col items-center justify-center text-center">
      {/* Background glow when search is focused */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-purple-900/10 radial-gradient-mask pointer-events-none"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <h1 className="text-5xl sm:text-7xl font-semibold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 tracking-tight mb-6">
          Discover your next obsession.
        </h1>
        <p className="text-lg sm:text-xl text-white/50 font-medium max-w-2xl mx-auto mb-12">
          Search movies, books, games, music or simply describe a vibe.
        </p>
      </motion.div>

      {/* Premium Search Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-full max-w-3xl mx-auto"
      >
        <div 
          className={`relative flex items-center p-2 rounded-3xl border transition-all duration-500 bg-white/[0.03] backdrop-blur-2xl ${
            isFocused 
              ? 'border-purple-500/50 shadow-[0_0_80px_-15px_rgba(168,85,247,0.4)] bg-white/[0.06]' 
              : 'border-white/10 shadow-2xl hover:border-white/20 hover:bg-white/[0.05]'
          }`}
        >
          <div className="pl-6 pr-4 text-white/40">
            <Search className={`w-6 h-6 transition-colors duration-300 ${isFocused ? 'text-purple-400' : ''}`} />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
            placeholder="e.g. Space Adventure, Mind Bending, Dark Fantasy..."
            className="w-full bg-transparent text-white text-lg sm:text-xl placeholder-white/30 focus:outline-none py-4"
          />
          
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => setQuery('')}
                className="p-2 mr-2 rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={() => onSearch(query)}
            disabled={loading || !query.trim()}
            className="mr-2 px-8 py-4 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
