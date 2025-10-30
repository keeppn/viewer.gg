import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';

const App: React.FC = () => {
  const navigate = useNavigate();
  const { user, organization, loading, initialized, initialize } = useAuthStore();
  const { 
    fetchTournaments, 
    fetchApplications, 
    tournaments,
    applications,
    liveStreams,
    stats,
    analyticsData,
    updateApplicationStatus,
    addTournament,
    updateTournament,
    addApplication
  } = useAppStore();

  // Initialize auth
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (initialized && !user && !loading) {
      navigate('/');
    }
  }, [user, loading, initialized, navigate]);

  // Fetch data when user is authenticated
  useEffect(() => {
    if (user && organization) {
      fetchTournaments(organization.id);
      fetchApplications(organization.id);
    }
  }, [user, organization, fetchTournaments, fetchApplications]);

  const context = {
    user,
    organization,
    applications,
    tournaments,
    stats,
    analyticsData,
    liveStreams,
    updateApplicationStatus: async (id: string, status: 'Approved' | 'Rejected', notes?: string) => {
      if (user) {
        await updateApplicationStatus(id, status, user.id, notes);
      }
    },
    addTournament,
    updateTournament,
    addApplication,
    refetchData: async () => {
      if (organization) {
        await fetchTournaments(organization.id);
        await fetchApplications(organization.id);
      }
    }
  };

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

  return (
    <Layout>
      <Outlet context={context} />
    </Layout>
  );
};

export default App;
