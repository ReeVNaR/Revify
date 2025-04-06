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
      <div className="flex items-center justify-end px-6 py-4">
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
