'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { OverviewIcon, TournamentIcon, AnalyticsIcon, ApplicationIcon, ReportIcon, SettingsIcon, LiveIcon } from '../icons/Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavItem: React.FC<{
  name: string;
  icon: React.ReactNode;
  path: string;
  onClose: () => void;
}> = ({ name, icon, path, onClose }) => {
  const pathname = usePathname();
  const isActive = pathname === path;

  return (
    <Link href={path} onClick={onClose}>
      <div
        className={`flex items-center px-4 py-3 my-1 rounded-[10px] cursor-pointer transition-all duration-200 ${
          isActive
            ? 'bg-[#DAFF7C]/10 text-white'
            : 'text-white/70 hover:bg-white/5 hover:text-white'
        }`}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 h-8 w-1 bg-[#DAFF7C] rounded-r-full" />
        )}

        {/* Icon */}
        <div className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#DAFF7C]' : 'text-white/70'}`}>
          {icon}
        </div>

        {/* Label */}
        <span className={`ml-4 font-medium text-sm ${isActive ? 'text-white' : ''}`}>
          {name}
        </span>
      </div>
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pages: { name: string; icon: React.ReactNode; path: string }[] = [
    { name: 'Overview', icon: <OverviewIcon />, path: '/dashboard' },
    { name: 'Tournaments', icon: <TournamentIcon />, path: '/dashboard/tournaments' },
    { name: 'Analytics', icon: <AnalyticsIcon />, path: '/dashboard/analytics' },
    { name: 'Applications', icon: <ApplicationIcon />, path: '/dashboard/applications' },
    { name: 'Live', icon: <LiveIcon />, path: '/dashboard/live' },
    { name: 'Reports', icon: <ReportIcon />, path: '/dashboard/reports' },
    { name: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex relative w-64 flex-shrink-0 flex-col bg-[#2A2A2A] border-r border-white/10">
        {/* Logo Section */}
        <div className="flex items-center p-6 mb-2">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <img
              src="/viewer-logo/viewer-logo-transparent.svg"
              alt="Viewer.gg Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto">
          <ul>
            {pages.map(({ name, icon, path }) => (
              <NavItem
                key={name}
                name={name}
                icon={icon}
                path={path}
                onClose={() => {}}
              />
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="m-4 p-4 rounded-[10px] text-center bg-white/5 border border-white/10">
          <p className="text-sm font-semibold text-white/90">
            © 2024 viewer.gg
          </p>
          <p className="text-xs text-white/50 mt-1">Tournament Organizer Platform</p>
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
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 flex-shrink-0 flex flex-col bg-[#2A2A2A] border-r border-white/10 z-50"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Logo Section */}
              <div className="flex items-center p-6 mb-2">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <img
                    src="/viewer-logo/viewer-logo-transparent.svg"
                    alt="Viewer.gg Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 overflow-y-auto">
                <ul>
                  {pages.map(({ name, icon, path }) => (
                    <NavItem
                      key={name}
                      name={name}
                      icon={icon}
                      path={path}
                      onClose={onClose}
                    />
                  ))}
                </ul>
              </nav>

              {/* Footer */}
              <div className="m-4 p-4 rounded-[10px] text-center bg-white/5 border border-white/10">
                <p className="text-sm font-semibold text-white/90">
                  © 2024 viewer.gg
                </p>
                <p className="text-xs text-white/50 mt-1">Tournament Organizer Platform</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
