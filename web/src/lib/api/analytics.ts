import { supabase } from '../supabase';
import { LiveStream, ViewershipSnapshot, AnalyticsData } from '../../types';

export const analyticsApi = {
  // Get live streams for a tournament
  async getLiveStreams(tournamentId: string): Promise<LiveStream[]> {
    const { data, error } = await supabase
      .from('live_streams')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('is_live', true)
      .order('current_viewers', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create or update live stream
  async upsertLiveStream(stream: Partial<LiveStream>): Promise<LiveStream> {
    const { data, error } = await supabase
      .from('live_streams')
      .upsert(stream)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // End live stream
  async endLiveStream(id: string): Promise<void> {
    const { error } = await supabase
      .from('live_streams')
      .update({ 
        is_live: false,
        stream_end: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Record viewership snapshot
  async recordSnapshot(snapshot: Omit<ViewershipSnapshot, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('viewership_snapshots')
      .insert(snapshot);

    if (error) throw error;
  },

  // Get analytics data for a tournament
  async getAnalytics(tournamentId: string, startDate?: string, endDate?: string): Promise<AnalyticsData> {
    const dateFilter = startDate && endDate 
      ? { gte: startDate, lte: endDate }
      : {};

    // Get applications stats
    const { data: applications } = await supabase
      .from('applications')
      .select('status')
      .eq('tournament_id', tournamentId);

    // Get live streams
    const { data: liveStreams } = await supabase
      .from('live_streams')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('is_live', true);

    // Get viewership snapshots
    const { data: snapshots } = await supabase
      .from('viewership_snapshots')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('timestamp', { ascending: true });

    // Calculate stats
    const totalApplications = applications?.length || 0;
    const approved = applications?.filter(a => a.status === 'Approved').length || 0;
    const rejected = applications?.filter(a => a.status === 'Rejected').length || 0;
    const pending = applications?.filter(a => a.status === 'Pending').length || 0;

    const currentViewers = liveStreams?.reduce((sum, s) => sum + s.current_viewers, 0) || 0;
    const peakViewers = Math.max(...(snapshots?.map(s => s.viewer_count) || [0]));
    const avgViewers = snapshots?.length 
      ? snapshots.reduce((sum, s) => sum + s.viewer_count, 0) / snapshots.length 
      : 0;

    // Group snapshots by hour for chart
    const viewershipByHour = snapshots?.reduce((acc: any[], snapshot) => {
      const hour = new Date(snapshot.timestamp).getHours();
      const existing = acc.find(item => item.hour === hour);
      
      if (existing) {
        existing.viewers = Math.max(existing.viewers, snapshot.viewer_count);
        existing.streamers = Math.max(existing.streamers, snapshot.streamer_count);
      } else {
        acc.push({
          hour: `${hour}:00`,
          viewers: snapshot.viewer_count,
          streamers: snapshot.streamer_count
        });
      }
      
      return acc;
    }, []) || [];

    // Platform breakdown
    const viewershipByPlatform = liveStreams?.reduce((acc: any, stream) => {
      acc[stream.platform] = (acc[stream.platform] || 0) + stream.current_viewers;
      return acc;
    }, {}) || {};

    // Language breakdown
    const viewershipByLanguage = liveStreams?.reduce((acc: any, stream) => {
      acc[stream.language] = (acc[stream.language] || 0) + stream.current_viewers;
      return acc;
    }, {}) || {};

    // Top streamers
    const topStreamers = liveStreams
      ?.sort((a, b) => b.peak_viewers - a.peak_viewers)
      .slice(0, 10)
      .map(s => ({
        name: s.streamer_name,
        peak_viewers: s.peak_viewers,
        avg_viewers: s.average_viewers,
        hours_streamed: s.stream_end 
          ? (new Date(s.stream_end).getTime() - new Date(s.stream_start).getTime()) / 3600000
          : (Date.now() - new Date(s.stream_start).getTime()) / 3600000
      })) || [];

    return {
      tournament_id: tournamentId,
      date_range: {
        start: startDate || '',
        end: endDate || ''
      },
      total_applications: totalApplications,
      approved_applications: approved,
      rejected_applications: rejected,
      pending_applications: pending,
      live_streamers_count: liveStreams?.length || 0,
      total_live_viewers: currentViewers,
      peak_concurrent_viewers: peakViewers,
      average_concurrent_viewers: Math.round(avgViewers),
      total_hours_streamed: liveStreams?.reduce((sum, s) => {
        const hours = s.stream_end 
          ? (new Date(s.stream_end).getTime() - new Date(s.stream_start).getTime()) / 3600000
          : (Date.now() - new Date(s.stream_start).getTime()) / 3600000;
        return sum + hours;
      }, 0) || 0,
      unique_viewers_estimate: Math.round(peakViewers * 1.5), // Rough estimate
      viewership_by_hour: viewershipByHour,
      viewership_by_platform: viewershipByPlatform,
      viewership_by_language: viewershipByLanguage,
      top_streamers: topStreamers
    };
  }
};
