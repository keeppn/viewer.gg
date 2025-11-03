"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Login from '@/components/pages/Login';

// Force dynamic rendering - no static generation or caching
export const dynamic = 'force-dynamic';


export default function HomePage() {
  const router = useRouter();
  const { user, initialized, initialize } = useAuthStore();
  const [initError, setInitError] = useState(false);

  useEffect(() => {
    console.log('HomePage mounted');
    console.log('Initialized:', initialized);
    console.log('User:', user);
    
    // Initialize auth if not already done
    if (!initialized) {
      console.log('Calling initialize...');
      initialize().catch(err => {
        console.error('Initialize failed:', err);
        setInitError(true);
      });
    }
  }, [initialized, initialize]);

  useEffect(() => {
    // Redirect to dashboard if user is logged in
    if (initialized && user) {
      console.log('User authenticated, redirecting to dashboard...');
      router.replace('/dashboard');
    }
  }, [user, initialized, router]);

  // Show login page if:
  // 1. Auth is initialized and there's no user, OR
  // 2. There was an error initializing, OR
  // 3. Still loading after 5 seconds (fallback)
  const [showLogin, setShowLogin] = useState(false);
  
  useEffect(() => {
    if (initialized && !user) {
      setShowLogin(true);
    }
    
    if (initError) {
      setShowLogin(true);
    }
    
    // Fallback timeout - show login after 5 seconds if still loading
    const timeout = setTimeout(() => {
      if (!initialized) {
        console.warn('Auth initialization timeout - showing login page');
        setShowLogin(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [initialized, user, initError]);

  if (!showLogin) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#387B66] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return <Login />;
}
