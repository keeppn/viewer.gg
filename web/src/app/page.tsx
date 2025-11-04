"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Login from '@/components/pages/Login';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have an active session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Active session found, redirecting to dashboard...');
          setHasSession(true);
          router.push('/dashboard');
        } else {
          console.log('No active session, showing login page');
          setChecking(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setChecking(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        setHasSession(false);
        setChecking(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Show loading state while checking
  if (checking || hasSession) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#387B66] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-xl">
            {hasSession ? 'Redirecting to dashboard...' : 'Checking authentication...'}
          </div>
        </div>
      </div>
    );
  }

  return <Login />;
}
