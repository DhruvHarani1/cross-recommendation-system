import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Heart, Search, X, AlertCircle } from 'lucide-react';
import { getSampleItems } from '../../api/user';
import api from '../../api/axios';

export default function Step3Anchors({ selectedCategories, onChange, onNext, onBack, isSubmitting }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');


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

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (query.length < 2) {
      setSearchError('Search query must be at least 2 characters long.');
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setSearchError('');
    
    try {
      const token = localStorage.getItem('crossrec_access_token');
      // If user selected only one category, we can optionally scope the search, otherwise search all
      const typeParam = selectedCategories.length === 1 ? `&type=${mapCategory(selectedCategories[0])}` : '';
      const res = await api.get(`/content/search?q=${encodeURIComponent(searchQuery.trim())}${typeParam}&limit=12`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // results are already returned as an array of items with content_id, content_type, title, cover_path
      const uniqueResults = res.data.results || [];
      
      if (uniqueResults.length === 0) {
        setSearchError('No matching items found. Try a different search term.');
      }
      setSearchResults(uniqueResults);
    } catch (err) {
      console.error('Search error:', err);
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'An error occurred while searching. Please try again.';
      setSearchError(msg);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
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

      <form onSubmit={handleSearch} className="mb-6 relative max-w-xl mx-auto w-full">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search for a specific movie, game, book, or song..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:border-[#8B3DFF] focus:ring-1 focus:ring-[#8B3DFF] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {searchError && (
        <div className="mb-6 max-w-xl mx-auto flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{searchError}</p>
        </div>
      )}

      {loading || isSearching ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-white/40">{isSearching ? 'Searching...' : 'Loading items...'}</div>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(searchResults.length > 0 ? searchResults : items).map((item, index) => {
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
