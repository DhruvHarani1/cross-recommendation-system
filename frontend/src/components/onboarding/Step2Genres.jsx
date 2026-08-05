import { motion } from 'framer-motion';

const GENRES = [
  "Action", "Adventure", "RPG", "Sci-Fi", "Fantasy", 
  "Horror", "Thriller", "Romance", "Comedy", "Drama",
  "Pop", "Rock", "Hip-Hop", "Electronic", "Jazz",
  "Strategy", "Simulation", "Mystery", "Non-Fiction",
  "Cyberpunk", "Cozy", "True Crime", "Documentary"
];

export default function Step2Genres({ selected, onChange, onNext, onBack }) {
  const toggleGenre = (g) => {
    if (selected.includes(g)) {
      onChange(selected.filter(item => item !== g));
    } else {
      onChange([...selected, g]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3 tracking-tight">What vibes are you into?</h2>
        <p className="text-[#9E9E9E]">Select a few genres to help us understand your taste.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {GENRES.map((g) => {
          const isSelected = selected.includes(g);
          return (
            <button
              key={g}
              onClick={() => toggleGenre(g)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border focus:outline-none ${
                isSelected 
                  ? 'bg-[#8B3DFF] text-white border-[#8B3DFF] shadow-[0_0_15px_rgba(139,61,255,0.4)]' 
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex justify-between">
        <button
          onClick={onBack}
          className="text-white/60 hover:text-white px-6 py-3 rounded-full text-sm font-medium transition-colors focus:outline-none"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none ${
            selected.length > 0
              ? 'bg-white text-black hover:bg-white/90 hover:-translate-y-0.5'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
