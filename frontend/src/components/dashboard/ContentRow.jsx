import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ContentCard from './ContentCard';

const ease = [0.16, 1, 0.3, 1];

export default function ContentRow({ title, subtitle, items, delay = 0, onFeedback, onCardClick }) {
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
      className="mb-8 group/row"
    >
      {/* Header */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <h3 className="text-lg sm:text-xl font-medium text-white tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-white/25 text-xs mt-0.5">{subtitle}</p>
          )}
        </div>
        <span className="text-[10px] text-white/15 tracking-wider uppercase">
          {items.length} items
        </span>
      </div>

      {/* Scrollable row */}
      <div className="relative">
        {/* Left arrow */}
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center bg-gradient-to-r from-[#050505] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
          >
            <ChevronLeft className="w-5 h-5 text-white/50" />
          </button>
        )}

        {/* Right arrow */}
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center bg-gradient-to-l from-[#050505] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
          >
            <ChevronRight className="w-5 h-5 text-white/50" />
          </button>
        )}

        {/* Cards */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, i) => (
            <ContentCard
              key={`${item.type}-${item.id}-${i}`}
              item={item}
              onFeedback={onFeedback}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
