"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleIcon, DiscordIcon } from '@/components/icons/Icons';

interface LoginPageProps {
  onSignIn: (provider: 'google' | 'discord') => Promise<void>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSignIn }) => {
  const [isLoading, setIsLoading] = useState<'google' | 'discord' | null>(null);

  const handleProviderClick = async (provider: 'google' | 'discord') => {
    setIsLoading(provider);
    try {
      await onSignIn(provider);
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-[#1F1F1F]">
      {/* Subtle animated orbs with new color scheme */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#DAFF7C] rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-[#9381FF] rounded-full blur-[100px]"
      />

      <div className="relative z-10 max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-left space-y-6 px-4"
        >
          {/* Logo and name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#DAFF7C] rounded-[10px] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#1F1F1F" className="w-9 h-9">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-5xl font-bold text-white tracking-tight font-['Poppins']">
                  viewer<span className="text-[#DAFF7C]">.gg</span>
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-[#DAFF7C] to-transparent rounded-full mt-2" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight font-['Poppins']">
              Tournament Management
              <br />
              <span className="text-[#DAFF7C]">
                Made Simple
              </span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Streamline your esports tournaments with powerful tools for application management, 
              live stream tracking, and comprehensive analytics—all in one place.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 gap-4 pt-4"
          >
            {[
              { icon: '📊', label: 'Real-time Analytics' },
              { icon: '🎮', label: 'Multi-platform Support' },
              { icon: '⚡', label: 'Discord Integration' },
              { icon: '📈', label: 'Growth Insights' },
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-[#2A2A2A] border border-white/10 rounded-[10px]"
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-sm text-gray-300 font-medium font-['Poppins']">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex justify-center md:justify-end"
        >
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-[#2A2A2A] border border-white/10 rounded-[10px] p-8 md:p-10"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#DAFF7C]/10 border border-[#DAFF7C]/30 rounded-full mb-4">
                  <div className="w-2 h-2 bg-[#DAFF7C] rounded-full animate-pulse" />
                  <span className="text-sm text-[#DAFF7C] font-semibold font-['Poppins']">Tournament Organizers</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2 font-['Poppins']">Sign In / Sign Up</h3>
                <p className="text-gray-400 font-['Poppins']">Start managing your tournaments</p>
              </div>

              {/* Sign in buttons */}
              <div className="space-y-4">
                {/* Google Sign In */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProviderClick('google')}
                  disabled={isLoading !== null}
                  className="w-full relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-[10px] transition-all duration-200 font-['Poppins']">
                    {isLoading === 'google' ? (
                      <div className="w-6 h-6 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                    ) : (
                      <>
                        <GoogleIcon className="w-6 h-6" />
                        <span>Continue with Google</span>
                      </>
                    )}
                  </div>
                </motion.button>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#2A2A2A] text-gray-500 font-medium font-['Poppins']">or</span>
                  </div>
                </div>

                {/* Discord Sign In */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProviderClick('discord')}
                  disabled={isLoading !== null}
                  className="w-full relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5865F2]/0 via-[#5865F2]/10 to-[#5865F2]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold rounded-[10px] transition-all duration-200 font-['Poppins']">
                    {isLoading === 'discord' ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <DiscordIcon className="w-6 h-6" />
                        <span>Continue with Discord</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </div>

              {/* Info box */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 p-4 bg-[#9381FF]/10 border border-[#9381FF]/20 rounded-[10px]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#9381FF]/20 rounded-[10px] flex items-center justify-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#9381FF" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 font-medium mb-1 font-['Poppins']">New to viewer.gg?</p>
                    <p className="text-xs text-gray-400 leading-relaxed font-['Poppins']">
                      Your account will be created automatically when you sign in with Google or Discord. You'll get instant access to the dashboard and can start managing tournaments right away.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 text-center"
              >
                <p className="text-xs text-gray-500 font-['Poppins']">
                  By continuing, you agree to our{' '}
                  <a href="#" className="text-[#DAFF7C] hover:text-[#9381FF] transition-colors">Terms</a>
                  {' '}and{' '}
                  <a href="#" className="text-[#DAFF7C] hover:text-[#9381FF] transition-colors">Privacy Policy</a>
                </p>
              </motion.div>
            </motion.div>

            {/* Streamer CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-6 text-center p-4 bg-[#2A2A2A] border border-white/10 rounded-[10px]"
            >
              <p className="text-sm text-gray-400 mb-2 font-['Poppins']">
                Are you a streamer looking to apply?
              </p>
              <a
                href="/apply"
                className="inline-flex items-center gap-2 text-[#DAFF7C] hover:text-[#9381FF] font-semibold transition-colors group font-['Poppins']"
              >
                <span>Visit Application Portal</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#DAFF7C] to-transparent opacity-50" />
    </div>
  );
};

export default LoginPage;
