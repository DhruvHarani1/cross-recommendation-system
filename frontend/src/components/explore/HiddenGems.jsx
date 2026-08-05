import { useRef } from "react";
import { motion } from "framer-motion";
import { Gem, ChevronLeft, ChevronRight } from "lucide-react";

const HIDDEN_GEMS = [
  {
    id: 1,
    title: "The Prestige",
    type: "Movie",
    poster:
      "https://upload.wikimedia.org/wikipedia/en/d/d2/Prestige_poster.jpg",
  },
  {
    id: 2,
    title: "Disco Elysium",
    type: "Game",
    poster: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.jpg",
  },
  {
    id: 3,
    title: "House of Leaves",
    type: "Book",
    poster: "https://covers.openlibrary.org/b/isbn/9780375703768-L.jpg",
  },
  {
  id: 4,
  title: "Ex Machina",
  type: "Movie",
  poster: "https://upload.wikimedia.org/wikipedia/en/b/ba/Ex-machina-uk-poster.jpg"
},
  {
    id: 5,
    title: "Outer Wilds",
    type: "Game",
    poster: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2e2f.jpg",
  },
  {
    id: 6,
    title: "Piranesi",
    type: "Book",
    poster: "https://covers.openlibrary.org/b/isbn/9781635575637-L.jpg",
  },
];

export default function HiddenGems() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth * 0.8
          : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full max-w-6xl mx-auto px-6 sm:px-12 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight flex items-center gap-3">
            <Gem className="w-6 h-6 text-emerald-400" />
            Hidden Gems
          </h2>
          <p className="text-white/40 text-sm mt-1">
            Underrated masterpieces waiting to be discovered.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative group/carousel">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {HIDDEN_GEMS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="snap-start shrink-0 w-[180px] sm:w-[240px] aspect-[2/3] relative rounded-[20px] overflow-hidden cursor-pointer group shadow-2xl bg-[#0a0a0a]"
            >
              <img
                src={item.poster}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute inset-x-0 bottom-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium mb-1 block">
                  {item.type}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                  {item.title}
                </h3>
              </div>
            </motion.div>
          ))}
          {/* Spacer for padding on mobile right edge */}
          <div className="w-2 shrink-0 sm:hidden" />
        </div>

        {/* Right Gradient Fade */}
        <div className="hidden sm:block absolute right-0 top-0 bottom-8 w-24 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
