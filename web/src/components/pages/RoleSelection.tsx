"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type UserType = 'organizer' | 'streamer' | null;

interface RoleSelectionProps {
  onRoleSelect: (role: UserType) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState<UserType>(null);
  const [hoveredRole, setHoveredRole] = useState<UserType>(null);

  const handleRoleClick = (role: UserType) => {
    setSelectedRole(role);
    // Delay for animation before proceeding
    setTimeout(() => {
      onRoleSelect(role);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#387B66]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFCB82]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-6">
            <div className="px-8 py-4 bg-gradient-to-r from-[#387B66] to-[#2a5f50] rounded-3xl shadow-2xl shadow-[#387B66]/20">
              <h1 className="text-5xl font-bold text-white tracking-tight">viewer.gg</h1>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Welcome! Choose Your Path</h2>
          <p className="text-gray-400 text-lg">Select how you'd like to use viewer.gg</p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Tournament Organizer Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHoveredRole('organizer')}
            onHoverEnd={() => setHoveredRole(null)}
            onClick={() => handleRoleClick('organizer')}
            className="relative cursor-pointer group"
          >
            <div className={`
              relative h-full bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] 
              rounded-3xl p-8 border-2 transition-all duration-300
              ${selectedRole === 'organizer' ? 'border-[#387B66] shadow-2xl shadow-[#387B66]/30' : 'border-white/10 hover:border-[#387B66]/50'}
            `}>
              {/* Glow effect */}
              <div className={`
                absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300
                ${hoveredRole === 'organizer' ? 'opacity-100' : ''}
                bg-gradient-to-br from-[#387B66]/20 to-transparent
              `}></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-20 h-20 mb-6 bg-gradient-to-br from-[#387B66] to-[#2a5f50] rounded-2xl flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-3">Tournament Organizer</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Manage tournaments, review streamer applications, and track co-streaming analytics
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-[#387B66]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#387B66]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Create and manage tournaments</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-[#387B66]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#387B66]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Review and approve applications</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-[#387B66]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#387B66]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Access analytics and reports</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-[#387B66]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#387B66]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Discord integration</span>
                  </li>
                </ul>

                {/* Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    w-full py-4 rounded-xl font-semibold transition-all duration-300
                    ${selectedRole === 'organizer' 
                      ? 'bg-[#387B66] text-white shadow-lg shadow-[#387B66]/30' 
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                    }
                  `}
                >
                  {selectedRole === 'organizer' ? 'Selected ✓' : 'Select Organizer'}
                </motion.button>
              </div>

              {/* Selected indicator */}
              <AnimatePresence>
                {selectedRole === 'organizer' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-4 right-4 w-8 h-8 bg-[#387B66] rounded-full flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Streamer Card */}
          {/* Streamer Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHoveredRole('streamer')}
            onHoverEnd={() => setHoveredRole(null)}
            onClick={() => handleRoleClick('streamer')}
            className="relative cursor-pointer group"
          >
            <div className={`
              relative h-full bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] 
              rounded-3xl p-8 border-2 transition-all duration-300
              ${selectedRole === 'streamer' ? 'border-[#9146FF] shadow-2xl shadow-[#9146FF]/30' : 'border-white/10 hover:border-[#9146FF]/50'}
            `}>
              {/* Glow effect */}
              <div className={`
                absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300
                ${hoveredRole === 'streamer' ? 'opacity-100' : ''}
                bg-gradient-to-br from-[#9146FF]/20 to-transparent
              `}></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-20 h-20 mb-6 bg-gradient-to-br from-[#9146FF] to-[#7d3dd9] rounded-2xl flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-3">Streamer</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Apply to tournaments, showcase your channel, and grow your streaming career
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-[#9146FF]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#9146FF]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Apply to co-stream tournaments</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-[#9146FF]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#9146FF]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Track your applications</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-[#9146FF]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#9146FF]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Connect multiple platforms</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-[#9146FF]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#9146FF]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Receive notifications</span>
                  </li>
                </ul>

                {/* Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    w-full py-4 rounded-xl font-semibold transition-all duration-300
                    ${selectedRole === 'streamer' 
                      ? 'bg-[#9146FF] text-white shadow-lg shadow-[#9146FF]/30' 
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                    }
                  `}
                >
                  {selectedRole === 'streamer' ? 'Selected ✓' : 'Select Streamer'}
                </motion.button>
              </div>

              {/* Selected indicator */}
              <AnimatePresence>
                {selectedRole === 'streamer' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-4 right-4 w-8 h-8 bg-[#9146FF] rounded-full flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-gray-500 text-sm mt-12"
        >
          Choose the option that best describes you. You can always adjust later.
        </motion.p>
      </div>
    </div>
  );
};

export default RoleSelection;
