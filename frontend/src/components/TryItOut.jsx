import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Film, Book, Gamepad2, Disc, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  { title: "The Matrix", type: "Film", id: "matrix" },
  { title: "Dune", type: "Book", id: "dune" },
  { title: "Elden Ring", type: "Game", id: "elden" },
];

const STAGES = [
  'Searching...',
  'Analyzing themes...',
  'Finding semantic similarities...',
  'Matching across categories...',
];

const MOCK_RESULTS = {
  matrix: {
    query: { title: "The Matrix", type: "Film", icon: Film, img: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
    matches: [
      { id: 1, title: 'Neuromancer', type: 'Book', match: 98, img: 'https://covers.openlibrary.org/b/isbn/9780441569595-L.jpg', icon: Book, reasons: ['Simulated Reality', 'Rebellion', 'Identity'] },
      { id: 2, title: 'Cyberpunk 2077', type: 'Game', match: 94, img: 'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg', icon: Gamepad2, reasons: ['Dystopia', 'Technology', 'Free Will'] },
      { id: 3, title: 'Mezzanine', type: 'Music', match: 89, img: 'https://upload.wikimedia.org/wikipedia/en/e/e9/Massive_Attack_-_Mezzanine.png', icon: Disc, reasons: ['Dark Atmosphere', 'Paranoia', 'Tension'] },
    ]
  },
  dune: {
    query: { title: "Dune", type: "Book", icon: Book, img: "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg" },
    matches: [
      { id: 1, title: 'Interstellar', type: 'Film', match: 96, img: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', icon: Film, reasons: ['Survival', 'Space Exploration', 'Legacy'] },
      { id: 2, title: 'Mass Effect', type: 'Game', match: 92, img: 'https://media.rawg.io/media/games/34b/34b1f1850a1c06fd971bc6ab3ac0ce0e.jpg', icon: Gamepad2, reasons: ['Politics', 'World Building', 'Destiny'] },
      { id: 3, title: 'Foundation', type: 'Book', match: 95, img: 'https://covers.openlibrary.org/b/isbn/9780553293357-L.jpg', icon: Book, reasons: ['Empire', 'Prophecy', 'Power'] },
    ]
  },
  elden: {
  query: { title: "Elden Ring", type: "Game", icon: Gamepad2, img: 'https://media.rawg.io/media/games/5ec/5ecac5cb026ec26a56efcc546364e348.jpg' },
  matches: [
    { id: 1, title: 'Blade Runner 2049', type: 'Film', match: 93, img: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', icon: Film, reasons: ['Isolation', 'Ruined World', 'Quiet Grandeur'] },
    { id: 2, title: 'Berserk', type: 'Book', match: 97, img: 'https://covers.openlibrary.org/b/isbn/9781593070205-L.jpg', icon: Book, reasons: ['Dark Fantasy', 'Struggle', 'Fate'] },
    { id: 3, title: 'Dark Souls OST', type: 'Music', match: 90, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK7Ove9_6-L058HqfceKWYLJA_YDEe5pG7UGFy8VtJ0zZkIjoC72m4d_o&s=10', icon: Disc, reasons: ['Melancholy', 'Grandeur', 'Ruin'] },
  ]
}
};

export default function TryItOut() {
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [resultId, setResultId] = useState(null);

  useEffect(() => {
    if (!isSearching) return;
    setStageIndex(0);
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 250);
    return () => clearInterval(interval);
  }, [isSearching]);

  const matchTypedValue = () => {
    const found = SUGGESTIONS.find(
      (s) => s.title.toLowerCase() === searchValue.trim().toLowerCase()
    );
    return found?.id ?? null;
  };

  const runSearch = (id) => {
    if (!id) return;
    setIsSearching(true);
    setResultId(null);
    setSearchValue(SUGGESTIONS.find((s) => s.id === id)?.title || searchValue);

    setTimeout(() => {
      setIsSearching(false);
      setResultId(id);
    }, 1100);
  };

  const activeResult = resultId ? MOCK_RESULTS[resultId] : null;
  const QueryIcon = activeResult?.query.icon;

  return (
    <section className="relative w-full bg-[#050505] py-32 px-6 overflow-hidden border-t border-white/[0.05]">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#8b3dff]/[0.05] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#3d6bff]/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-white/30 mb-4 block">
            See Cross Recommendations in Action
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
            Find your next favorite story.
          </h2>
          <br />
          <p className="text-white/45 text-base max-w-xl mx-auto leading-[1.7]">
            Search for anything you already love. Our engine reads its themes
            and finds what connects it to a film, a book, a game, or an album.
          </p>
        </motion.div>

        {/* Search bar */}
        <div className="w-full max-w-2xl mx-auto mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#8b3dff] to-[#3d6bff] rounded-2xl blur-xl opacity-[0.12] group-focus-within:opacity-25 transition-opacity duration-500" />
            <div className="relative flex items-center bg-white/[0.03] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-2 transition-all duration-300 group-focus-within:border-white/[0.25] group-focus-within:bg-white/[0.05]">
              <Search className="w-5 h-5 text-white/40 ml-4" />
              <input
                type="text"
                placeholder="Search for a movie, book, game or album..."
                className="w-full bg-transparent border-none text-white text-base sm:text-lg px-4 py-3 focus:outline-none placeholder:text-white/25"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runSearch(matchTypedValue());
                }}
              />
              <button
                onClick={() => runSearch(matchTypedValue())}
                className="px-6 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,255,255,0.15)] transition-all duration-300 ease-out"
              >
                Match
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <span className="text-white/30 text-sm py-2 px-1">Try:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => runSearch(s.id)}
                className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] text-sm text-white/60 hover:text-white hover:border-white/25 hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(139,61,255,0.1)] transition-all duration-300 ease-out"
              >
                {s.title} <span className="opacity-40 ml-1">({s.type})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results area */}
        <div className="w-full min-h-[480px] flex items-center justify-center relative mt-10">
          <AnimatePresence mode="wait">

            {/* Empty state */}
            {!isSearching && !activeResult && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center text-center px-6"
              >
                <Sparkles className="w-6 h-6 text-white/20 mb-4" strokeWidth={1.5} />
                <p className="text-white/35 text-base max-w-sm leading-relaxed">
                  Start with a movie, book, game or album you already love.
                </p>
              </motion.div>
            )}

            {/* Staged loading */}
            {isSearching && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex flex-col items-center justify-center text-white/50"
              >
                <div className="relative w-10 h-10 mb-5">
                  <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-[#8b3dff] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={stageIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm tracking-wide"
                  >
                    {STAGES[stageIndex]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            )}

            {/* Results */}
            {!isSearching && activeResult && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col items-center"
              >
                {/* Selected item — source node */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex items-center gap-5 mb-10 px-6 py-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_50px_rgba(139,61,255,0.08)]"
                >
                  <div className="w-16 h-22 sm:w-20 sm:h-28 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                    <img src={activeResult.query.img} alt={activeResult.query.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider mb-1.5">
                      {QueryIcon && <QueryIcon className="w-3.5 h-3.5" />}
                      <span>{activeResult.query.type}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-medium text-white tracking-[-0.01em]">
                      {activeResult.query.title}
                    </h3>
                  </div>
                </motion.div>

                {/* Connection line */}
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  style={{ transformOrigin: 'top' }}
                  className="w-px h-14 bg-gradient-to-b from-white/25 via-white/10 to-transparent mb-10"
                />

                {/* Recommendation cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                  {activeResult.matches.map((match, i) => {
                    const Icon = match.icon;
                    return (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.35 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="group relative rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-white/25 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 ease-out"
                      >
                        <div className="aspect-[2/3] w-full overflow-hidden">
                          <img
                            src={match.img}
                            alt={match.title}
                            className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
                        </div>

                        <div className="absolute bottom-0 left-0 w-full p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5 text-white/60 text-xs uppercase tracking-wider">
                              <Icon className="w-3.5 h-3.5" />
                              <span>{match.type}</span>
                            </div>
                            <span className="text-xs font-medium text-white/80">
                              {match.match}% match
                            </span>
                          </div>

                          {/* Match progress bar */}
                          <div className="w-full h-[3px] rounded-full bg-white/10 overflow-hidden mb-4">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${match.match}%` }}
                              transition={{ duration: 0.8, delay: 0.6 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                              className="h-full rounded-full bg-gradient-to-r from-[#8b3dff] to-[#ff3d8b]"
                            />
                          </div>

                          <h3 className="text-lg font-medium text-white tracking-[-0.01em] mb-3">
                            {match.title}
                          </h3>

                          <div className="flex flex-wrap gap-1.5">
                            {match.reasons.map((reason) => (
                              <span
                                key={reason}
                                className="text-[11px] px-2 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/50"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}