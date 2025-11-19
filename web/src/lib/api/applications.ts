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
    // First, get the application to access tournament and form data
    const application = await this.getById(id);
    if (!application) throw new Error('Application not found');

    // Update the database
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

    // If approved, assign Discord role
    if (status === 'Approved' && application.custom_data) {
      try {
        // Extract Discord User ID from custom_data
        const discordUserId = application.custom_data.discord_user_id || application.custom_data.discordUserId;

        if (!discordUserId) {
          console.log('[Applications] No Discord User ID found in application');
          return data;
        }

        console.log('[Applications] Assigning Discord role to approved streamer...', {
          discord_user_id: discordUserId,
          tournament_id: application.tournament_id,
          application_id: id,
          has_tournament: !!application.tournament,
          tournament_org_id: application.tournament?.organization_id
        });

        // Call the assign-role endpoint with tournament_id
        // The API will look up the Discord config server-side
        const response = await fetch('/api/discord/assign-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            discord_user_id: discordUserId,
            tournament_id: application.tournament_id,
            application_id: id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[Applications] Failed to assign Discord role:', {
            status: response.status,
            error: errorData
          });
          // Don't throw error - application is still approved even if role assignment fails
        } else {
          const successData = await response.json();
          console.log('[Applications] Discord role assigned successfully:', successData);
        }
      } catch (discordError) {
        console.error('[Applications] Error assigning Discord role:', discordError);
        // Don't throw error - application is still approved
      }
    }

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
