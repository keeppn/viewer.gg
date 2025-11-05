
'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon, UserCircleIcon, SearchIcon } from '../icons/Icons';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const pathname = usePathname();
  const currentPage = pathname.split('/').pop() || 'Overview';
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="relative bg-gradient-to-r from-[#1E1E1E] to-[#1A1A1A] p-3 sm:p-4 flex justify-between items-center border-b border-white/5 shadow-2xl backdrop-blur-xl">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#387B66]/5 to-transparent pointer-events-none" />
      
      <div className="relative flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent capitalize truncate max-w-[150px] sm:max-w-none"
        >
          {currentPage}
        </motion.h2>
      </div>
      
      <div className="relative flex items-center gap-2 sm:gap-4 md:gap-6">
        {/* Desktop Search */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:block relative"
        >
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <SearchIcon />
          </span>
          <input 
            type="text"
            placeholder="Search..."
            className="w-48 lg:w-72 bg-black/20 text-white rounded-xl py-2.5 pl-10 pr-4 border border-white/10 focus:border-[#387B66]/50 focus:bg-black/30 outline-none transition-all duration-300 placeholder:text-gray-500"
          />
        </motion.div>

        {/* Mobile Search Button */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="md:hidden text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
        >
          <SearchIcon />
        </button>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          >
            <BellIcon />
            <span className="absolute top-1 right-1 h-2 w-2 bg-gradient-to-br from-red-500 to-red-600 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>
          </motion.button>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-[#387B66]/30 transition-all duration-300 cursor-pointer"
          >
            <UserCircleIcon />
            <span className="text-white font-medium">Admin</span>
          </motion.div>

          {/* Mobile User Icon Only */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="sm:hidden text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          >
            <UserCircleIcon />
          </motion.button>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 p-3 bg-[#1E1E1E] border-b border-white/5 md:hidden"
          >
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <SearchIcon />
              </span>
              <input 
                type="text"
                placeholder="Search..."
                className="w-full bg-black/20 text-white rounded-xl py-2.5 pl-10 pr-4 border border-white/10 focus:border-[#387B66]/50 focus:bg-black/30 outline-none transition-all duration-300 placeholder:text-gray-500"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
