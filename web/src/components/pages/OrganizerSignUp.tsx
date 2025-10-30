"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleIcon, DiscordIcon } from '@/components/icons/Icons';

interface OrganizerSignUpProps {
  onBack: () => void;
  onSignIn: (provider: 'google' | 'discord') => void;
  onSwitchToLogin: () => void;
}

const OrganizerSignUp: React.FC<OrganizerSignUpProps> = ({ onBack, onSignIn, onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState<'google' | 'discord' | null>(null);

  const handleProviderClick = async (provider: 'google' | 'discord') => {
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
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#387B66]/20 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#2a5f50]/20 rounded-full blur-3xl"
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
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#387B66] to-[#2a5f50] rounded-2xl mb-4 shadow-lg shadow-[#387B66]/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Tournament Organizer</h1>
          </div>
          <p className="text-gray-400 text-lg">Sign up to start managing tournaments</p>
        </motion.div>

        {/* Sign up card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1E1E1E]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Create Account</h2>
          <p className="text-gray-400 text-center mb-8">Choose your preferred sign-up method</p>

          <div className="space-y-4">
            {/* Google Sign Up */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProviderClick('google')}
              disabled={isLoading !== null}
              className="w-full relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative flex items-center justify-center gap-4 px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl transition-all duration-200 shadow-lg">
                {isLoading === 'google' ? (
                  <div className="w-6 h-6 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <GoogleIcon className="w-6 h-6" />
                    <span>Sign up with Google</span>
                  </>
                )}
              </div>
            </motion.button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#1E1E1E] text-gray-500">or</span>
              </div>
            </div>

            {/* Discord Sign Up */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProviderClick('discord')}
              disabled={isLoading !== null}
              className="w-full relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#5865F2]/0 via-[#5865F2]/10 to-[#5865F2]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative flex items-center justify-center gap-4 px-6 py-4 bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#5865F2]/20">
                {isLoading === 'discord' ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <DiscordIcon className="w-6 h-6" />
                    <span>Sign up with Discord</span>
                  </>
                )}
              </div>
            </motion.button>
          </div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-4 bg-[#387B66]/10 border border-[#387B66]/20 rounded-xl"
          >
            <p className="text-sm text-gray-300 mb-3 font-medium">What you get:</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#387B66]" />
                Full tournament management dashboard
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#387B66]" />
                Automatic organization creation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#387B66]" />
                Discord integration & automation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#387B66]" />
                Advanced analytics & reporting
              </li>
            </ul>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-[#387B66] hover:text-[#2a5f50] font-medium transition-colors underline decoration-[#387B66]/30 hover:decoration-[#387B66]"
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

export default OrganizerSignUp;
