import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
  className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
    isScrolled
      ? "bg-[#0A0A0A]/80 backdrop-blur-md border-white/5 py-3"
      : "bg-transparent border-transparent py-5"
  }`}
>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 select-none cursor-pointer hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6V18C4 19.1046 4.89543 20 6 20H8.5V14L12 17.5L15.5 14V20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H15.5V10L12 6.5L8.5 10V4H6C4.89543 4 4 4.89543 4 6Z" fill="white"/>
            </svg>
          </div>
          <span className="text-white text-xl font-bold tracking-widest uppercase">CrossRec</span>
        </Link>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium py-2 px-4 rounded-full hover:bg-white/5 transition-colors">
            Login
          </Link>
          <Link to="/signup" className="bg-white text-black text-sm font-medium py-2 px-4 rounded-full hover:bg-white/90 hover:-translate-y-0.5 transition-all duration-300">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}