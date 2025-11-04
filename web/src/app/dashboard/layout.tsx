"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import Layout from '@/components/layout/Layout';

// Note: dynamic and revalidate exports don't work in Client Components
// These are Server Component features only

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, organization, loading, initialized, initialize, isInitializing } = useAuthStore();
  const { fetchTournaments, fetchApplications } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize auth with retry logic
  useEffect(() => {
    if (!mounted) return;
    
    const initAuth = async () => {
      if (!initialized && !isInitializing) {
        console.log('DashboardLayout: Initializing auth... (retry:', retryCount, ')');
        try {
          await initialize();
        } catch (error) {
          console.error('Auth initialization failed:', error);
          if (retryCount < MAX_RETRIES) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 2000);
          } else {
            console.error('Max retries reached. Redirecting to login...');
            router.push('/');
          }
        }
      }
    };
    
    initAuth();
  }, [mounted, initialized, isInitializing, initialize, retryCount, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!mounted) return;
    
    if (initialized && !user && !loading) {
      console.log('DashboardLayout: Not authenticated, redirecting to login...');
      router.push('/');
    }
  }, [mounted, user, loading, initialized, router]);

  // Fetch data when user is authenticated
  useEffect(() => {
    if (!mounted) return;
    
    if (user && organization) {
      console.log('Fetching data for organization:', organization.id);
      fetchTournaments(organization.id).catch(err => {
        console.error('Failed to fetch tournaments:', err);
      });
      fetchApplications(organization.id).catch(err => {
        console.error('Failed to fetch applications:', err);
      });
    } else if (user && !organization) {
      console.log('User has no organization assigned - will be created on next auth check');
    }
  }, [mounted, user, organization, fetchTournaments, fetchApplications]);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  // Show loading with timeout protection
  if (!initialized || loading) {
    // Add a timeout to prevent infinite loading
    setTimeout(() => {
      if (!initialized && retryCount >= MAX_RETRIES) {
        console.error('Auth initialization timeout. Please clear cache and try again.');
        router.push('/clear-auth');
      }
    }, 10000); // 10 second timeout
    
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#387B66] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
          {retryCount > 0 && (
            <div className="text-gray-400 text-sm mt-2">Retry attempt {retryCount}/{MAX_RETRIES}</div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return <Layout>{children}</Layout>;
}
