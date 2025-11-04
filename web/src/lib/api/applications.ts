import { supabase } from '../supabase';
import { Application, ApplicationStatus } from '../../types';

export const applicationApi = {
  // Get all applications for a tournament
  async getByTournament(tournamentId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        tournament:tournaments(*)
      `)
      .eq('tournament_id', tournamentId)
      .order('submission_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get all applications for an organization
  async getByOrganization(organizationId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        tournament:tournaments!inner(*)
      `)
      .eq('tournament.organization_id', organizationId)
      .order('submission_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get single application
  async getById(id: string): Promise<Application | null> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        tournament:tournaments(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new application
  async create(application: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<Application> {
    const { data, error } = await supabase
      .from('applications')
      .insert({
        ...application,
        status: 'Pending',
        submission_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Increment application count on tournament
    await supabase.rpc('increment_tournament_applications', {
      tournament_id: application.tournament_id
    });

    return data;
  },

  // Update application status
  async updateStatus(
    id: string, 
    status: ApplicationStatus, 
    reviewedBy: string,
    notes?: string
  ): Promise<Application> {
    const { data, error } = await supabase
      .from('applications')
      .update({ 
        status,
        reviewed_by: reviewedBy,
        reviewed_date: new Date().toISOString(),
        notes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Bulk update status
  async bulkUpdateStatus(
    ids: string[], 
    status: ApplicationStatus,
    reviewedBy: string
  ): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .update({ 
        status,
        reviewed_by: reviewedBy,
        reviewed_date: new Date().toISOString()
      })
      .in('id', ids);

    if (error) throw error;
  },

  // Delete application
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get applications statistics
  async getStats(tournamentId?: string, organizationId?: string) {
    // Helper function to build query
    const buildQuery = () => {
      if (tournamentId) {
        // Filter by specific tournament
        return supabase
          .from('applications')
          .select('status', { count: 'exact' })
          .eq('tournament_id', tournamentId);
      } else if (organizationId) {
        // Filter by organization if no specific tournament
        // Use inner join to ensure we only get applications for this org's tournaments
        return supabase
          .from('applications')
          .select('status, tournament:tournaments!inner(organization_id)', { count: 'exact' })
          .eq('tournament.organization_id', organizationId);
      } else {
        // No filter - return all (should not happen in production)
        return supabase
          .from('applications')
          .select('status', { count: 'exact' });
      }
    };

    const [
      { count: total },
      { count: approved },
      { count: rejected },
      { count: pending }
    ] = await Promise.all([
      buildQuery(),
      buildQuery().eq('status', 'Approved'),
      buildQuery().eq('status', 'Rejected'),
      buildQuery().eq('status', 'Pending')
    ]);

    return {
      totalApplications: total || 0,
      approved: approved || 0,
      rejected: rejected || 0,
      pending: pending || 0
    };
  }
};
