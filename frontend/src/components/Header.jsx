import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
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

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className={`fixed top-0 right-0 left-0 md:left-64 z-30 transition-colors duration-300 ${
      isScrolled ? 'bg-[#121212]/95 backdrop-blur-sm' : 'bg-transparent'
    }`}>
      <div className="flex items-center justify-between md:justify-end px-6 py-4">
        <div className="md:hidden">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66A2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
            </svg>
            Revify
          </h1>
        </div>
        
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
    </header>
  );
};

export default Header;
