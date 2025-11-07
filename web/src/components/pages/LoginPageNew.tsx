"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleIcon, DiscordIcon } from '@/components/icons/Icons';
import Link from 'next/link';

interface LoginPageNewProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignInWithProvider: (provider: 'google' | 'discord') => Promise<void>;
}

const LoginPageNew: React.FC<LoginPageNewProps> = ({ onLogin, onSignInWithProvider }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProviderLoading, setIsProviderLoading] = useState<'google' | 'discord' | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderClick = async (provider: 'google' | 'discord') => {
    setIsProviderLoading(provider);
    try {
      await onSignInWithProvider(provider);
    } catch (error) {
      console.error('Sign in error:', error);
      setIsProviderLoading(null);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e13] via-[#1a2332] to-[#0f1419]" />
      
      {/* Animated orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#387B66] rounded-full blur-[120px] opacity-40"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-[#2a5f50] rounded-full blur-[100px] opacity-30"
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

      <div className="relative z-10 max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#1a1f2e]/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#387B66]/10 border border-[#387B66]/30 rounded-full mb-4">
              <div className="w-2 h-2 bg-[#387B66] rounded-full animate-pulse" />
              <span className="text-sm text-[#387B66] font-semibold">Tournament Organizers</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Welcome Back</h3>
            <p className="text-gray-400">Sign in to manage your tournaments</p>
          </div>

          {/* Social Sign In */}
          <div className="space-y-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProviderClick('google')}
              disabled={isProviderLoading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl transition-all"
            >
              {isProviderLoading === 'google' ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              ) : (
                <>
                  <GoogleIcon className="w-5 h-5" />
                  <span>Continue with Google</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProviderClick('discord')}
              disabled={isProviderLoading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold rounded-xl transition-all"
            >
              {isProviderLoading === 'discord' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <DiscordIcon className="w-5 h-5" />
                  <span>Continue with Discord</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1a1f2e] text-gray-500 font-medium">or sign in with email</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#387B66] transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#387B66] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#387B66] focus:ring-[#387B66]" />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-[#387B66] hover:text-[#4a9080] transition-colors">
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#387B66] to-[#4a9080] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#387B66]/30"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#387B66] hover:text-[#4a9080] font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Streamer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
        >
          <p className="text-sm text-gray-400 mb-2">
            Are you a streamer looking to apply?
          </p>
          <a
            href="/apply"
            className="inline-flex items-center gap-2 text-[#387B66] hover:text-[#4a9080] font-semibold transition-colors group"
          >
            <span>Visit Application Portal</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPageNew;
