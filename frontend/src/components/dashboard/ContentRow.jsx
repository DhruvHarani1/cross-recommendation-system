import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ContentCard from './ContentCard';

const ease = [0.16, 1, 0.3, 1];

export default function ContentRow({ title, subtitle, items, delay = 0, onFeedback, onCardClick, onSave, savedItems = [] }) {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 20);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
  };

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease }}
      className="mb-14 group/row relative"
    >
      {/* Header */}
      <div className="flex items-end justify-between mb-6 px-1">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-white/40 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <button className="hidden sm:flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm font-medium group/btn">
          View All
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Scrollable row container */}
      <div className="relative -mx-6 px-6 sm:mx-0 sm:px-0">
        
        {/* Left Arrow (Desktop only) */}
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center rounded-full bg-[#111]/80 backdrop-blur-md border border-white/10 text-white shadow-xl opacity-0 group-hover/row:opacity-100 hover:scale-110 transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Arrow (Desktop only) */}
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center rounded-full bg-[#111]/80 backdrop-blur-md border border-white/10 text-white shadow-xl opacity-0 group-hover/row:opacity-100 hover:scale-110 transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Scroll Area */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, i) => (
            <div key={`${item.type}-${item.id}-${i}`} className="snap-start shrink-0">
              <ContentCard
                item={item}
                onFeedback={onFeedback}
                onCardClick={onCardClick}
                onSave={onSave}
                savedItems={savedItems}
              />
            </div>
          ))}
          {/* Spacer for right edge padding on mobile */}
          <div className="w-2 shrink-0 sm:hidden" />
        </div>
        
        {/* Right Gradient Fade (Desktop) */}
        <div className="hidden sm:block absolute right-0 top-0 bottom-6 w-24 bg-gradient-to-l from-[#090909] to-transparent pointer-events-none z-20" />
      </div>
    </motion.div>
  );
}
