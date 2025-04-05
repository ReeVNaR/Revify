import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 right-0 left-0 md:left-64 z-30 transition-colors duration-300 ${
      isScrolled ? 'bg-[#121212]/95 backdrop-blur-sm' : 'bg-transparent'
    }`}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-black/40 hover:bg-black/60">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={() => navigate(1)} className="p-2 rounded-full bg-black/40 hover:bg-black/60">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {location.pathname === '/search' && (
            <div className="relative">
              <input 
                type="search"
                placeholder="Search songs..."
                className="w-80 px-4 py-2 rounded-full bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-white/80 hover:text-white px-4 py-2 rounded-full bg-black/40 hover:bg-black/60">
            Upgrade
          </button>
          <button className="flex items-center gap-2 px-2 py-1 rounded-full bg-black/40 hover:bg-black/60">
            <div className="w-7 h-7 rounded-full bg-[#282828] flex items-center justify-center">
              <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-white">Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
