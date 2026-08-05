import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PANELS = [
  {
    id: 'movies',
    title: 'Movies',
    tagline: 'Discover unforgettable cinema.',
    images: [
      'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
      'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    ],
  },
  {
    id: 'books',
    title: 'Books',
    tagline: 'Stories that stay with you.',
    images: [
      'https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg',
      'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg',
      'https://covers.openlibrary.org/b/isbn/9780765316871-L.jpg',
    ],
  },
  {
    id: 'games',
    title: 'Games',
    tagline: 'Play incredible worlds.',
    images: [
      'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg',
      'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg',
      'https://media.rawg.io/media/games/5ec/5ecac5cb026ec26a56efcc546364e348.jpg',
    ],
  },
  {
    id: 'music',
    title: 'Music',
    tagline: 'Soundtracks for every moment.',
    images: [
      'https://upload.wikimedia.org/wikipedia/en/e/e9/Massive_Attack_-_Mezzanine.png',
      'https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png',
      'https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg',
    ],
  },
];

export default function Step1Categories({ selected, onChange, onNext }) {
  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((c) => c !== id) : [...selected, id]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight text-white">
          What do you love?
        </h1>
        <p className="text-[#9E9E9E] text-lg">Choose the worlds you enjoy exploring.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 flex-grow">
        {PANELS.map((panel, i) => {
          const isSelected = selected.includes(panel.id);
          return (
            <motion.div
              key={panel.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              onClick={() => toggle(panel.id)}
              className={`group relative cursor-pointer rounded-2xl overflow-hidden h-44 sm:h-52 border transition-all duration-300 ${
                isSelected ? 'border-[#8B3DFF]/60' : 'border-white/[0.08] hover:border-white/[0.18]'
              }`}
            >
              {/* Faded collage background */}
              <div className="absolute inset-0 flex">
                {panel.images.map((src, idx) => (
                  <div key={idx} className="relative flex-1 overflow-hidden">
                    <motion.img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                      initial={{ scale: 1.05 }}
                      whileHover={{ scale: 1.12 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                ))}
              </div>

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/85 transition-all duration-300" />

              {isSelected && <div className="absolute inset-0 bg-[#8B3DFF]/10" />}

              {isSelected && (
                <div className="absolute top-4 right-4 bg-[#8B3DFF] text-white rounded-full p-1.5 shadow-lg z-10">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <h3 className="text-2xl font-bold text-white tracking-tight mb-1">{panel.title}</h3>
                <p className="text-sm text-white/60">{panel.tagline}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-white/[0.08]">
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
            selected.length > 0
              ? 'bg-white text-black hover:bg-white/90 hover:-translate-y-0.5'
              : 'bg-white/[0.06] text-[#9E9E9E] cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
