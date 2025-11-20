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
  error: string | null; // Track error messages for UI display
  currentOrganizationId: string | null; // Track current organization for stats

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
  clearError: () => void; // Clear error state
}

// Track in-flight requests to prevent duplicates
const inFlightRequests = new Map<string, Promise<any>>();

export const useAppStore = create<AppState>((set, get) => ({
  tournaments: [],
  applications: [],
  liveStreams: [],
  currentOrganizationId: null,
  stats: {
    totalApplications: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  },
  analyticsData: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchTournaments: async (organizationId: string) => {
    const requestKey = `fetchTournaments-${organizationId}`;

    // Return existing in-flight request if one exists (deduplication)
    if (inFlightRequests.has(requestKey)) {
      return inFlightRequests.get(requestKey);
    }

    const request = (async () => {
      try {
        set({ loading: true, error: null });
        const tournaments = await tournamentApi.getAll(organizationId);
        set({ tournaments, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load tournaments';
        console.error('Error fetching tournaments:', error);
        set({ loading: false, error: errorMessage });
      } finally {
        inFlightRequests.delete(requestKey);
      }
    })();

    inFlightRequests.set(requestKey, request);
    return request;
  },

  fetchApplications: async (organizationId: string) => {
    const requestKey = `fetchApplications-${organizationId}`;

    // Return existing in-flight request if one exists (deduplication)
    if (inFlightRequests.has(requestKey)) {
      return inFlightRequests.get(requestKey);
    }

    const request = (async () => {
      try {
        set({ loading: true, error: null, currentOrganizationId: organizationId });
        const applications = await applicationApi.getByOrganization(organizationId);
        set({ applications, loading: false });
        // Pass organizationId to refreshStats for proper filtering
        await get().refreshStats(organizationId);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load applications';
        console.error('Error fetching applications:', error);
        set({ loading: false, error: errorMessage });
      } finally {
        inFlightRequests.delete(requestKey);
      }
    })();

    inFlightRequests.set(requestKey, request);
    return request;
  },

  fetchLiveStreams: async (tournamentId: string) => {
    try {
      set({ error: null });
      const liveStreams = await analyticsApi.getLiveStreams(tournamentId);
      set({ liveStreams });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load live streams';
      console.error('Error fetching live streams:', error);
      set({ error: errorMessage });
    }
  },

  fetchAnalytics: async (tournamentId: string) => {
    try {
      set({ error: null });
      const analyticsData = await analyticsApi.getAnalytics(tournamentId);
      set({ analyticsData });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load analytics';
      console.error('Error fetching analytics:', error);
      set({ error: errorMessage });
    }
  },

  updateApplicationStatus: async (id: string, status: Application['status'], userId: string, notes?: string) => {
    // Store original state for rollback
    const { applications } = get();
    const originalApp = applications.find(app => app.id === id);

    if (!originalApp) {
      const error = 'Application not found';
      set({ error });
      throw new Error(error);
    }

    try {
      set({ error: null });

      // Optimistically update UI
      const updatedApplications = applications.map(app =>
        app.id === id ? { ...app, status, reviewed_by: userId, reviewed_date: new Date().toISOString(), notes } : app
      );
      set({ applications: updatedApplications });

      // Make API call
      await applicationApi.updateStatus(id, status, userId, notes);

      // Refresh stats after successful update
      await get().refreshStats();
    } catch (error) {
      // Rollback to original state on failure
      const errorMessage = error instanceof Error ? error.message : 'Failed to update application status';
      console.error('Error updating application status:', error);

      // Restore original application in the list
      set({
        applications: applications.map(app => app.id === id ? originalApp : app),
        error: errorMessage
      });

      throw error;
    }
  },

  addTournament: async (tournament) => {
    try {
      set({ error: null });
      const newTournament = await tournamentApi.create(tournament);
      set(state => ({
        tournaments: [newTournament, ...state.tournaments]
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create tournament';
      console.error('Error adding tournament:', error);
      set({ error: errorMessage });
      throw error;
    }
  },

  updateTournament: async (tournament) => {
    try {
      set({ error: null });
      await tournamentApi.update(tournament.id, tournament);
      set(state => ({
        tournaments: state.tournaments.map(t => t.id === tournament.id ? tournament : t)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update tournament';
      console.error('Error updating tournament:', error);
      set({ error: errorMessage });
      throw error;
    }
  },

  addApplication: async (application) => {
    try {
      set({ error: null });
      const newApplication = await applicationApi.create(application);
      set(state => ({
        applications: [newApplication, ...state.applications]
      }));
      await get().refreshStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create application';
      console.error('Error adding application:', error);
      set({ error: errorMessage });
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh stats';
      console.error('Error refreshing stats:', error);
      set({ error: errorMessage });
    }
  }
}));
