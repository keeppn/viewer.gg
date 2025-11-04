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
      fetchTournaments(organization.id);
      fetchApplications(organization.id);
    } else if (user && !organization) {
      console.log('User has no organization assigned');
    }
  }, [mounted, user, organization, fetchTournaments, fetchApplications]);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  // Show loading only while auth is initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#387B66] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return <Layout>{children}</Layout>;
}
