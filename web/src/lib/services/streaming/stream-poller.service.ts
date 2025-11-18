// Stream Polling Service - Checks all approved streamers and updates live status
import { createClient } from '@/lib/supabase/server';
import { twitchService } from './twitch.service';

export class StreamPollerService {
  /**
   * Main polling function - checks all approved streamers for active tournaments
   */
  async pollAllStreams(): Promise<{
    success: boolean;
    checked: number;
    live: number;
    errors: number;
    message: string;
  }> {
    console.log('[StreamPoller] Starting poll cycle...');
    const startTime = Date.now();

    try {
      const supabase = await createClient();

      // 1. Get all active tournaments
      const { data: tournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('id, title, status')
        .eq('status', 'active');

      if (tournamentsError) {
        throw new Error(`Failed to fetch tournaments: ${tournamentsError.message}`);
      }

      if (!tournaments || tournaments.length === 0) {
        console.log('[StreamPoller] No active tournaments found');
        return {
          success: true,
          checked: 0,
          live: 0,
          errors: 0,
          message: 'No active tournaments',
        };
      }

      console.log(`[StreamPoller] Found ${tournaments.length} active tournament(s)`);

      let totalChecked = 0;
      let totalLive = 0;
      let totalErrors = 0;

      // 2. For each tournament, get all approved applications
      for (const tournament of tournaments) {
        const { data: applications, error: appsError } = await supabase
          .from('applications')
          .select('id, streamer, tournament_id')
          .eq('tournament_id', tournament.id)
          .eq('status', 'Approved');

        if (appsError) {
          console.error(`[StreamPoller] Error fetching applications for ${tournament.title}:`, appsError);
          totalErrors++;
          continue;
        }

        if (!applications || applications.length === 0) {
          console.log(`[StreamPoller] No approved applications for ${tournament.title}`);
          continue;
        }

        console.log(`[StreamPoller] Checking ${applications.length} approved streamers for "${tournament.title}"`);

        // 3. Extract Twitch usernames from applications
        const twitchStreamers = applications
          .filter(app => {
            const streamer = app.streamer as any;
            const platform = streamer?.platform?.toLowerCase();
            return platform === 'twitch' && streamer?.channel_url;
          })
          .map(app => {
            const streamer = app.streamer as any;
            return {
              applicationId: app.id,
              tournamentId: app.tournament_id,
              channelUrl: streamer.channel_url,
              username: twitchService.extractUsername(streamer.channel_url),
            };
          })
          .filter(s => s.username !== null);

        if (twitchStreamers.length === 0) {
          console.log(`[StreamPoller] No Twitch streamers found for ${tournament.title}`);
          continue;
        }

        console.log(`[StreamPoller] Found ${twitchStreamers.length} Twitch streamers to check`);

        // 4. Check stream statuses in batch (Twitch allows up to 100 at once)
        const usernames = twitchStreamers.map(s => s.username!);
        const liveStreams = await twitchService.getMultipleStreamStatuses(usernames);

        // Create a map of username -> stream data
        const liveStreamMap = new Map<string, any>();
        liveStreams.forEach(stream => {
          liveStreamMap.set(stream.user_login.toLowerCase(), stream);
        });

        // 5. Update database for each streamer
        for (const streamer of twitchStreamers) {
          totalChecked++;

          try {
            const streamData = liveStreamMap.get(streamer.username!.toLowerCase());
            const isLive = !!streamData;

            if (isLive) {
              totalLive++;
            }

            await twitchService.updateLiveStream(
              streamer.applicationId,
              streamer.tournamentId,
              streamData,
              isLive
            );
          } catch (error) {
            console.error(`[StreamPoller] Error updating stream for ${streamer.username}:`, error);
            totalErrors++;
          }
        }
      }

      const duration = Date.now() - startTime;
      const message = `Polled ${totalChecked} streamers in ${duration}ms: ${totalLive} live, ${totalErrors} errors`;
      console.log(`[StreamPoller] ${message}`);

      return {
        success: true,
        checked: totalChecked,
        live: totalLive,
        errors: totalErrors,
        message,
      };
    } catch (error) {
      console.error('[StreamPoller] Fatal error during poll cycle:', error);
      return {
        success: false,
        checked: 0,
        live: 0,
        errors: 1,
        message: `Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Collect viewership snapshot for analytics
   * Aggregates current viewers across all live streams per tournament
   */
  async collectViewershipSnapshot(): Promise<void> {
    console.log('[StreamPoller] Collecting viewership snapshots...');

    try {
      const supabase = await createClient();

      // Get all active tournaments
      const { data: tournaments } = await supabase
        .from('tournaments')
        .select('id')
        .eq('status', 'active');

      if (!tournaments || tournaments.length === 0) {
        console.log('[StreamPoller] No active tournaments for snapshot');
        return;
      }

      // For each tournament, aggregate live stream data
      for (const tournament of tournaments) {
        const { data: liveStreams } = await supabase
          .from('live_streams')
          .select('current_viewers')
          .eq('tournament_id', tournament.id)
          .eq('is_live', true);

        if (!liveStreams || liveStreams.length === 0) {
          console.log(`[StreamPoller] No live streams for tournament ${tournament.id}`);
          continue;
        }

        const totalViewers = liveStreams.reduce((sum, stream) => sum + (stream.current_viewers || 0), 0);
        const streamerCount = liveStreams.length;

        // Insert snapshot
        await supabase.from('viewership_snapshots').insert({
          tournament_id: tournament.id,
          viewer_count: totalViewers,
          streamer_count: streamerCount,
          timestamp: new Date().toISOString(),
        });

        console.log(`[StreamPoller] Snapshot: Tournament ${tournament.id} - ${totalViewers} viewers across ${streamerCount} streamers`);
      }
    } catch (error) {
      console.error('[StreamPoller] Error collecting snapshots:', error);
    }
  }
}

// Export singleton instance
export const streamPollerService = new StreamPollerService();
