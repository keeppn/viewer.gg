'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { OverviewIcon, TournamentIcon, AnalyticsIcon, ApplicationIcon, ReportIcon, SettingsIcon, LogoIcon, LiveIcon } from '../icons/Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavItem: React.FC<{
  name: string;
  icon: React.ReactNode;
  path: string;
  index: number;
  onClose: () => void;
}> = ({ name, icon, path, index, onClose }) => {
  const pathname = usePathname();
  const isActive = pathname === path;
  
  return (
    <Link href={path} onClick={onClose}>
      <motion.li
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ x: 4 }}
        className={`relative flex items-center p-3 my-2 rounded-xl cursor-pointer transition-all duration-300 group ${
          isActive
            ? 'bg-gradient-to-r from-[#387B66]/20 to-[#387B66]/10 text-white shadow-lg'
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div 
            layoutId="activeIndicator"
            className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#387B66] to-[#4a9978] rounded-r-full"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        
        {/* Icon with hover effect */}
        <motion.div 
          className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-[#FFCB82]' : 'text-gray-400 group-hover:text-[#FFCB82]'}`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {icon}
        </motion.div>
        
        <span className={`ml-4 font-semibold ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
          {name}
        </span>
        
        {/* Hover glow effect */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#387B66]/10 to-transparent rounded-xl blur-sm -z-10" />
        )}
      </motion.li>
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
      <aside className="hidden lg:flex relative w-64 bg-gradient-to-b from-[#1E1E1E] to-[#1A1A1A] p-6 flex-shrink-0 flex-col shadow-2xl border-r border-white/5 backdrop-blur-xl">
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-12"
        >
          <div className="p-2 bg-gradient-to-br from-[#387B66] to-[#2d6352] rounded-xl shadow-lg">
            <LogoIcon />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent ml-3">
            viewer.gg
          </h1>
        </motion.div>
        
        {/* Navigation */}
        <nav className="flex-1">
          <ul>
            {pages.map(({ name, icon, path }, index) => (
              <NavItem
                key={name}
                name={name}
                icon={icon}
                path={path}
                index={index}
                onClose={() => {}}
              />
            ))}
          </ul>
        </nav>
        
        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-auto p-4 bg-gradient-to-r from-black/20 to-black/10 rounded-xl text-center border border-white/10 backdrop-blur-sm"
        >
          <p className="text-sm font-medium bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
            © 2024 viewer.gg
          </p>
          <p className="text-xs text-gray-500 mt-1">Co-streaming Management</p>
        </motion.div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-[#1E1E1E] to-[#1A1A1A] p-6 flex-shrink-0 flex flex-col shadow-2xl border-r border-white/5 backdrop-blur-xl z-50"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Logo Section */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center mb-12"
            >
              <div className="p-2 bg-gradient-to-br from-[#387B66] to-[#2d6352] rounded-xl shadow-lg">
                <LogoIcon />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent ml-3">
                viewer.gg
              </h1>
            </motion.div>
            
            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto">
              <ul>
                {pages.map(({ name, icon, path }, index) => (
                  <NavItem
                    key={name}
                    name={name}
                    icon={icon}
                    path={path}
                    index={index}
                    onClose={onClose}
                  />
                ))}
              </ul>
            </nav>
            
            {/* Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-auto p-4 bg-gradient-to-r from-black/20 to-black/10 rounded-xl text-center border border-white/10 backdrop-blur-sm"
            >
              <p className="text-sm font-medium bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
                © 2024 viewer.gg
              </p>
              <p className="text-xs text-gray-500 mt-1">Co-streaming Management</p>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
