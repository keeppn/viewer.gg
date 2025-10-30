"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { signInWithProvider } from '@/lib/supabase';
import AuthLayout from './AuthLayout';

const Login: React.FC = () => {
  const router = useRouter();
  const { loading } = useAuthStore();

  const handleAuthenticate = async (provider: string, userType: 'organizer' | 'streamer' | null) => {
    try {
      await signInWithProvider(provider as any, userType);
      // OAuth will redirect, no need to do anything here
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return <AuthLayout onAuthenticate={handleAuthenticate} />;
};

export default Login;
