"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Login from '@/components/pages/Login';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Fix for React strict mode - don't change loading state on server
  useEffect(() => {
    // This ensures we only set loading state on client
    setIsLoading(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session) {
            console.log('Active session found, redirecting to dashboard...');
            router.push('/dashboard');
          } else {
            console.log('No active session, showing login page');
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Check auth immediately
    checkAuth();

    // Add a timeout failsafe - if still loading after 3 seconds, show login
    timeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        console.log('Auth check timeout, showing login page');
        setIsLoading(false);
      }
    }, 3000);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setIsLoading(false);
        }
      } else if (event === 'INITIAL_SESSION' && !session) {
        // No initial session, show login
        if (mounted) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#387B66] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-xl">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Show login page
  return <Login />;
}
