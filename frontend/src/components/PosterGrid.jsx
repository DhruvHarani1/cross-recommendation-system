import { motion } from 'framer-motion';

export default function PosterGrid({ posters }) {
  const row1 = posters.slice(0, Math.ceil(posters.length / 2));
  const row2 = posters.slice(Math.ceil(posters.length / 2));

  return (
    <div className="flex flex-col gap-6 w-full">
      <Row posters={row1} delayStart={0.2} />
      <Row posters={row2} delayStart={0.4} offset />
    </div>
  );
}

function Row({ posters, delayStart, offset }) {
  return (
    <div className={`flex gap-4 sm:gap-6 justify-center flex-wrap ${offset ? 'translate-x-6 md:translate-x-12' : ''}`}>
      {posters.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: delayStart + i * 0.07, ease: 'easeOut' }}
          whileHover={{ y: -10, scale: 1.03 }}
          className="relative w-[130px] sm:w-[170px] md:w-[190px] h-[190px] sm:h-[250px] md:h-[280px] rounded-lg overflow-hidden shadow-2xl cursor-pointer flex-shrink-0"
          style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
        >
          <img src={p.img} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/10 backdrop-blur-md border border-white/20 rounded text-[9px] uppercase tracking-wider text-white">
            {p.type}
          </span>
        </motion.div>
      ))}
    </div>
  );
}