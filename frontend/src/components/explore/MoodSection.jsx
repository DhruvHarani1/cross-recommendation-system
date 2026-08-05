import { motion } from 'framer-motion';
import { Brain, Rocket, Heart, Smile, Skull, SearchCode } from 'lucide-react';

const MOODS = [
  { id: 'mind-blowing', label: 'Mind Blowing', icon: Brain, color: 'from-fuchsia-600 to-purple-600', query: 'mind blowing plot twist psychological' },
  { id: 'sci-fi', label: 'Sci-Fi', icon: Rocket, color: 'from-blue-600 to-cyan-600', query: 'space sci-fi futuristic' },
  { id: 'emotional', label: 'Emotional', icon: Heart, color: 'from-rose-600 to-pink-600', query: 'emotional touching tearjerker drama' },
  { id: 'feel-good', label: 'Feel Good', icon: Smile, color: 'from-amber-500 to-orange-500', query: 'feel good comedy wholesome relaxing' },
  { id: 'dark', label: 'Dark', icon: Skull, color: 'from-slate-800 to-zinc-900', query: 'dark gritty grimdark horror' },
  { id: 'mystery', label: 'Mystery', icon: SearchCode, color: 'from-emerald-600 to-teal-600', query: 'mystery detective thriller suspense' },
];

export default function MoodSection({ onSearch }) {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 sm:px-12 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-2">Explore by Mood</h2>
          <p className="text-white/40 text-sm">Discover content that matches your current vibe.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {MOODS.map((mood, idx) => {
          const Icon = mood.icon;
          return (
            <motion.div
              key={mood.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => onSearch(mood.query)}
              className="group cursor-pointer relative overflow-hidden rounded-[24px] aspect-[4/3] sm:aspect-video"
            >
              {/* Animated Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-80 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Glass overlay for premium feel */}
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] group-hover:bg-black/10 transition-colors duration-500" />
              
              {/* Grain Texture */}
              <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                <motion.div 
                  className="mb-auto opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 transform origin-top-left"
                >
                  <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={1.5} />
                </motion.div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  {mood.label}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
