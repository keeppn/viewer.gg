// Discord Integration Service for managing OAuth tokens and role assignments
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export class DiscordIntegrationService {
  private supabase: any;
  
  constructor() {
    this.supabase = createServerComponentClient({ cookies });
  }

  /**
   * Refresh Discord access token if expired
   */
  async refreshTokenIfNeeded(integration: any) {
    const expiresAt = new Date(integration.expires_at);
    const now = new Date();
    
    // Refresh if token expires in less than 5 minutes
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      const response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,          client_secret: process.env.DISCORD_CLIENT_SECRET!,
          grant_type: 'refresh_token',
          refresh_token: integration.refresh_token,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update tokens in database
        await this.supabase
          .from('discord_integrations')
          .update({
            access_token: data.access_token,
            refresh_token: data.refresh_token || integration.refresh_token,
            expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', integration.id);
          
        return data.access_token;
      }
    }
    
    return integration.access_token;
  }

  /**   * Assign role to user when tournament application is approved
   */
  async assignTournamentRole(
    guildId: string,
    userId: string,
    roleId: string,
    organizerId: string
  ) {
    // Get Discord integration for organizer
    const { data: integration } = await this.supabase
      .from('discord_integrations')
      .select('*')
      .eq('organizer_id', organizerId)
      .single();

    if (!integration) {
      throw new Error('Discord integration not found');
    }

    // Refresh token if needed
    const accessToken = await this.refreshTokenIfNeeded(integration);

    // Use Discord bot token for role assignment
    const response = await fetch(
      `https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to assign role: ${error}`);
    }

    // Log the action
    await this.logRoleAssignment(guildId, userId, roleId, organizerId, 'assigned');
    
    return true;
  }

  /**
   * Remove role from user when tournament ends or access is revoked
   */
  async removeTournamentRole(
    guildId: string,
    userId: string,
    roleId: string,
    organizerId: string
  ) {
    const response = await fetch(
      `https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {
        method: 'DELETE',
        headers: {          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to remove role: ${error}`);
    }

    // Log the action
    await this.logRoleAssignment(guildId, userId, roleId, organizerId, 'removed');
    
    return true;
  }

  /**
   * Log role assignment history
   */
  async logRoleAssignment(
    guildId: string,
    userId: string,
    roleId: string,
    organizerId: string,
    action: 'assigned' | 'removed'
  ) {
    await this.supabase.from('discord_role_history').insert({
      guild_id: guildId,
      user_id: userId,
      role_id: roleId,
      organizer_id: organizerId,
      action: action,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get role assignment history for an organizer
   */
  async getRoleHistory(organizerId: string, limit = 50) {
    const { data, error } = await this.supabase
      .from('discord_role_history')
      .select('*')
      .eq('organizer_id', organizerId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data;
  }
}

export default DiscordIntegrationService;