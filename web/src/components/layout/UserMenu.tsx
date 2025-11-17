'use client';

import React from 'react';
import { UserCircleIcon } from '../icons/Icons';
import { User } from '@/types';

interface UserMenuProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, isOpen, onClose, onLogout }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100]"
        onClick={onClose}
      />

      {/* Dropdown Menu */}
      <div
        className="absolute right-0 top-full mt-2 w-64 rounded-[10px] overflow-hidden z-[110] bg-[#2A2A2A] border border-white/10 shadow-xl"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        {/* User Info Section */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-[#DAFF7C]/50"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#DAFF7C]/10 flex items-center justify-center border-2 border-[#DAFF7C]/50">
                <UserCircleIcon />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-white/70 text-sm truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          {/* Profile Link */}
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-[10px] text-white/70 hover:text-white hover:bg-white/5 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Profile</span>
          </button>

          {/* Settings Link */}
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-[10px] text-white/70 hover:text-white hover:bg-white/5 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </button>

          {/* Divider */}
          <div className="my-2 h-px bg-white/10" />

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default UserMenu;
