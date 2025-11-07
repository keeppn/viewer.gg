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
        whileHover={{ x: 4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative flex items-center px-4 py-3.5 my-1.5 rounded-xl cursor-pointer transition-all duration-300 group overflow-hidden ${
          isActive
            ? 'bg-gradient-to-r from-[#00F0FF]/10 to-[#9945FF]/10 text-white shadow-lg shadow-[#00F0FF]/20'
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
      >
        {/* Cyberpunk circuit board pattern for active state */}
        {isActive && (
          <>
            <motion.div 
              layoutId="activeIndicator"
              className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#00F0FF] via-[#9945FF] to-[#FF073A] rounded-r-full"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                boxShadow: '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(153, 69, 255, 0.3)'
              }}
            />
            {/* Holographic background effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/5 to-[#9945FF]/5 rounded-xl"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </>
        )}
        
        {/* Icon with neon glow effect */}
        <motion.div 
          className={`relative w-6 h-6 flex-shrink-0 z-10 ${
            isActive ? 'text-[#00F0FF]' : 'text-gray-400 group-hover:text-[#00F0FF]'
          }`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
          style={isActive ? {
            filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.6))',
          } : {}}
        >
          {icon}
        </motion.div>
        
        <span className={`ml-4 font-semibold tracking-wide z-10 ${
          isActive 
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#9945FF]' 
            : 'text-gray-400 group-hover:text-white'
        }`}>
          {name}
        </span>
        
        {/* Hover glow effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/0 via-[#00F0FF]/5 to-transparent rounded-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)'
          }}
        />
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
      <aside className="hidden lg:flex relative w-64 flex-shrink-0 flex-col shadow-2xl border-r border-white/10 backdrop-blur-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 14, 27, 0.95), rgba(30, 10, 60, 0.85))',
          boxShadow: 'inset 0 0 30px rgba(0, 240, 255, 0.1), 0 0 60px rgba(153, 69, 255, 0.2)'
        }}
      >
        {/* Cyber grid background */}
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
        
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center p-6 mb-4 z-10"
        >
          <motion.div 
            className="relative w-10 h-10 flex items-center justify-center"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <img 
              src="/viewer-logo/viewer-logo-transparent.svg" 
              alt="Viewer.gg Logo" 
              className="w-full h-full object-contain"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.5))'
              }}
            />
          </motion.div>
          <h1 className="text-2xl font-bold ml-3 text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#9945FF] to-[#FFB800] font-[family-name:var(--font-display)]"
            style={{
              textShadow: '0 0 20px rgba(0, 240, 255, 0.5)'
            }}
          >
            viewer.gg
          </h1>
        </motion.div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto scrollbar-thin z-10">
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
          className="relative m-4 p-4 rounded-xl text-center border overflow-hidden z-10 backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.05), rgba(153, 69, 255, 0.05))',
            borderColor: 'rgba(0, 240, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(0, 240, 255, 0.15)'
          }}
        >
          {/* Animated border effect */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(45deg, #00F0FF, #9945FF, #FF073A, #39FF14)',
              opacity: 0.3,
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <div className="relative z-10">
            <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#9945FF]">
              © 2024 viewer.gg
            </p>
            <p className="text-xs text-gray-400 mt-1">Ultra High-Tech Esports</p>
          </div>
        </motion.div>
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
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 flex-shrink-0 flex flex-col shadow-2xl border-r border-white/10 backdrop-blur-xl z-50 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 14, 27, 0.98), rgba(30, 10, 60, 0.95))',
                boxShadow: 'inset 0 0 30px rgba(0, 240, 255, 0.1), 0 0 60px rgba(153, 69, 255, 0.2)'
              }}
            >
              {/* Cyber grid background */}
              <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
              
              {/* Close button */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 z-50 p-2 rounded-lg text-gray-400 hover:text-white transition-colors backdrop-blur-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Logo Section */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative flex items-center p-6 mb-4 z-10"
              >
                <motion.div 
                  className="relative w-10 h-10 flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <img 
                    src="/viewer-logo/viewer-logo-transparent.svg" 
                    alt="Viewer.gg Logo" 
                    className="w-full h-full object-contain"
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.5))'
                    }}
                  />
                </motion.div>
                <h1 className="text-2xl font-bold ml-3 text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#9945FF] to-[#FFB800] font-[family-name:var(--font-display)]"
                  style={{
                    textShadow: '0 0 20px rgba(0, 240, 255, 0.5)'
                  }}
                >
                  viewer.gg
                </h1>
              </motion.div>
              
              {/* Navigation */}
              <nav className="flex-1 px-4 overflow-y-auto scrollbar-thin z-10">
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
                className="relative m-4 p-4 rounded-xl text-center border overflow-hidden z-10 backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.05), rgba(153, 69, 255, 0.05))',
                  borderColor: 'rgba(0, 240, 255, 0.2)',
                  boxShadow: '0 8px 32px 0 rgba(0, 240, 255, 0.15)'
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(45deg, #00F0FF, #9945FF, #FF073A, #39FF14)',
                    opacity: 0.3,
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />
                <div className="relative z-10">
                  <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#9945FF]">
                    © 2024 viewer.gg
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Ultra High-Tech Esports</p>
                </div>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
