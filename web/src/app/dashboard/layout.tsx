"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import Layout from '@/components/layout/Layout';

// Disable caching for dashboard
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, organization, loading, initialized, initialize, isInitializing } = useAuthStore();
  const { fetchTournaments, fetchApplications } = useAppStore();
  const [mounted, setMounted] = useState(false);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize auth only if not already initialized
  useEffect(() => {
    if (!mounted) return;
    
    if (!initialized && !isInitializing) {
      console.log('DashboardLayout: Initializing auth...');
      initialize();
    }
  }, [mounted, initialized, isInitializing, initialize]);

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

  // Show loading only while auth is initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#121212] via-[#0D0D0D] to-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-[#387B66]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFCB82]/5 rounded-full blur-3xl" />
        
        <div className="text-center relative z-10">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-[#387B66]/20 border-t-[#387B66] rounded-full animate-spin mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#FFCB82] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="text-white text-2xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return <Layout>{children}</Layout>;
}
