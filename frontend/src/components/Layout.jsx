import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div>
      <nav className="bg-[#181818] p-4 mb-8">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-white">Revify</Link>
          <div className="space-x-6">
            <Link to="/" className="text-white hover:text-gray-300">Home</Link>
            <Link to="/songs" className="text-white hover:text-gray-300">Songs</Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
};

export default Layout;
