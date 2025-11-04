"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Login from '@/components/pages/Login';

// Force dynamic rendering - no static generation or caching
export const dynamic = 'force-dynamic';


export default function HomePage() {
  const router = useRouter();
  const { user, initialized, initialize, loading, isInitializing } = useAuthStore();
  const [initError, setInitError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    console.log('HomePage mounted');
    console.log('Initialized:', initialized, 'Loading:', loading, 'IsInitializing:', isInitializing);
    console.log('User:', user);
    
    // Initialize auth if not already done or initializing
    if (!initialized && !isInitializing) {
      console.log('Calling initialize...');
      initialize().catch(err => {
        console.error('Initialize failed:', err);
        setInitError(true);
      });
    }
  }, [mounted, initialized, loading, isInitializing, initialize]);

  useEffect(() => {
    if (!mounted) return;
    
    // Redirect to dashboard if user is logged in
    if (initialized && user) {
      console.log('User authenticated, redirecting to dashboard...');
      router.replace('/dashboard');
    }
  }, [mounted, user, initialized, router]);

  // Show login page if:
  // 1. Auth is initialized and there's no user, OR
  // 2. There was an error initializing
  const showLogin = (initialized && !user) || initError;

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return null;
  }

  // Show loading only if not initialized and no error
  if (!initialized && !initError) {
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
