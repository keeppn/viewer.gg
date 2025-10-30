"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TwitchIcon, YouTubeIcon, KickIcon } from '@/components/icons/Icons';

interface StreamerSignUpProps {
  onBack: () => void;
  onSignIn: (provider: 'twitch' | 'youtube' | 'kick') => void;
  onSwitchToLogin: () => void;
}

const StreamerSignUp: React.FC<StreamerSignUpProps> = ({ onBack, onSignIn, onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState<'twitch' | 'youtube' | 'kick' | null>(null);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  const handleProviderClick = async (provider: 'twitch' | 'youtube' | 'kick') => {
    setIsLoading(provider);
    try {
      await onSignIn(provider);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9146FF]/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF0000]/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full"
      >
        {/* Back button */}
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to role selection</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#9146FF] to-[#7d3dd9] rounded-2xl mb-4 shadow-lg shadow-[#9146FF]/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Streamer</h1>
          </div>
          <p className="text-gray-400 text-lg">Connect your streaming platform</p>
        </motion.div>

        {/* Sign up card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1E1E1E]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Create Streamer Account</h2>
          <p className="text-gray-400 text-center mb-8">Choose your streaming platform to continue</p>

          <div className="space-y-4">
            {/* Twitch Sign Up */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredPlatform('twitch')}
              onHoverEnd={() => setHoveredPlatform(null)}
              onClick={() => handleProviderClick('twitch')}
              disabled={isLoading !== null}
              className="w-full relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#9146FF]/0 via-[#9146FF]/20 to-[#9146FF]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative flex items-center justify-center gap-4 px-6 py-4 bg-[#9146FF] hover:bg-[#7d3dd9] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#9146FF]/30">
                {isLoading === 'twitch' ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <TwitchIcon className="w-8 h-8" />
                    <span>Sign up with Twitch</span>
                  </>
                )}
              </div>
              {hoveredPlatform === 'twitch' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[#9146FF] text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap"
                >
                  Most popular platform
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#9146FF]" />
                </motion.div>
              )}
            </motion.button>

            {/* YouTube Sign Up */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredPlatform('youtube')}
              onHoverEnd={() => setHoveredPlatform(null)}
              onClick={() => handleProviderClick('youtube')}
              disabled={isLoading !== null}
              className="w-full relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF0000]/0 via-[#FF0000]/20 to-[#FF0000]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative flex items-center justify-center gap-4 px-6 py-4 bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#FF0000]/30">
                {isLoading === 'youtube' ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <YouTubeIcon className="w-8 h-8" />
                    <span>Sign up with YouTube</span>
                  </>
                )}
              </div>
              {hoveredPlatform === 'youtube' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[#FF0000] text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap"
                >
                  Live streaming & VODs
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#FF0000]" />
                </motion.div>
              )}
            </motion.button>

            {/* Kick Sign Up */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredPlatform('kick')}
              onHoverEnd={() => setHoveredPlatform(null)}
              onClick={() => handleProviderClick('kick')}
              disabled={isLoading !== null}
              className="w-full relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#53FC18]/0 via-[#53FC18]/20 to-[#53FC18]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative flex items-center justify-center gap-4 px-6 py-4 bg-[#53FC18] hover:bg-[#3dd912] text-black font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#53FC18]/30">
                {isLoading === 'kick' ? (
                  <div className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <KickIcon className="w-8 h-8" />
                    <span>Sign up with Kick</span>
                  </>
                )}
              </div>
              {hoveredPlatform === 'kick' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[#53FC18] text-black text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap"
                >
                  Growing platform
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#53FC18]" />
                </motion.div>
              )}
            </motion.button>
          </div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-4 bg-[#9146FF]/10 border border-[#9146FF]/20 rounded-xl"
          >
            <p className="text-sm text-gray-300 mb-3 font-medium">What you get:</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9146FF]" />
                Access to exclusive co-streaming opportunities
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9146FF]" />
                One-click application to tournaments
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9146FF]" />
                Real-time notifications & updates
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9146FF]" />
                Profile showcasing & discovery
              </li>
            </ul>
          </motion.div>

          {/* Additional platforms notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
          >
            <p className="text-xs text-blue-300 text-center">
              💡 You can connect additional platforms after signing up
            </p>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-[#9146FF] hover:text-[#7d3dd9] font-medium transition-colors underline decoration-[#9146FF]/30 hover:decoration-[#9146FF]"
              >
                Log in
              </button>
            </p>
          </motion.div>

          <p className="text-gray-600 text-xs text-center mt-6">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StreamerSignUp;
