"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import Layout from '@/components/layout/Layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { initialize, user, organization } = useAuthStore();
  const { fetchTournaments, fetchApplications } = useAppStore();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkAndInitialize = async () => {
      try {
        // First check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('DashboardLayout: No session found, redirecting to login...');
          router.push('/');
          return;
        }

        setHasSession(true);
        
        // Initialize the auth store to get user profile and organization
        await initialize();
        setChecking(false);
        
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        router.push('/');
      }
    };

    checkAndInitialize();
  }, [initialize, router]);

  // Fetch data when user and organization are ready
  useEffect(() => {
    if (user && organization) {
      console.log('Fetching data for organization:', organization.id);
      fetchTournaments(organization.id).catch(err => {
        console.error('Failed to fetch tournaments:', err);
      });
      fetchApplications(organization.id).catch(err => {
        console.error('Failed to fetch applications:', err);
      });
    }
  }, [user, organization, fetchTournaments, fetchApplications]);

  // Show loading while checking authentication
  if (checking) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#387B66] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-xl">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // If we have a session but no user yet, show loading
  if (hasSession && !user) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#387B66] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-xl">Setting up profile...</div>
        </div>
      </div>
    );
  }

  // If no session at all, don't render (will redirect)
  if (!hasSession) {
    return null;
  }

  return <Layout>{children}</Layout>;
}
