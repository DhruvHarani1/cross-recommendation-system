import { motion } from 'framer-motion';

export default function FeatureSection({ title, subtitle, visual, reverse = false }) {
  return (
    <section className="relative w-full bg-[#050505] py-28 px-6 overflow-hidden">
      <div
        className={`max-w-6xl mx-auto flex flex-col ${
          reverse ? 'md:flex-row-reverse' : 'md:flex-row'
        } items-center gap-16`}
      >
        {/* Text side */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 text-center md:text-left"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-white/45 leading-[1.7] max-w-md mx-auto md:mx-0">
            {subtitle}
          </p>
        </motion.div>

        {/* Visual side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex-1 flex justify-center"
        >
          {visual}
        </motion.div>
      </div>
    </section>
  );
}