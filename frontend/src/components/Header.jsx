import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAudio();
  
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '/' && searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Pass the search query to your search handler
  };

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
                ref={searchInputRef}
                type="search"
                placeholder="Search songs... (Press '/' to focus)"
                value={searchQuery}
                onChange={handleSearch}
                className="w-80 px-4 py-2 rounded-full bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <button 
            onClick={handleProfileClick}
            className="flex items-center gap-2 px-2 py-1 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {user ? getInitial(user.username) : '?'}
              </span>
            </div>
            <span className="text-sm font-medium text-white">
              {user ? user.username : 'Profile'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
