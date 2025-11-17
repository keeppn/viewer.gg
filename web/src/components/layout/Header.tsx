'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
    <header
      className="relative p-4 flex justify-between items-center bg-[#2A2A2A] border-b border-white/10"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-white/70 hover:text-white transition-colors p-2 rounded-[10px] hover:bg-white/5"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h2 className="text-xl md:text-2xl font-semibold capitalize text-white">
          {currentPage === 'dashboard' ? 'Overview' : currentPage}
        </h2>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search button */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="p-2 rounded-[10px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          <div className="w-5 h-5">
            <SearchIcon />
          </div>
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-[10px] text-white/70 hover:text-white hover:bg-white/5 transition-colors relative">
          <div className="w-5 h-5">
            <BellIcon />
          </div>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DAFF7C] rounded-full"></span>
        </button>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-2 rounded-[10px] hover:bg-white/5 transition-colors"
          >
            <div className="w-6 h-6 text-white/70">
              <UserCircleIcon />
            </div>
            <span className="hidden sm:inline text-sm font-medium text-white">
              {user?.email?.split('@')[0] || 'User'}
            </span>
          </button>

          <UserMenu
            user={user}
            isOpen={isUserMenuOpen}
            onClose={() => setIsUserMenuOpen(false)}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
