import React from 'react';
import { Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { useMockData, Tournament } from './hooks/useMockData';

const App: React.FC = () => {
  const { 
    applications, 
    setApplications, 
    tournaments,
    setTournaments, 
    stats,
    analyticsData,
    liveStreams,
  } = useMockData();

  const updateApplicationStatus = (id: number, status: 'Approved' | 'Rejected') => {
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, status } : app))
    );
  };

  const addTournament = (tournament: Omit<Tournament, 'id' | 'applications' | 'formFields'>) => {
    setTournaments(prev => [
      ...prev,
      {
        id: prev.length > 0 ? Math.max(...prev.map(t => t.id)) + 1 : 1,
        ...tournament,
        applications: 0,
        formFields: [],
      }
    ]);
  };
  
  const updateTournament = (updatedTournament: Tournament) => {
    setTournaments(prev => prev.map(t => t.id === updatedTournament.id ? updatedTournament : t));
  };

  const context = {
    applications,
    tournaments,
    stats,
    analyticsData,
    liveStreams,
    updateApplicationStatus,
    addTournament,
    updateTournament,
  };

  return (
    <Layout>
      <Outlet context={context} />
    </Layout>
  );
};

export default App;