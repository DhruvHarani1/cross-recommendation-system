import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Step1Categories from '../components/onboarding/Step1Categories';
import Step2Genres from '../components/onboarding/Step2Genres';
import Step3Anchors from '../components/onboarding/Step3Anchors';
import { useAuth } from '../context/AuthContext';
import { onboardUser } from '../api/user';

const STEPS = ['Categories', 'Genres', 'Favorites'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedAnchors, setSelectedAnchors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async (finalAnchors = null) => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!user) {
        navigate('/dashboard');
        return;
      }
      setIsSubmitting(true);
      try {
        const mapCategory = (c) => {
          if (c === 'movies') return 'movie';
          if (c === 'books') return 'book';
          if (c === 'games') return 'game';
          if (c === 'music') return 'song';
          return c;
        };
        const mappedCategories = selectedCategories.map(mapCategory);

        // Convert selected anchors to the format expected by the API
        const anchorsToUse = finalAnchors || selectedAnchors;
        const formattedAnchors = anchorsToUse.map(item => ({
          content_id: String(item.content_id),
          content_type: item.content_type
        }));

        await onboardUser(user.user_id, user.display_name || user.username, formattedAnchors, mappedCategories, selectedGenres);
        navigate('/dashboard');
      } catch (err) {
        console.error("Failed to submit onboarding data:", err);
        navigate('/dashboard'); // still navigate so they aren't stuck
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSkip = () => navigate('/dashboard');

  // Prevent users who are already onboarded from seeing this page
  useEffect(() => {
    if (user?.is_onboarded) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col items-center justify-center relative overflow-hidden p-6">
      {/* Cinematic ambient background */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-[#8B3DFF] opacity-[0.05] blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[450px] h-[450px] bg-[#8B3DFF] opacity-[0.04] blur-[160px] rounded-full pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Progress + Skip */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center gap-3">
          {STEPS.map((label, i) => {
            const num = i + 1;
            const active = step >= num;
            return (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${active ? 'bg-[#8B3DFF]' : 'bg-white/15'}`} />
                  <span className={`text-xs font-medium tracking-wide transition-colors duration-300 ${active ? 'text-white/70' : 'text-[#71717A]'}`}>
                    Step {num}
                  </span>
                </div>
                {num < STEPS.length && <span className="text-[#71717A] text-xs">—</span>}
              </div>
            );
          })}
        </div>
        <button
          onClick={handleSkip}
          className="text-[#9E9E9E] hover:text-white transition-colors duration-300 text-sm font-medium"
        >
          Skip
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-4xl bg-[#111111] border border-white/[0.08] rounded-2xl p-8 md:p-12 shadow-[0_24px_60px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepWrapper key="step1">
              <Step1Categories
                selected={selectedCategories}
                onChange={setSelectedCategories}
                onNext={handleNext}
              />
            </StepWrapper>
          )}
          {step === 2 && (
            <StepWrapper key="step2">
              <Step2Genres
                selected={selectedGenres}
                onChange={setSelectedGenres}
                onNext={handleNext}
                onBack={handleBack}
              />
            </StepWrapper>
          )}
          {step === 3 && (
            <StepWrapper key="step3">
              <Step3Anchors
                selectedCategories={selectedCategories}
                onChange={setSelectedAnchors}
                onNext={(anchors) => handleNext(anchors)}
                onBack={handleBack}
                isSubmitting={isSubmitting}
              />
            </StepWrapper>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col flex-grow"
    >
      {children}
    </motion.div>
  );
}
