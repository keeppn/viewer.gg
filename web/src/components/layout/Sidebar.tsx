'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavItem: React.FC<{
  name: string;
  iconPath: string;
  path: string;
  onClose: () => void;
}> = ({ name, iconPath, path, onClose }) => {
  const pathname = usePathname();
  const isActive = pathname === path;

  return (
    <Link href={path} onClick={onClose}>
      <div
        className={`relative flex items-center px-3 py-2 my-0.5 rounded-[10px] cursor-pointer transition-all duration-300 group ${
          isActive
            ? 'bg-gradient-to-r from-[#9381FF]/20 to-[#DAFF7C]/10 shadow-lg shadow-[#9381FF]/10'
            : 'hover:bg-gradient-to-r hover:from-[#9381FF]/5 hover:to-transparent'
        }`}
      >
        {/* Active indicator - gradient bar on left */}
        {isActive && (
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#9381FF] via-[#DAFF7C] to-[#9381FF] rounded-r shadow-lg shadow-[#9381FF]/50" />
        )}

        {/* Icon with premium styling */}
        <div
          className={`relative w-9 h-9 flex items-center justify-center rounded-[8px] flex-shrink-0 transition-all duration-300 ${
            isActive
              ? 'bg-gradient-to-br from-[#9381FF]/20 to-[#DAFF7C]/20 shadow-lg shadow-[#9381FF]/20'
              : 'bg-white/5 group-hover:bg-gradient-to-br group-hover:from-[#9381FF]/10 group-hover:to-[#DAFF7C]/10'
          }`}
        >
          <img
            src={iconPath}
            alt={name}
            className={`w-5 h-5 object-contain transition-all duration-300 ${
              isActive
                ? 'brightness-125 drop-shadow-[0_0_8px_rgba(147,129,255,0.6)]'
                : 'brightness-90 group-hover:brightness-110 group-hover:drop-shadow-[0_0_6px_rgba(147,129,255,0.4)]'
            }`}
          />
        </div>

        <span
          className={`ml-3 font-semibold text-xs transition-all duration-300 ${
            isActive
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#DAFF7C] to-[#9381FF]'
              : 'text-white/70 group-hover:text-white'
          }`}
        >
          {name}
        </span>

        {/* Glow effect on active */}
        {isActive && (
          <div className="absolute inset-0 rounded-[10px] bg-gradient-to-r from-[#9381FF]/0 via-[#DAFF7C]/5 to-[#9381FF]/0 animate-pulse" />
        )}
      </div>
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pages: { name: string; iconPath: string; path: string }[] = [
    { name: 'Overview', iconPath: '/dashboard-icons/dashboard-overview-icon.png', path: '/dashboard' },
    { name: 'Tournaments', iconPath: '/dashboard-icons/dashboard-tournaments-icon.png', path: '/dashboard/tournaments' },
    { name: 'Analytics', iconPath: '/dashboard-icons/dashboard-analytics-icon.png', path: '/dashboard/analytics' },
    { name: 'Applications', iconPath: '/dashboard-icons/dashboard-applications-icon.png', path: '/dashboard/applications' },
    { name: 'Live', iconPath: '/dashboard-icons/dashboard-live-icon.png', path: '/dashboard/live' },
    { name: 'Reports', iconPath: '/dashboard-icons/dashboard-reports-icon.png', path: '/dashboard/reports' },
    { name: 'Settings', iconPath: '/dashboard-icons/dashboard-settings-icon.png', path: '/dashboard/settings' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex relative w-64 flex-shrink-0 flex-col bg-gradient-to-b from-[#1F1F1F] to-[#1A1A1A] border-r border-[#9381FF]/20"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        {/* Subtle purple glow at top */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#9381FF]/5 to-transparent pointer-events-none" />

        {/* Logo Section */}
        <div className="flex items-center justify-center px-6 py-8 mb-6 relative">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#DAFF7C]/20 to-[#9381FF]/20 rounded-full blur-xl animate-pulse" />
            <img
              src="/viewer-logo/viewer-logo-transparent.svg"
              alt="Viewer.gg Logo"
              className="relative w-full h-full object-contain drop-shadow-[0_0_20px_rgba(218,255,124,0.4)]"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto scrollbar-thin scrollbar-thumb-[#9381FF]/30 scrollbar-track-transparent">
          <ul>
            {pages.map(({ name, iconPath, path }) => (
              <NavItem
                key={name}
                name={name}
                iconPath={iconPath}
                path={path}
                onClose={() => {}}
              />
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="m-4 p-3 rounded-[10px] text-center bg-gradient-to-br from-[#2A2A2A] to-[#252525] border border-[#9381FF]/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#9381FF]/5 to-transparent" />
          <p className="relative text-xs font-semibold text-white">
            © 2024 viewer.gg
          </p>
          <p className="relative text-[10px] text-white/70 mt-0.5">Premium Esports Platform</p>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 flex-shrink-0 flex flex-col bg-gradient-to-b from-[#1F1F1F] to-[#1A1A1A] border-r border-[#9381FF]/20 z-50"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {/* Subtle purple glow at top */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#9381FF]/5 to-transparent pointer-events-none" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-[10px] text-white/70 hover:text-white hover:bg-[#9381FF]/20 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Logo Section */}
              <div className="flex items-center justify-center px-6 py-8 mb-6 relative">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#DAFF7C]/20 to-[#9381FF]/20 rounded-full blur-xl animate-pulse" />
                  <img
                    src="/viewer-logo/viewer-logo-transparent.svg"
                    alt="Viewer.gg Logo"
                    className="relative w-full h-full object-contain drop-shadow-[0_0_20px_rgba(218,255,124,0.4)]"
                  />
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 overflow-y-auto">
                <ul>
                  {pages.map(({ name, iconPath, path }) => (
                    <NavItem
                      key={name}
                      name={name}
                      iconPath={iconPath}
                      path={path}
                      onClose={onClose}
                    />
                  ))}
                </ul>
              </nav>

              {/* Footer */}
              <div className="m-4 p-3 rounded-[10px] text-center bg-gradient-to-br from-[#2A2A2A] to-[#252525] border border-[#9381FF]/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#9381FF]/5 to-transparent" />
                <p className="relative text-xs font-semibold text-white">
                  © 2024 viewer.gg
                </p>
                <p className="relative text-[10px] text-white/70 mt-0.5">Premium Esports Platform</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
