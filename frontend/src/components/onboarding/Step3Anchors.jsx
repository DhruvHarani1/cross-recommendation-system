import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Heart } from 'lucide-react';
import { getSampleItems } from '../../api/user';

export default function Step3Anchors({ selectedCategories, onChange, onNext, onBack, isSubmitting }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  const mapCategory = (c) => {
    if (c === 'movies') return 'movie';
    if (c === 'books') return 'book';
    if (c === 'games') return 'game';
    if (c === 'music') return 'song';
    return c;
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const mappedCategories = selectedCategories.map(mapCategory);
        const data = await getSampleItems(mappedCategories, 6);
        setItems(data.items || []);
      } catch (err) {
        console.error('Failed to fetch sample items:', err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCategories && selectedCategories.length > 0) {
      fetchItems();
    }
  }, [selectedCategories]);

  const toggleItem = (item) => {
    const isSelected = selectedItems.some(i => i.content_id === item.content_id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => i.content_id !== item.content_id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleNext = () => {
    onChange(selectedItems);
    onNext(selectedItems);
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'movie': return '🎬';
      case 'book': return '📚';
      case 'game': return '🎮';
      case 'song': return '🎵';
      default: return '📦';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 tracking-tight">Pick your favorites</h2>
        <p className="text-[#9E9E9E]">Select at least 3 items you love to personalize your recommendations.</p>
        <p className="text-[#71717A] text-sm mt-2">
          {selectedItems.length} selected {selectedItems.length >= 3 ? '✓' : `(minimum 3)`}
        </p>
      </div>

      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-white/40">Loading items...</div>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item, index) => {
              const isSelected = selectedItems.some(i => i.content_id === item.content_id);
              return (
                <motion.div
                  key={item.content_id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => toggleItem(item)}
                  className={`group relative cursor-pointer rounded-xl overflow-hidden aspect-[2/3] border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-[#8B3DFF] shadow-[0_0_20px_rgba(139,61,255,0.3)]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  {/* Cover Image */}
                  <img
                    src={item.cover_path}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                    }}
                  />

                  {/* Dark Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-300 ${
                    isSelected ? 'from-black/80' : ''
                  }`} />

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-[#8B3DFF] rounded-full p-1.5 shadow-lg z-10">
                      <Check size={14} strokeWidth={3} className="text-white" />
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-white/80 z-10">
                    {getCategoryIcon(item.content_type)} {item.content_type}
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                    <h3 className="text-white font-medium text-sm line-clamp-2 leading-tight">
                      {item.title}
                    </h3>
                    {item.artist && (
                      <p className="text-white/60 text-xs mt-1">{item.artist}</p>
                    )}
                  </div>

                  {/* Heart Icon on Hover */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <div className="bg-black/50 backdrop-blur-sm rounded-full p-3">
                      <Heart
                        size={24}
                        className={isSelected ? 'text-[#8B3DFF] fill-[#8B3DFF]' : 'text-white'}
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between items-center pt-4 border-t border-white/[0.08]">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="text-white/60 hover:text-white px-6 py-3 rounded-full text-sm font-medium transition-colors focus:outline-none disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={selectedItems.length < 3 || isSubmitting}
          className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none ${
            selectedItems.length >= 3 && !isSubmitting
              ? 'bg-[#8B3DFF] text-white hover:bg-[#8B3DFF]/90 hover:-translate-y-0.5 shadow-[0_0_20px_rgba(139,61,255,0.3)]'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Creating your profile...' : 'Complete Setup'}
        </button>
      </div>
    </div>
  );
}
