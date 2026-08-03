import { motion } from 'framer-motion';

export default function CrossMatchVisual() {
  return (
    <div className="relative w-[280px] h-[380px]">
      <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <img
          src='https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
          alt="Interstellar"
          className="w-full h-full object-cover"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="absolute -top-4 -left-8 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-sm font-medium text-white"
      >
        Project Hail Mary
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="absolute top-1/3 -right-10 px-4 py-2 rounded-full bg-gradient-to-r from-[#8b3dff] to-[#ff3d8b] text-sm font-medium text-white shadow-[0_8px_24px_rgba(139,61,255,0.35)]"
      >
        97% match
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute -bottom-4 -left-6 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-sm font-medium text-white"
      >
        No Man's Sky
      </motion.div>
    </div>
  );
}