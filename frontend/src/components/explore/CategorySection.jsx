import { motion } from 'framer-motion';
import { Film, BookOpen, Gamepad2, Music } from 'lucide-react';

const CATEGORIES = [
  { 
    id: 'movie', 
    label: 'Movies', 
    description: 'Blockbusters to indie darlings.', 
    icon: Film, 
    color: 'from-blue-600/40 via-purple-600/20 to-black',
    accent: 'bg-blue-500'
  },
  { 
    id: 'book', 
    label: 'Books', 
    description: 'Lose yourself in another world.', 
    icon: BookOpen, 
    color: 'from-emerald-600/40 via-teal-600/20 to-black',
    accent: 'bg-emerald-500'
  },
  { 
    id: 'game', 
    label: 'Games', 
    description: 'Interactive and immersive stories.', 
    icon: Gamepad2, 
    color: 'from-orange-600/40 via-red-600/20 to-black',
    accent: 'bg-orange-500'
  },
  { 
    id: 'song', 
    label: 'Music', 
    description: 'Soundtracks for your life.', 
    icon: Music, 
    color: 'from-pink-600/40 via-rose-600/20 to-black',
    accent: 'bg-pink-500'
  },
];

export default function CategorySection({ onSelectCategory }) {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 sm:px-12 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-2">Browse Categories</h2>
          <p className="text-white/40 text-sm">Dive deep into your favorite medium.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -5 }}
              onClick={() => onSelectCategory(cat.id)}
              className="group cursor-pointer relative overflow-hidden rounded-[24px] aspect-[3/4] border border-white/5 bg-[#0a0a0a]"
            >
              {/* Background Artwork Simulation via Gradients */}
              <div className={`absolute inset-0 bg-gradient-to-b ${cat.color} opacity-60 group-hover:opacity-90 transition-opacity duration-700`} />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
              
              {/* Hover Zoom Icon / Graphic */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-700 ease-out pointer-events-none">
                <Icon className="w-32 h-32 text-white" strokeWidth={1} />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className={`w-10 h-10 rounded-full ${cat.accent}/20 flex items-center justify-center mb-4 backdrop-blur-md border border-${cat.accent}/30`}>
                  <Icon className={`w-5 h-5 text-white`} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
                  {cat.label}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed transform translate-y-2 opacity-80 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  {cat.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
