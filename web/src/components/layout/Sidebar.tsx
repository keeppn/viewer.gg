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
        className={`relative flex items-center px-4 py-3 my-1 rounded-[10px] cursor-pointer transition-all duration-200 ${
          isActive
            ? 'bg-[#2A2A2A]'
            : 'hover:bg-white/5'
        }`}
      >
        {/* Active indicator - lime green bar on left */}
        {isActive && (
          <div className="absolute left-0 top-0 h-full w-1 bg-[#DAFF7C] rounded-r" />
        )}

        {/* Icon with tinted background */}
        <div
          className={`relative w-10 h-10 flex items-center justify-center rounded-[10px] flex-shrink-0 ${
            isActive ? 'bg-[#DAFF7C]/10 text-[#DAFF7C]' : 'bg-white/5 text-white/70'
          }`}
        >
          {icon}
        </div>

        <span className={`ml-4 font-medium text-sm ${isActive ? 'text-white' : 'text-white/70'}`}>
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
      <aside
        className="hidden lg:flex relative w-64 flex-shrink-0 flex-col bg-[#1F1F1F] border-r border-white/10"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center px-6 py-8 mb-6">
          <div className="relative w-12 h-12 flex items-center justify-center">
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
        <div className="m-4 p-4 rounded-[10px] text-center bg-[#2A2A2A] border border-white/10">
          <p className="text-sm font-semibold text-white">
            © 2024 viewer.gg
          </p>
          <p className="text-xs text-white/70 mt-1">Modern Esports Platform</p>
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
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 flex-shrink-0 flex flex-col bg-[#1F1F1F] border-r border-white/10 z-50"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-[10px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Logo Section */}
              <div className="flex items-center justify-center px-6 py-8 mb-6">
                <div className="relative w-12 h-12 flex items-center justify-center">
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
              <div className="m-4 p-4 rounded-[10px] text-center bg-[#2A2A2A] border border-white/10">
                <p className="text-sm font-semibold text-white">
                  © 2024 viewer.gg
                </p>
                <p className="text-xs text-white/70 mt-1">Modern Esports Platform</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
