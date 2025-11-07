"use client";

import { useRouter } from 'next/navigation';
import SignUpPage from '@/components/pages/SignUpPage';
import { signUpWithEmail, signInWithProvider } from '@/lib/supabase';

export default function SignUp() {
  const router = useRouter();

  const handleSignUp = async (email: string, password: string) => {
    try {
      const result = await signUpWithEmail(email, password);
      
      // Check if email confirmation is required
      if (result.user && !result.session) {
        alert('Please check your email to confirm your account!');
        router.push('/login');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Sign up failed');
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
    <SignUpPage 
      onSignUp={handleSignUp}
      onSignInWithProvider={handleProviderSignIn}
    />
  );
}
