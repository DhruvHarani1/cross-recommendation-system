import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function MainNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/dashboard' },
    { name: 'Explore', path: '/explore' },
    { name: 'Library', path: '/library' },
  ];

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${isScrolled
        ? "bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
        : "bg-gradient-to-b from-black/80 to-transparent border-b border-transparent py-6"
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        {/* Left side: Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6V18C4 19.1046 4.89543 20 6 20H8.5V14L12 17.5L15.5 14V20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H15.5V10L12 6.5L8.5 10V4H6C4.89543 4 4 4.89543 4 6Z" fill="white" />
          </svg>
          <span className="text-white text-xl font-bold tracking-widest uppercase">CrossRec</span>
        </Link>

        {/* Right side: Navigation & Profile */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <div key={link.name} className="relative">
                  <Link
                    to={link.path}
                    className={`text-sm font-medium transition-all duration-300 ${isActive ? "text-white" : "text-white/50 hover:text-white"
                      }`}
                  >
                    {link.name}
                  </Link>
                  {isActive && (
                    <motion.div
                      layoutId="explore-nav-indicator"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="relative group flex items-center gap-3 pl-4 md:border-l border-white/10">
            <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 cursor-pointer hover:bg-purple-500/20 transition-colors">
              <User className="w-4 h-4" />
            </div>
            {/* Dropdown on hover */}
            <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="px-4 py-2 border-b border-white/5 mb-1">
                <p className="text-sm font-medium text-white truncate">{user?.display_name || user?.username || 'User'}</p>
              </div>
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
