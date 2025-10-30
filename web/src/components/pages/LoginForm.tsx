"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TwitchIcon, YouTubeIcon, KickIcon, GoogleIcon, DiscordIcon } from '@/components/icons/Icons';

interface LoginFormProps {
  onSignIn: (provider: string) => Promise<void>;
  onSwitchToSignUp: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSignIn, onSwitchToSignUp }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleProviderClick = async (provider: string) => {
    setIsLoading(provider);
    try {
      await onSignIn(provider);
    } finally {
      setIsLoading(null);
    }
  };

  const organizerProviders = [
    { id: 'google', name: 'Google', icon: GoogleIcon, color: 'white', hoverColor: 'gray-50', textColor: 'gray-900', shadow: '' },
    { id: 'discord', name: 'Discord', icon: DiscordIcon, color: '[#5865F2]', hoverColor: '[#4752c4]', textColor: 'white', shadow: 'shadow-[#5865F2]/20' },
  ];

  const streamerProviders = [
    { id: 'twitch', name: 'Twitch', icon: TwitchIcon, color: '[#9146FF]', hoverColor: '[#7d3dd9]', textColor: 'white', shadow: 'shadow-[#9146FF]/20' },
    { id: 'youtube', name: 'YouTube', icon: YouTubeIcon, color: '[#FF0000]', hoverColor: '[#CC0000]', textColor: 'white', shadow: 'shadow-[#FF0000]/20' },
    { id: 'kick', name: 'Kick', icon: KickIcon, color: '[#53FC18]', hoverColor: '[#3dd912]', textColor: 'black', shadow: 'shadow-[#53FC18]/20' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#387B66]/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-[#9146FF]/15 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full"
      >
        {/* Logo Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block mb-6 cursor-pointer"
          >
            <div className="px-8 py-4 bg-gradient-to-r from-[#387B66] to-[#2a5f50] rounded-3xl shadow-2xl shadow-[#387B66]/30">
              <h1 className="text-5xl font-bold text-white tracking-tight">viewer.gg</h1>
            </div>
          </motion.div>
          <p className="text-gray-400 text-lg">Co-streaming Management Platform</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1E1E1E]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2 text-center">Welcome Back</h2>
          <p className="text-gray-400 text-center mb-8">Sign in to continue to your account</p>

          {/* Organizer Sign In Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#387B66]/50 to-transparent" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tournament Organizers</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#387B66]/50 to-transparent" />
            </div>
            <div className="space-y-3">
              {organizerProviders.map((provider, index) => (
                <motion.button
                  key={provider.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProviderClick(provider.id)}
                  disabled={isLoading !== null}
                  className="w-full relative overflow-hidden group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-${provider.color}/0 via-${provider.color}/10 to-${provider.color}/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`} />
                  <div className={`relative flex items-center justify-center gap-3 px-6 py-3.5 bg-${provider.color} hover:bg-${provider.hoverColor} text-${provider.textColor} font-semibold rounded-xl transition-all duration-200 shadow-lg ${provider.shadow}`}>
                    {isLoading === provider.id ? (
                      <div className={`w-5 h-5 border-3 border-${provider.textColor}/30 border-t-${provider.textColor} rounded-full animate-spin`} />
                    ) : (
                      <>
                        <provider.icon className="w-6 h-6" />
                        <span>Continue with {provider.name}</span>
                      </>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Main Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1E1E1E] text-gray-500">or</span>
            </div>
          </div>

          {/* Streamer Sign In Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#9146FF]/50 to-transparent" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Streamers</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#9146FF]/50 to-transparent" />
            </div>
            <div className="space-y-3">
              {streamerProviders.map((provider, index) => (
                <motion.button
                  key={provider.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProviderClick(provider.id)}
                  disabled={isLoading !== null}
                  className="w-full relative overflow-hidden group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-${provider.color}/0 via-${provider.color}/10 to-${provider.color}/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`} />
                  <div className={`relative flex items-center justify-center gap-3 px-6 py-3.5 bg-${provider.color} hover:bg-${provider.hoverColor} text-${provider.textColor} font-semibold rounded-xl transition-all duration-200 shadow-lg ${provider.shadow}`}>
                    {isLoading === provider.id ? (
                      <div className={`w-5 h-5 border-3 border-${provider.textColor}/30 border-t-${provider.textColor} rounded-full animate-spin`} />
                    ) : (
                      <>
                        <provider.icon className="w-7 h-7" />
                        <span>Continue with {provider.name}</span>
                      </>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignUp}
                className="text-[#387B66] hover:text-[#2a5f50] font-medium transition-colors underline decoration-[#387B66]/30 hover:decoration-[#387B66]"
              >
                Sign up
              </button>
            </p>
          </motion.div>

          <p className="text-gray-600 text-xs text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>

        {/* Help text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-500 text-sm">
            Need help? <a href="#" className="text-[#387B66] hover:text-[#2a5f50] underline">Contact Support</a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
