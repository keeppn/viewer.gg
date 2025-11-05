"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { signInWithProvider } from '@/lib/supabase';
import AuthLayout from './AuthLayout';

const Login: React.FC = () => {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthenticate = async (provider: string, userType: 'organizer' | null) => {
    try {
      setIsAuthenticating(true);
      // All signups are for organizers now
      await signInWithProvider(provider as any, 'organizer');
      // OAuth will redirect, no need to do anything here
    } catch (error) {
      console.error('Authentication error:', error);
      setIsAuthenticating(false);
      alert('Failed to sign in. Please try again.');
    }
  };

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e13] via-[#1a2332] to-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#387B66] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-xl">
            {isAuthenticating ? 'Redirecting to sign in...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  return <AuthLayout onAuthenticate={handleAuthenticate} />;
};

export default Login;
