"use client";

import { useRouter } from 'next/navigation';
import LoginPageNew from '@/components/pages/LoginPageNew';
import { signInWithEmail, signInWithProvider } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      router.push('/dashboard');
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const handleProviderSignIn = async (provider: 'google' | 'discord') => {
    try {
      await signInWithProvider(provider, 'organizer');
    } catch (error: any) {
      console.error('Provider sign in error:', error);
      throw error;
    }
  };

  return (
    <LoginPageNew 
      onLogin={handleLogin}
      onSignInWithProvider={handleProviderSignIn}
    />
  );
}
