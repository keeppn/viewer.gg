"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { signInWithProvider } from '@/lib/supabase';
import AuthLayout from './AuthLayout';

const Login: React.FC = () => {
  const router = useRouter();
  const { loading } = useAuthStore();

  const handleAuthenticate = async (provider: string, userType: 'organizer' | null) => {
    try {
      // All signups are for organizers now
      await signInWithProvider(provider as any, 'organizer');
      // OAuth will redirect, no need to do anything here
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e13] via-[#1a2332] to-[#0f1419] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return <AuthLayout onAuthenticate={handleAuthenticate} />;
};

export default Login;
