"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ClearAuthPage() {
  const router = useRouter();

  useEffect(() => {
    const clearAuth = async () => {
      console.log('Clearing authentication state...');
      
      try {
        // Clear all localStorage items related to auth
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('supabase') || 
            key.includes('auth') || 
            key.includes('user') ||
            key.includes('organization') ||
            key.includes('pending')
          )) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          console.log('Removing localStorage:', key);
          localStorage.removeItem(key);
        });
        
        // Clear sessionStorage as well
        sessionStorage.clear();
        
        // Sign out from Supabase
        await supabase.auth.signOut();
        
        console.log('Auth state cleared successfully');
        
        // Redirect to home page
        setTimeout(() => {
          router.push('/');
        }, 1000);
        
      } catch (error) {
        console.error('Error clearing auth:', error);
      }
    };
    
    clearAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-[#387B66] border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-white text-xl">Clearing authentication...</div>
        <div className="text-gray-400 text-sm mt-2">You will be redirected to the login page</div>
      </div>
    </div>
  );
}
