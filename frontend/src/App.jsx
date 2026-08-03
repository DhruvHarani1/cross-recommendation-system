import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import FeatureSection from './components/FeatureSection';
import CrossMatchVisual from './components/features/CrossMatchVisual';
import GenreCloudVisual from './components/features/GenreCloudVisual';
import TryItOut from './components/TryItOut';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function LandingPage() {
  return (
    <div className="min-h-[200vh] bg-[#0a0a0a] text-white">
      <Navbar />
      <Hero />
      <TryItOut />
      <HowItWorks />

      <div id="features">
        <FeatureSection
          title="Explore by feeling, not filter."
          subtitle="Skip the genre dropdowns. Every recommendation understands tone, mood, and theme."
          visual={<GenreCloudVisual />}
          reverse
        />

        <FeatureSection
          title="Matched across mediums."
          subtitle="One film in, a book, a game, and an album out — all connected by meaning, not metadata."
          visual={<CrossMatchVisual />}
        />
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}