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
      // IMPORTANT: Clear any existing session before starting OAuth
      // This prevents the wrong account from being used if user was previously logged in
      const { signOut } = await import('@/lib/supabase');
      await signOut().catch(() => {
        // Ignore errors if no session exists
        console.log('No existing session to clear');
      });

      // Small delay to ensure session is fully cleared
      await new Promise(resolve => setTimeout(resolve, 100));

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
