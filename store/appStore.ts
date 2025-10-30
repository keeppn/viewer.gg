import { create } from 'zustand';
import { Tournament, Application, LiveStream, Stats, AnalyticsData } from '../types';
import { tournamentApi } from '../lib/api/tournaments';
import { applicationApi } from '../lib/api/applications';
import { analyticsApi } from '../lib/api/analytics';

interface AppState {
  tournaments: Tournament[];
  applications: Application[];
  liveStreams: LiveStream[];
  stats: Stats;
  analyticsData: AnalyticsData | null;
  loading: boolean;
  
  // Actions
  fetchTournaments: (organizationId: string) => Promise<void>;
  fetchApplications: (organizationId: string) => Promise<void>;
  fetchLiveStreams: (tournamentId: string) => Promise<void>;
  fetchAnalytics: (tournamentId: string) => Promise<void>;
  updateApplicationStatus: (id: string, status: Application['status'], userId: string, notes?: string) => Promise<void>;
  addTournament: (tournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at' | 'application_count'>) => Promise<void>;
  updateTournament: (tournament: Tournament) => Promise<void>;
  addApplication: (application: Omit<Application, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  refreshStats: (organizationId?: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  tournaments: [],
  applications: [],
  liveStreams: [],
  stats: {
    totalApplications: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  },
  analyticsData: null,
  loading: false,

  fetchTournaments: async (organizationId: string) => {
    try {
      set({ loading: true });
      const tournaments = await tournamentApi.getAll(organizationId);
      set({ tournaments, loading: false });
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      set({ loading: false });
    }
  },

  fetchApplications: async (organizationId: string) => {
    try {
      set({ loading: true });
      const applications = await applicationApi.getByOrganization(organizationId);
      set({ applications, loading: false });
      await get().refreshStats();
    } catch (error) {
      console.error('Error fetching applications:', error);
      set({ loading: false });
    }
  },

  fetchLiveStreams: async (tournamentId: string) => {
    try {
      const liveStreams = await analyticsApi.getLiveStreams(tournamentId);
      set({ liveStreams });
    } catch (error) {
      console.error('Error fetching live streams:', error);
    }
  },

  fetchAnalytics: async (tournamentId: string) => {
    try {
      const analyticsData = await analyticsApi.getAnalytics(tournamentId);
      set({ analyticsData });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  },

  updateApplicationStatus: async (id: string, status: Application['status'], userId: string, notes?: string) => {
    try {
      await applicationApi.updateStatus(id, status, userId, notes);
      const { applications } = get();
      set({
        applications: applications.map(app =>
          app.id === id ? { ...app, status, reviewed_by: userId, reviewed_date: new Date().toISOString(), notes } : app
        )
      });
      await get().refreshStats();
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  addTournament: async (tournament) => {
    try {
      const newTournament = await tournamentApi.create(tournament);
      set(state => ({
        tournaments: [newTournament, ...state.tournaments]
      }));
    } catch (error) {
      console.error('Error adding tournament:', error);
      throw error;
    }
  },

  updateTournament: async (tournament) => {
    try {
      await tournamentApi.update(tournament.id, tournament);
      set(state => ({
        tournaments: state.tournaments.map(t => t.id === tournament.id ? tournament : t)
      }));
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw error;
    }
  },

  addApplication: async (application) => {
    try {
      const newApplication = await applicationApi.create(application);
      set(state => ({
        applications: [newApplication, ...state.applications]
      }));
      await get().refreshStats();
    } catch (error) {
      console.error('Error adding application:', error);
      throw error;
    }
  },

  refreshStats: async (organizationId?: string) => {
    try {
      const stats = await applicationApi.getStats(organizationId);
      set({ stats });
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  }
}));
