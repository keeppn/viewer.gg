// Twitch API Service for tracking live streams and viewership
import { createClient } from '@/lib/supabase/server';

interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: 'live' | '';
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
}

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
}

export class TwitchService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor() {
    this.clientId = process.env.TWITCH_CLIENT_ID || '';
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
  }

  /**
   * Check if Twitch API is configured
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  /**
   * Ensure credentials are configured before making API calls
   */
  private ensureConfigured(): void {
    if (!this.isConfigured()) {
      throw new Error('Twitch API credentials not configured. Please set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET environment variables.');
    }
  }

  /**
   * Get OAuth App Access Token
   * This token is used for server-to-server API calls (not user-specific)
   */
  private async getAppAccessToken(): Promise<string> {
    this.ensureConfigured();

    // Return cached token if still valid (expires in 5+ minutes)
    if (this.accessToken && this.tokenExpiresAt && this.tokenExpiresAt - Date.now() > 5 * 60 * 1000) {
      return this.accessToken;
    }

    console.log('[Twitch] Requesting new app access token...');

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Twitch access token: ${error}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);

    console.log('[Twitch] Access token obtained, expires in', data.expires_in, 'seconds');

    return this.accessToken;
  }

  /**
   * Make authenticated request to Twitch API
   */
  private async twitchApiRequest(endpoint: string, params?: Record<string, string>): Promise<any> {
    const token = await this.getAppAccessToken();

    const url = new URL(`https://api.twitch.tv/helix${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twitch API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Extract Twitch username from channel URL
   * Supports formats:
   * - https://twitch.tv/username
   * - https://www.twitch.tv/username
   * - twitch.tv/username
   * - username
   */
  extractUsername(channelUrl: string): string | null {
    if (!channelUrl) return null;

    // Remove protocol and www
    let url = channelUrl.toLowerCase().trim();
    url = url.replace(/^https?:\/\//i, '');
    url = url.replace(/^www\./i, '');

    // Check if it's a Twitch URL
    if (url.startsWith('twitch.tv/')) {
      const username = url.replace('twitch.tv/', '').split('/')[0].split('?')[0];
      return username || null;
    }

    // If no domain, assume it's just the username
    if (!url.includes('.')) {
      return url.split('/')[0].split('?')[0] || null;
    }

    return null;
  }

  /**
   * Get user info by username
   */
  async getUserByUsername(username: string): Promise<TwitchUser | null> {
    try {
      const data = await this.twitchApiRequest('/users', { login: username });
      return data.data && data.data.length > 0 ? data.data[0] : null;
    } catch (error) {
      console.error(`[Twitch] Error fetching user ${username}:`, error);
      return null;
    }
  }

  /**
   * Check if a stream is currently live
   */
  async getStreamStatus(username: string): Promise<TwitchStream | null> {
    try {
      const data = await this.twitchApiRequest('/streams', { user_login: username });

      if (data.data && data.data.length > 0) {
        const stream = data.data[0];
        console.log(`[Twitch] ${username} is LIVE with ${stream.viewer_count} viewers`);
        return stream;
      }

      console.log(`[Twitch] ${username} is offline`);
      return null;
    } catch (error) {
      console.error(`[Twitch] Error checking stream status for ${username}:`, error);
      return null;
    }
  }

  /**
   * Get multiple streams at once (max 100 usernames)
   */
  async getMultipleStreamStatuses(usernames: string[]): Promise<TwitchStream[]> {
    if (usernames.length === 0) return [];

    try {
      // Twitch API allows up to 100 user_login params
      const uniqueUsernames = [...new Set(usernames)].slice(0, 100);

      const params: Record<string, string> = {};
      uniqueUsernames.forEach((username, index) => {
        params[`user_login`] = username; // Note: Will be sent as multiple params with same key
      });

      // Build URL with multiple user_login params
      const token = await this.getAppAccessToken();
      const url = new URL('https://api.twitch.tv/helix/streams');
      uniqueUsernames.forEach(username => {
        url.searchParams.append('user_login', username);
      });

      const response = await fetch(url.toString(), {
        headers: {
          'Client-ID': this.clientId,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Twitch API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[Twitch] Checked ${uniqueUsernames.length} streamers, ${data.data.length} are live`);

      return data.data || [];
    } catch (error) {
      console.error('[Twitch] Error checking multiple stream statuses:', error);
      return [];
    }
  }

  /**
   * Update live_streams table in database
   */
  async updateLiveStream(
    applicationId: string,
    tournamentId: string,
    streamData: TwitchStream | null,
    isLive: boolean
  ): Promise<void> {
    const supabase = await createClient();

    if (isLive && streamData) {
      // Check if record exists
      const { data: existing, error: fetchError } = await supabase
        .from('live_streams')
        .select('*')
        .eq('application_id', applicationId)
        .eq('tournament_id', tournamentId)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when no row exists

      if (fetchError) {
        console.error(`[DB] Error fetching live stream:`, fetchError);
        return;
      }

      const currentViewers = streamData.viewer_count;
      const peakViewers = existing
        ? Math.max(existing.peak_viewers || 0, currentViewers)
        : currentViewers;

      // Calculate running average viewers
      let avgViewers = currentViewers;
      if (existing && existing.average_viewers) {
        // Simple running average: (old_avg + new_value) / 2
        avgViewers = Math.round((existing.average_viewers + currentViewers) / 2);
      }

      const streamRecord = {
        application_id: applicationId,
        tournament_id: tournamentId,
        platform: 'Twitch' as const,
        streamer_name: streamData.user_name,
        game: streamData.game_name,
        title: streamData.title,
        stream_url: `https://twitch.tv/${streamData.user_login}`,
        language: streamData.language,
        is_live: true,
        current_viewers: currentViewers,
        peak_viewers: peakViewers,
        average_viewers: avgViewers,
        stream_start: streamData.started_at,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('live_streams')
          .update(streamRecord)
          .eq('id', existing.id);

        if (updateError) {
          console.error(`[DB] Error updating live stream:`, updateError);
        } else {
          console.log(`[DB] Updated live stream for application ${applicationId}`);
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('live_streams')
          .insert(streamRecord);

        if (insertError) {
          console.error(`[DB] Error inserting live stream:`, insertError);
        } else {
          console.log(`[DB] Created new live stream record for application ${applicationId}`);
        }
      }
    } else {
      // Stream is offline - update is_live to false
      const { data: existing, error: fetchError } = await supabase
        .from('live_streams')
        .select('*')
        .eq('application_id', applicationId)
        .eq('tournament_id', tournamentId)
        .eq('is_live', true)
        .maybeSingle();

      if (fetchError) {
        console.error(`[DB] Error fetching live stream for offline update:`, fetchError);
        return;
      }

      if (existing) {
        const { error: updateError } = await supabase
          .from('live_streams')
          .update({
            is_live: false,
            stream_end: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error(`[DB] Error marking stream as offline:`, updateError);
        } else {
          console.log(`[DB] Marked stream as offline for application ${applicationId}`);
        }
      }
    }
  }
}

// Export singleton instance
export const twitchService = new TwitchService();
