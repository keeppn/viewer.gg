'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon, UserCircleIcon, SearchIcon } from '../icons/Icons';
import { useAuthStore } from '@/store/authStore';
import UserMenu from './UserMenu';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const pathname = usePathname();
  const router = useRouter();
  const currentPage = pathname.split('/').pop() || 'Overview';
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { user, signOut } = useAuthStore();

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="relative p-3 sm:p-4 flex justify-between items-center border-b backdrop-blur-xl z-50"
      style={{
        background: 'linear-gradient(90deg, rgba(10, 14, 27, 0.95), rgba(30, 10, 60, 0.85))',
        borderColor: 'rgba(0, 240, 255, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 240, 255, 0.1), inset 0 -1px 0 rgba(0, 240, 255, 0.2)'
      }}
    >
      {/* Animated gradient overlay */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.03), transparent)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      <div className="relative flex items-center gap-3 z-10">
        {/* Mobile Menu Button */}
        <motion.button
          onClick={onMenuClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="lg:hidden text-gray-400 hover:text-[#00F0FF] transition-colors p-2 rounded-lg relative overflow-hidden group"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/10 to-[#9945FF]/10 opacity-0 group-hover:opacity-100 transition-opacity"
          />
          <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>

        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg sm:text-xl md:text-2xl font-bold capitalize truncate max-w-[150px] sm:max-w-none font-[family-name:var(--font-display)]"
          style={{
            color: 'transparent',
            backgroundImage: 'linear-gradient(90deg, #00F0FF, #9945FF, #FFB800)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(0, 240, 255, 0.3)',
          }}
        >
          {currentPage}
        </motion.h2>
      </div>
      
      <div className="relative flex items-center gap-2 sm:gap-4 md:gap-6 z-10">
        {/* Desktop Search */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:block relative"
        >
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 z-10">
            <SearchIcon />
          </span>
          <input 
            type="text"
            placeholder="Search tournaments, teams..."
            className="w-48 lg:w-72 text-white rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all duration-300 placeholder:text-gray-500"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(0, 240, 255, 0.5)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 240, 255, 0.1), inset 0 0 20px rgba(0, 240, 255, 0.05)';
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.03)';
              e.target.style.borderColor = 'rgba(0, 240, 255, 0.2)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </motion.div>

        {/* Mobile Search Button */}
        <motion.button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="md:hidden text-gray-400 hover:text-[#00F0FF] transition-colors p-2 rounded-lg relative overflow-hidden group"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/10 to-[#9945FF]/10 opacity-0 group-hover:opacity-100 transition-opacity"
          />
          <div className="relative z-10">
            <SearchIcon />
          </div>
        </motion.button>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative text-gray-400 hover:text-[#00F0FF] transition-colors p-2 rounded-lg group overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/10 to-[#9945FF]/10 opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <div className="relative z-10">
              <BellIcon />
            </div>
            {/* Live notification indicator */}
            <motion.span 
              className="absolute top-1 right-1 h-2 w-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #FF073A, #FF3E3E)',
                boxShadow: '0 0 10px #FF073A, 0 0 20px #FF073A',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </motion.button>
          
          {/* User Profile - Desktop */}
          <div ref={userMenuRef} className="relative hidden sm:block">
            <motion.button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-300 group overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                border: '1px solid rgba(0, 240, 255, 0.2)',
              }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(153, 69, 255, 0.1))',
                }}
              />
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name}
                  className="w-6 h-6 rounded-full border border-[#00F0FF]/50 relative z-10"
                />
              ) : (
                <div className="relative z-10 text-[#00F0FF]">
                  <UserCircleIcon />
                </div>
              )}
              <span className="text-white font-medium relative z-10">
                {user?.name || 'Admin'}
              </span>
              <motion.svg
                className="w-4 h-4 text-gray-400 relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </motion.button>

            <UserMenu
              user={user}
              isOpen={isUserMenuOpen}
              onClose={() => setIsUserMenuOpen(false)}
              onLogout={handleLogout}
            />
          </div>

          {/* Mobile User Icon Only */}
          <div ref={userMenuRef} className="relative sm:hidden">
            <motion.button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-400 hover:text-[#00F0FF] transition-colors p-2 rounded-lg relative overflow-hidden group"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/10 to-[#9945FF]/10 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name}
                  className="w-6 h-6 rounded-full border border-[#00F0FF]/50 relative z-10"
                />
              ) : (
                <div className="relative z-10">
                  <UserCircleIcon />
                </div>
              )}
            </motion.button>

            <UserMenu
              user={user}
              isOpen={isUserMenuOpen}
              onClose={() => setIsUserMenuOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="absolute top-full left-0 right-0 p-3 border-b md:hidden z-20 overflow-hidden backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 14, 27, 0.98), rgba(30, 10, 60, 0.95))',
              borderColor: 'rgba(0, 240, 255, 0.2)',
            }}
          >
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 z-10">
                <SearchIcon />
              </span>
              <input 
                type="text"
                placeholder="Search tournaments, teams..."
                className="w-full text-white rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all duration-300 placeholder:text-gray-500"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(0, 240, 255, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 240, 255, 0.1), inset 0 0 20px rgba(0, 240, 255, 0.05)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.target.style.borderColor = 'rgba(0, 240, 255, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
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
