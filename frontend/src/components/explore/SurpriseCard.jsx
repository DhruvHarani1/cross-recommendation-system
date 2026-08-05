import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dices, Sparkles } from 'lucide-react';

export default function SurpriseCard({ onSurprise }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="w-full max-w-4xl mx-auto px-6 sm:px-12 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative overflow-hidden rounded-[32px] p-12 sm:p-20 text-center flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 shadow-2xl group"
      >
        {/* Animated Background Mesh Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-fuchsia-900/10 to-blue-900/20 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Glowing orb effect */}
        <motion.div
          animate={{
            scale: isHovered ? 1.2 : 1,
            rotate: isHovered ? 90 : 0,
            opacity: isHovered ? 0.4 : 0.2
          }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/30 blur-[100px] rounded-full pointer-events-none"
        />

        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            animate={{ 
              y: isHovered ? -5 : 0,
              rotate: isHovered ? [0, -10, 10, -10, 0] : 0
            }}
            transition={{ duration: 0.5 }}
            className="mb-6 text-white/50"
          >
            <Sparkles className="w-10 h-10" />
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Feeling lucky?
          </h2>
          <p className="text-white/40 text-lg max-w-md mx-auto mb-10">
            Let fate decide your next adventure. We'll pick a highly rated masterpiece at random just for you.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSurprise}
            className="group/btn relative px-8 py-4 bg-white text-black rounded-full font-semibold text-lg flex items-center gap-3 overflow-hidden transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-3">
              <Dices className="w-5 h-5 group-hover/btn:animate-spin" />
              Surprise Me
            </span>
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
