"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { UsersIcon, TrendingUpIcon, UserCheckIcon, LiveIcon } from '@/components/icons/Icons';
import EnhancedStatCard from '@/components/analytics/EnhancedStatCard';
import ViewershipTimeline from '@/components/analytics/ViewershipTimeline';
import StreamerLeaderboard from '@/components/analytics/StreamerLeaderboard';
import PlatformComparison from '@/components/analytics/PlatformComparison';
import ApplicationFunnel from '@/components/analytics/ApplicationFunnel';
import TournamentSelector from '@/components/analytics/TournamentSelector';
import TimeHeatmap from '@/components/analytics/TimeHeatmap';
import LanguageBreakdown from '@/components/analytics/LanguageBreakdown';
import StreamHealthMonitor from '@/components/analytics/StreamHealthMonitor';
import EngagementMetrics from '@/components/analytics/EngagementMetrics';
import ExportMenu from '@/components/analytics/ExportMenu';

const Analytics: React.FC = () => {
  const { analyticsData, applications, liveStreams, tournaments, fetchAnalytics, fetchLiveStreams } = useAppStore();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);

  // Select first tournament by default
  useEffect(() => {
    if (tournaments.length > 0 && !selectedTournamentId) {
      setSelectedTournamentId(tournaments[0].id);
    }
  }, [tournaments, selectedTournamentId]);

  // Fetch analytics when tournament is selected
  useEffect(() => {
    if (selectedTournamentId) {
      fetchAnalytics(selectedTournamentId);
      fetchLiveStreams(selectedTournamentId);
    }
  }, [selectedTournamentId, fetchAnalytics, fetchLiveStreams]);

  // Calculate platform distribution
  const platformData = useMemo(() => {
    const platformMap: { [key: string]: { viewers: number; streamCount: number } } = {};

    liveStreams.forEach(stream => {
      if (!platformMap[stream.platform]) {
        platformMap[stream.platform] = { viewers: 0, streamCount: 0 };
      }
      platformMap[stream.platform].viewers += stream.current_viewers;
      platformMap[stream.platform].streamCount += 1;
    });

    return Object.entries(platformMap).map(([platform, data]) => ({
      platform,
      viewers: data.viewers,
      streamCount: data.streamCount
    }));
  }, [liveStreams]);

  // Calculate language distribution
  const languageData = useMemo(() => {
    const languageMap: { [key: string]: { viewers: number; streamers: number } } = {};

    liveStreams.forEach(stream => {
      const lang = stream.language || 'Unknown';
      if (!languageMap[lang]) {
        languageMap[lang] = { viewers: 0, streamers: 0 };
      }
      languageMap[lang].viewers += stream.current_viewers;
      languageMap[lang].streamers += 1;
    });

    return Object.entries(languageMap).map(([language, data]) => ({
      language,
      viewers: data.viewers,
      streamers: data.streamers
    }));
  }, [liveStreams]);

  // Generate mock time heatmap data (in production, this would come from viewership_snapshots)
  const timeHeatmapData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data: Array<{ hour: number; day: string; viewers: number }> = [];

    days.forEach(day => {
      for (let hour = 0; hour < 24; hour++) {
        // Generate realistic patterns (higher on weekends, peak 18-22)
        const isWeekend = day === 'Sat' || day === 'Sun';
        const isPeakTime = hour >= 18 && hour <= 22;
        const baseViewers = Math.random() * 1000;
        const weekendBoost = isWeekend ? 1.5 : 1;
        const peakBoost = isPeakTime ? 2 : 1;
        const viewers = Math.round(baseViewers * weekendBoost * peakBoost);

        data.push({ hour, day, viewers });
      }
    });

    return data;
  }, []);

  // Calculate metrics
  const currentViewers = liveStreams.reduce((sum, stream) => sum + stream.current_viewers, 0);
  const peakViewers = analyticsData?.peak_concurrent_viewers || 0;
  const avgViewers = analyticsData?.average_concurrent_viewers || 0;
  const liveStreamersCount = liveStreams.length;
  const approvedApplications = applications.filter(app => app.status === 'Approved').length;
  const totalApplications = applications.length;
  const totalHoursStreamed = analyticsData?.total_hours_streamed || 0;

  // Calculate total hours watched (estimate)
  const totalHoursWatched = analyticsData?.total_hours_streamed
    ? Math.round(analyticsData.total_hours_streamed * avgViewers)
    : 0;

  // Generate sparkline data (mock trend for now)
  const generateSparkline = (baseValue: number) => {
    return Array.from({ length: 12 }, (_, i) => {
      const variance = Math.random() * 0.3 - 0.15;
      return Math.max(0, Math.round(baseValue * (1 + variance)));
    });
  };

  // Calculate trends (mock data - would come from comparing with previous period)
  const viewerTrend = { value: 12, label: 'vs last week' };
  const applicationTrend = { value: 8, label: 'vs last event' };
  const approvalTrend = { value: 5, label: 'vs average' };

  // Get selected tournament
  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);

  // Handle export
  const handleExport = async (format: 'pdf' | 'csv' | 'json') => {
    console.log(`Exporting as ${format}...`);
    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (format === 'csv') {
      // Generate CSV data
      const csvData = [
        ['Metric', 'Value'],
        ['Tournament', selectedTournament?.title || 'N/A'],
        ['Total Applications', totalApplications],
        ['Approved Applications', approvedApplications],
        ['Live Streamers', liveStreamersCount],
        ['Peak Viewers', peakViewers],
        ['Average Viewers', avgViewers],
        ['Total Hours Streamed', totalHoursStreamed],
      ].map(row => row.join(',')).join('\n');

      // Download CSV
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedTournament?.title || 'report'}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'json') {
      // Generate JSON data
      const jsonData = {
        tournament: selectedTournament?.title,
        exportDate: new Date().toISOString(),
        metrics: {
          totalApplications,
          approvedApplications,
          liveStreamers: liveStreamersCount,
          peakViewers,
          averageViewers: avgViewers,
          totalHoursStreamed,
        },
        streams: liveStreams.map(s => ({
          name: s.streamer_name,
          platform: s.platform,
          viewers: s.current_viewers,
          peakViewers: s.peak_viewers
        }))
      };

      // Download JSON
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedTournament?.title || 'report'}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // PDF export would require a library like jsPDF or server-side generation
      alert('PDF export coming soon! For now, please use CSV or JSON export.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Tournament Selector and Export */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h2>
          <p className="text-white/60">Comprehensive tournament performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-4">
          {selectedTournamentId && (
            <ExportMenu
              tournamentName={selectedTournament?.title || 'Tournament'}
              onExport={handleExport}
            />
          )}
          <div className="w-80">
            <TournamentSelector
              tournaments={tournaments}
              selectedTournamentId={selectedTournamentId}
              onSelect={setSelectedTournamentId}
            />
          </div>
        </div>
      </div>

      {!selectedTournamentId ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#9381FF]/20 to-[#DAFF7C]/20 flex items-center justify-center">
              <span className="text-5xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Tournament Selected</h3>
            <p className="text-white/60">Select a tournament above to view analytics</p>
          </div>
        </div>
      ) : (
        <>
          {/* Enhanced KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <EnhancedStatCard
              title="Total Hours Watched"
              value={totalHoursWatched >= 1000 ? `${(totalHoursWatched / 1000).toFixed(1)}K` : totalHoursWatched}
              suffix={totalHoursWatched < 1000 ? 'hrs' : 'hrs'}
              icon={<UsersIcon />}
              color="lime"
              trend={viewerTrend}
              sparklineData={generateSparkline(totalHoursWatched)}
            />

            <EnhancedStatCard
              title="Peak Concurrent Viewers"
              value={peakViewers >= 1000 ? `${(peakViewers / 1000).toFixed(1)}K` : peakViewers}
              icon={<TrendingUpIcon />}
              color="purple"
              trend={viewerTrend}
              sparklineData={generateSparkline(peakViewers)}
            />

            <EnhancedStatCard
              title="Average Viewers"
              value={avgViewers >= 1000 ? `${(avgViewers / 1000).toFixed(1)}K` : avgViewers}
              icon={<UsersIcon />}
              color="blue"
              sparklineData={generateSparkline(avgViewers)}
            />

            <EnhancedStatCard
              title="Live Streamers"
              value={liveStreamersCount}
              suffix={`/ ${approvedApplications}`}
              icon={<LiveIcon />}
              color="orange"
              trend={applicationTrend}
            />
          </div>

          {/* Second row of stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EnhancedStatCard
              title="Total Applications"
              value={totalApplications}
              icon={<UserCheckIcon />}
              color="purple"
              trend={applicationTrend}
            />

            <EnhancedStatCard
              title="Approved Streamers"
              value={approvedApplications}
              icon={<UserCheckIcon />}
              color="lime"
              trend={approvalTrend}
            />

            <EnhancedStatCard
              title="Approval Rate"
              value={totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0}
              suffix="%"
              icon={<TrendingUpIcon />}
              color="blue"
            />
          </div>

          {/* Viewership Timeline */}
          <ViewershipTimeline
            data={analyticsData?.viewership_by_hour || []}
          />

          {/* Engagement Metrics */}
          <EngagementMetrics
            totalHoursStreamed={totalHoursStreamed}
            totalViewers={currentViewers}
            peakViewers={peakViewers}
            averageViewers={avgViewers}
            streamCount={liveStreamersCount}
          />

          {/* Stream Health Monitor */}
          {liveStreams.length > 0 && (
            <StreamHealthMonitor streams={liveStreams} />
          )}

          {/* Streamer Leaderboard */}
          <StreamerLeaderboard streams={liveStreams} />

          {/* Platform, Funnel & Language Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlatformComparison data={platformData} />

            <ApplicationFunnel
              totalApplications={totalApplications}
              approved={approvedApplications}
              liveStreamers={liveStreamersCount}
            />
          </div>

          {/* Time Heatmap & Language Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TimeHeatmap data={timeHeatmapData} />
            <LanguageBreakdown data={languageData} />
          </div>

          {/* Live Streamers Table */}
          {liveStreams.length > 0 && (
            <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                      Live Streamers ({liveStreams.length})
                    </h3>
                    <p className="text-sm text-white/60 mt-1">Currently streaming for this tournament</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#1F1F1F] text-white/70 text-sm uppercase">
                      <th className="p-4 font-semibold">Streamer</th>
                      <th className="p-4 font-semibold">Platform</th>
                      <th className="p-4 font-semibold">Game</th>
                      <th className="p-4 font-semibold">Title</th>
                      <th className="p-4 font-semibold">Language</th>
                      <th className="p-4 font-semibold text-right">Viewers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveStreams.map((stream) => (
                      <tr key={stream.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                        <td className="p-4 font-medium text-white">{stream.streamer_name}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                            stream.platform === 'Twitch'
                              ? 'bg-[#9146FF]/20 text-[#9146FF] border-[#9146FF]/30'
                              : stream.platform === 'YouTube'
                              ? 'bg-[#FF0000]/20 text-[#FF0000] border-[#FF0000]/30'
                              : 'bg-[#53FC18]/20 text-[#53FC18] border-[#53FC18]/30'
                          }`}>
                            {stream.platform}
                          </span>
                        </td>
                        <td className="p-4 text-white/70">{stream.game}</td>
                        <td className="p-4 text-white/70 max-w-sm truncate">{stream.title}</td>
                        <td className="p-4 text-white/70">{stream.language}</td>
                        <td className="p-4 text-right">
                          <span className="font-bold text-[#DAFF7C]">{stream.current_viewers.toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
