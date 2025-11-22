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
        className={`relative flex items-center px-3 py-2.5 my-0.5 rounded-lg cursor-pointer transition-all duration-200 group ${
          isActive
            ? 'bg-[var(--base-dim)]'
            : 'hover:bg-white/5'
        }`}
      >
        {/* Active indicator - simple bar on left (BASE color) */}
        {isActive && (
          <div className="absolute left-0 top-0 h-full w-0.5 bg-[var(--base)] rounded-r" />
        )}

        {/* Icon with clean styling - 8pt system: w-9 (36px close to 32px), h-9 (36px), rounded-lg (8px) */}
        <div
          className={`relative w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-200 ${
            isActive
              ? 'bg-white/10'
              : 'bg-white/5 group-hover:bg-white/10'
          }`}
        >
          <img
            src={iconPath}
            alt={name}
            className="w-5 h-5 object-contain opacity-90"
          />
        </div>

        <span
          className={`ml-3 font-medium text-sm transition-all duration-200 ${
            isActive
              ? 'text-white'
              : 'text-white/70 group-hover:text-white'
          }`}
        >
          {name}
        </span>
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
      {/* Desktop Sidebar - NEUTRAL 1 background (recessed area) */}
      <aside
        className="hidden lg:flex relative w-64 flex-shrink-0 flex-col bg-[var(--neutral-1-bg)] border-r border-[var(--neutral-border)]"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Subtle BASE accent at top */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[var(--base)]/5 to-transparent pointer-events-none" />

        {/* Logo Section - Display typography (42px) */}
        <div className="flex items-center justify-center px-4 py-6 mb-1 relative">
          <h1
            className="text-[42px] leading-[48px] font-bold text-white tracking-tight"
            style={{ fontFamily: 'Geist Sans, sans-serif' }}
          >
            viewer.gg
          </h1>
        </div>

        {/* Navigation - 8pt spacing */}
        <nav className="flex-1 px-3 pt-2 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--base)]/30 scrollbar-track-transparent">
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

        {/* Footer - 8pt spacing: m-4 (16px), p-3 (12px), rounded-lg (8px) */}
        <div className="m-4 p-3 rounded-lg text-center bg-white/5 border border-[var(--neutral-border)]">
          <p className="text-xs font-medium text-white/70">
            © 2024 viewer.gg
          </p>
          <p className="text-[10px] text-white/50 mt-0.5">Premium Esports Platform</p>
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
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 flex-shrink-0 flex flex-col bg-[var(--neutral-1-bg)] border-r border-[var(--neutral-border)] z-50"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {/* Subtle BASE accent at top */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[var(--base)]/5 to-transparent pointer-events-none" />

              {/* Close button - 8pt spacing: p-2 (8px), rounded-[10px] close to 8px */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-lg text-white/70 hover:text-white hover:bg-[var(--base)]/20 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Logo Section - Display typography (42px) */}
              <div className="flex items-center justify-center px-4 py-6 mb-1 relative">
                <h1
                  className="text-[42px] leading-[48px] font-bold text-white tracking-tight"
                  style={{ fontFamily: 'Geist Sans, sans-serif' }}
                >
                  viewer.gg
                </h1>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 pt-2 overflow-y-auto">
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

              {/* Footer - 8pt spacing */}
              <div className="m-4 p-3 rounded-lg text-center bg-white/5 border border-[var(--neutral-border)]">
                <p className="text-xs font-medium text-white/70">
                  © 2024 viewer.gg
                </p>
                <p className="text-[10px] text-white/50 mt-0.5">Premium Esports Platform</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
