"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import Layout from '@/components/layout/Layout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ToastProvider } from '@/components/common/Toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { initialize, user, organization, initialized, isInitializing } = useAuthStore();
  const { fetchTournaments, fetchApplications } = useAppStore();
  const [checking, setChecking] = useState(!initialized); // Start false if already initialized

  useEffect(() => {
    // If already initialized with a user, skip checking
    if (initialized && user) {
      setChecking(false);
      return;
    }

    // If already initializing, just wait
    if (isInitializing) {
      return;
    }

    let isMounted = true;

    const checkAndInitialize = async () => {
      try {
        await initialize();
        if (isMounted) {
          setChecking(false);
        }
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        if (isMounted) {
          setChecking(false);
        }
      }
    };

    checkAndInitialize();

    return () => {
      isMounted = false;
    };
  }, [initialized, isInitializing, user, initialize]);

  // Fetch data when user and organization are ready
  useEffect(() => {
    if (user && organization) {
      fetchTournaments(organization.id).catch(err => {
        console.error('Failed to fetch tournaments:', err);
      });
      fetchApplications(organization.id).catch(err => {
        console.error('Failed to fetch applications:', err);
      });
    }
  }, [user, organization, fetchTournaments, fetchApplications]);

  // Show loading only while checking AND not yet initialized
  if (checking && !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#121212] via-[#0D0D0D] to-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
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

  // After initialization, if no user found, redirect to login
  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Layout>{children}</Layout>
      </ToastProvider>
    </ErrorBoundary>
  );
}
