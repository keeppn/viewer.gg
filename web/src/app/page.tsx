"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Simple approach - just check session and redirect accordingly
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('Session found, redirecting to dashboard...');
        router.replace('/dashboard');
      } else {
        console.log('No session, redirecting to login...');
        router.replace('/login');
      }
    }).catch((error) => {
      console.error('Auth check error:', error);
      router.replace('/login');
    });

    // Listen for sign in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Return empty div - no loading screen here to avoid double loading
  // The dashboard layout will show the proper loading screen
  return (
    <div className="min-h-screen bg-[#0D0D0D]" />
  );
}
