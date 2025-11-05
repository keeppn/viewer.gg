
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { BellIcon, UserCircleIcon, SearchIcon } from '../icons/Icons';

const Header: React.FC = () => {
  const pathname = usePathname();
  const currentPage = pathname.split('/').pop() || 'Overview';

  return (
    <header className="relative bg-gradient-to-r from-[#1E1E1E] to-[#1A1A1A] p-4 flex justify-between items-center border-b border-white/5 shadow-2xl backdrop-blur-xl">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#387B66]/5 to-transparent pointer-events-none" />
      
      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent capitalize"
      >
        {currentPage}
      </motion.h2>
      
      <div className="relative flex items-center space-x-6">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <SearchIcon />
          </span>
          <input 
            type="text"
            placeholder="Search..."
            className="w-72 bg-black/20 text-white rounded-xl py-2.5 pl-10 pr-4 border border-white/10 focus:border-[#387B66]/50 focus:bg-black/30 outline-none transition-all duration-300 placeholder:text-gray-500"
          />
        </motion.div>
        
        <div className="flex items-center space-x-4">
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
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-[#387B66]/30 transition-all duration-300 cursor-pointer"
          >
            <UserCircleIcon />
            <span className="text-white font-medium">Admin</span>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default Header;
