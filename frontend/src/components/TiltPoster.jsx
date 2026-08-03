import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function TiltPoster({ src, alt, width = 280, height = 380, label }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -8, y: px * 8 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      animate={{ y: [0, -6, 0], scale: [1, 1.015, 1] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width, height, perspective: 800 }}
      className="relative"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        whileHover={{ scale: 1.03 }}
        className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/[0.07]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        {label && (
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-xs font-medium text-white">
            {label}
          </div>
        )}
      </motion.div>

      <div className="absolute -inset-4 bg-purple-500/[0.07] rounded-[2rem] blur-2xl -z-10" />
      <div className="absolute -inset-8 bg-amber-500/[0.03] rounded-[3rem] blur-3xl -z-10" />
    </motion.div>
  );
}