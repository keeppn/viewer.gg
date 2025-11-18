import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  currentOrganizationId: string | null; // Track current organization for stats
  lastFetchTime: number | null; // Track when data was last fetched for cache invalidation

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

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  tournaments: [],
  applications: [],
  liveStreams: [],
  currentOrganizationId: null,
  lastFetchTime: null,
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
      // Check cache - only fetch if cache is stale or organization changed
      const { lastFetchTime, currentOrganizationId } = get();
      const now = Date.now();
      const isCacheValid = lastFetchTime && (now - lastFetchTime) < CACHE_TTL && currentOrganizationId === organizationId;

      if (isCacheValid) {
        console.log('[AppStore] Using cached tournaments data');
        return;
      }

      set({ loading: true });
      const tournaments = await tournamentApi.getAll(organizationId);
      set({ tournaments, loading: false, lastFetchTime: now, currentOrganizationId: organizationId });
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      set({ loading: false });
    }
  },

  fetchApplications: async (organizationId: string) => {
    try {
      // Check cache - only fetch if cache is stale or organization changed
      const { lastFetchTime, currentOrganizationId } = get();
      const now = Date.now();
      const isCacheValid = lastFetchTime && (now - lastFetchTime) < CACHE_TTL && currentOrganizationId === organizationId;

      if (isCacheValid) {
        console.log('[AppStore] Using cached applications data');
        return;
      }

      set({ loading: true, currentOrganizationId: organizationId });
      const applications = await applicationApi.getByOrganization(organizationId);
      set({ applications, loading: false, lastFetchTime: now });
      // Pass organizationId to refreshStats for proper filtering
      await get().refreshStats(organizationId);
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
      // Use provided organizationId or fall back to currentOrganizationId
      const orgId = organizationId || get().currentOrganizationId;
      // Pass undefined for tournamentId (first param), organizationId as second param
      const stats = await applicationApi.getStats(undefined, orgId || undefined);
      set({ stats });
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  }
}),
    {
      name: 'app-store',
      // Persist data for caching, but exclude loading state
      partialize: (state) => ({
        tournaments: state.tournaments,
        applications: state.applications,
        stats: state.stats,
        currentOrganizationId: state.currentOrganizationId,
        lastFetchTime: state.lastFetchTime,
      }),
    }
  )
);
