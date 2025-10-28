
import React from 'react';
import { useLocation } from 'react-router-dom';
import { BellIcon, UserCircleIcon, SearchIcon } from '../icons/Icons';

const Header: React.FC = () => {
  const location = useLocation();
  const currentPage = location.pathname.replace('/', '') || 'Overview';

  return (
    <header className="bg-[#1E1E1E] p-4 flex justify-between items-center border-b border-white/10 shadow-md">
      <h2 className="text-2xl font-semibold text-white capitalize">{currentPage}</h2>
      <div className="flex items-center space-x-6">
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon />
            </span>
            <input 
                type="text"
                placeholder="Search..."
                className="w-full bg-[#121212] text-white rounded-lg py-2 pl-10 pr-4 border border-white/20 focus:ring-2 focus:ring-[#387B66] focus:border-[#387B66] outline-none transition-all"
            />
        </div>
        <div className="flex items-center space-x-4">
            <button className="relative text-gray-400 hover:text-white transition-colors">
            <BellIcon />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2">
                <UserCircleIcon />
                <span className="text-white font-medium">Admin</span>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;