"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Login from '@/components/pages/Login';

export default function HomePage() {
  const router = useRouter();
  const { user, initialized, initialize } = useAuthStore();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    console.log('HomePage mounted');
    console.log('Initialized:', initialized);
    console.log('User:', user);
    
    if (!initialized) {
      console.log('Calling initialize...');
      initialize().catch(err => {
        console.error('Initialize failed:', err);
      });
    }
  }, [initialized, initialize]);

  useEffect(() => {
    if (initialized && user) {
      console.log('Redirecting to dashboard...');
      router.push('/dashboard');
    }
  }, [user, initialized, router]);

  // Timeout fallback - if still not initialized after 10 seconds, show login anyway
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('Timeout reached, forcing initialized state');
      setTimeoutReached(true);
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  if (!initialized && !timeoutReached) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return <Login />;
}
