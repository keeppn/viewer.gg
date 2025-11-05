"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Login from '@/components/pages/Login';

export default function HomePage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Simple approach - just check session and show login if not found
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('Session found, redirecting...');
        router.push('/dashboard');
      } else {
        console.log('No session, showing login');
        setShowLogin(true);
      }
    }).catch((error) => {
      console.error('Auth check error:', error);
      setShowLogin(true);
    });

    // Listen for sign in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // If showLogin is true, show the login page
  if (showLogin) {
    return <Login />;
  }

  // Otherwise show loading
  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-[#387B66] border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-white text-xl">Loading...</div>
      </div>
    </div>
  );
}
