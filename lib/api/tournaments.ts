import { supabase } from '../supabase';
import { Tournament, Application, ApplicationStatus, FormField } from '../../types';

export const tournamentApi = {
  // Get all tournaments for an organization
  async getAll(organizationId: string): Promise<Tournament[]> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get single tournament by ID
  async getById(id: string): Promise<Tournament | null> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new tournament
  async create(tournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at' | 'application_count'>): Promise<Tournament> {
    const { data, error } = await supabase
      .from('tournaments')
      .insert(tournament)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update tournament
  async update(id: string, updates: Partial<Tournament>): Promise<Tournament> {
    const { data, error } = await supabase
      .from('tournaments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete tournament
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Update form fields
  async updateFormFields(id: string, formFields: FormField[], customFields: FormField[]): Promise<Tournament> {
    const { data, error } = await supabase
      .from('tournaments')
      .update({ 
        form_fields: formFields,
        custom_fields: customFields 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get tournament applications count
  async getApplicationsCount(id: string): Promise<number> {
    const { count, error } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', id);

    if (error) throw error;
    return count || 0;
  },

  // Update tournament status
  async updateStatus(id: string, status: Tournament['status']): Promise<Tournament> {
    const { data, error } = await supabase
      .from('tournaments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
