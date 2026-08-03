import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AuroraBackground from './AuroraBackground';

const POSTERS = [
  { src: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', className: 'top-[8%] left-[12%] w-[140px] h-[200px] rotate-[-6deg]' },
  { src: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg', className: 'top-[30%] left-[42%] w-[150px] h-[210px] rotate-[3deg] z-10' },
  { src: 'https://media.rawg.io/media/games/5ec/5ecac5cb026ec26a56efcc546364e348.jpg', className: 'top-[52%] left-[8%] w-[130px] h-[185px] rotate-[4deg]' },
  { src: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', className: 'top-[12%] right-[10%] w-[140px] h-[200px] rotate-[5deg]' },
  { src: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', className: 'bottom-[10%] right-[16%] w-[130px] h-[185px] rotate-[-4deg]' },
];

export default function AuthLayout({ children }) {
  const artRef = useRef(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = artRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: px * 16, y: py * 16 });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex overflow-hidden">
      <AuroraBackground />

      {/* Left: animated artwork — hidden on mobile */}
      <div
        ref={artRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setParallax({ x: 0, y: 0 })}
        className="hidden lg:block relative w-[55%] h-screen overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/[0.06] rounded-full blur-[160px] pointer-events-none" />

        {POSTERS.map((p, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -14, 0],
              x: parallax.x * (0.5 + i * 0.1),
              translateY: parallax.y * (0.5 + i * 0.1),
            }}
            transition={{
              y: { duration: 6 + i * 0.8, repeat: Infinity, ease: 'easeInOut' },
              x: { type: 'spring', stiffness: 60, damping: 20 },
              translateY: { type: 'spring', stiffness: 60, damping: 20 },
            }}
            className={`absolute rounded-xl overflow-hidden border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${p.className}`}
          >
            <img src={p.src} alt="" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </motion.div>
        ))}

        <div className="absolute inset-0 flex flex-col items-start justify-end p-16 z-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/" className="text-[11px] uppercase tracking-[0.35em] text-white/30 hover:text-white/60 transition-colors mb-3 block w-fit">
              CrossRec
            </Link>
            <h2 className="text-2xl font-medium text-white/80 tracking-[-0.01em] max-w-sm leading-snug">
              Every story, connected by meaning.
            </h2>
          </motion.div>
        </div>
      </div>

      {/* Right: form slot */}
      <div className="relative w-full lg:w-[45%] flex items-center justify-center px-6 py-16 z-10">
        {children}
      </div>
    </div>
  );
}