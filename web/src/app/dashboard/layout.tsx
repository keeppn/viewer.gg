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

  console.log('[DashboardLayout] Rendering - checking:', checking, 'user:', user ? 'EXISTS' : 'NULL', 'organization:', organization ? 'EXISTS' : 'NULL');

  useEffect(() => {
    console.log('[DashboardLayout] useEffect triggered');

    let isMounted = true;

    const checkAndInitialize = async () => {
      try {
        console.log('[DashboardLayout] Calling initialize()...');

        // Let AuthStore handle session checking - it already does this properly
        await initialize();

        console.log('[DashboardLayout] Initialize complete');

        if (isMounted) {
          setChecking(false);
        }

      } catch (error) {
        console.error('Dashboard initialization error:', error);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        if (isMounted) {
          setChecking(false);
        }
      }
    };

    checkAndInitialize();

    return () => {
      isMounted = false;
    };
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

  // Show loading while initializing auth
  if (checking) {
    console.log('[DashboardLayout] Rendering: Loading dashboard (checking=true)');
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
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  // After initialization, if no user found, redirect to login
  if (!user) {
    console.log('[DashboardLayout] Rendering: No user after init, redirecting to login');
    router.push('/');
    return null;
  }

  console.log('[DashboardLayout] Rendering: Layout with children');
  return <Layout>{children}</Layout>;
}
