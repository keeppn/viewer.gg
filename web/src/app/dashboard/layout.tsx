"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import Layout from '@/components/layout/Layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, organization, loading, initialized, initialize } = useAuthStore();
  const { fetchTournaments, fetchApplications } = useAppStore();

  // Initialize auth
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (initialized && !user && !loading) {
      router.push('/');
    }
  }, [user, loading, initialized, router]);

  // Fetch data when user is authenticated
  useEffect(() => {
    if (user && organization) {
      fetchTournaments(organization.id);
      fetchApplications(organization.id);
    }
  }, [user, organization, fetchTournaments, fetchApplications]);

  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return <Layout>{children}</Layout>;
}
