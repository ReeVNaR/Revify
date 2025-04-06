import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAudio();
  const navigate = useNavigate();

  const navItems = [
    {
      to: "/",
      label: "Home",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      )
    },
    {
      to: "/search",
      label: "Search",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      )
    },
    {
      to: "/library",
      label: "Library",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
        </svg>
      )
    }
  ];

  const handleLibraryClick = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/profile');
      return;
    }
    navigate('/library');
  };

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden bg-[#181818] text-white border-t border-[#282828] fixed bottom-0 left-0 right-0 z-50">
        <div className="flex justify-around items-center py-3">
          {navItems.map((item) => (
            <Link 
              key={item.to}
              to={item.to} 
              className={`flex flex-col items-center transition-all duration-300 ${
                location.pathname === item.to 
                  ? 'text-white scale-110' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop Side Navigation */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-24 w-64 bg-gradient-to-b from-[#121212] to-[#181818] text-white border-r border-[#282828] flex-col p-6 z-40">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
            </svg>
            Revify
          </h1>
        </div>
        <div className="flex flex-col space-y-2">
          {navItems.map((item) => (
            item.to === '/library' ? (
              <Link 
                key={item.to}
                to={item.to} 
                onClick={handleLibraryClick}
                className={`flex items-center space-x-4 p-3 rounded-lg hover:bg-[#282828] transition-colors duration-200
                  ${location.pathname === item.to ? 'bg-[#282828] text-green-500' : 'text-gray-400'}`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ) : (
              <Link 
                key={item.to}
                to={item.to} 
                className={`flex items-center space-x-4 p-3 rounded-lg hover:bg-[#282828] transition-colors duration-200
                  ${location.pathname === item.to ? 'bg-[#282828] text-green-500' : 'text-gray-400'}`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          ))}
        </div>
      </div>
    </>
  );
};

export default BottomNav;
