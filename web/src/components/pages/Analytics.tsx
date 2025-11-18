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
import TournamentComparison from '@/components/analytics/TournamentComparison';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  // Handle tournament comparison
  const handleCompare = (tournamentIds: string[]) => {
    console.log('Comparing tournaments:', tournamentIds);
    // In production, this would fetch comparison data for selected tournaments
  };

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
    } else if (format === 'pdf') {
      // Generate PDF report
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Add header with logo area and title
      doc.setFillColor(147, 129, 255); // Purple color
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Analytics Report', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(selectedTournament?.title || 'Tournament', pageWidth / 2, 30, { align: 'center' });

      // Reset text color for content
      doc.setTextColor(0, 0, 0);

      // Add date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 50);

      let yPosition = 60;

      // Key Performance Indicators Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(147, 129, 255);
      doc.text('Key Performance Indicators', 14, yPosition);
      yPosition += 10;

      doc.setTextColor(0, 0, 0);
      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: [
          ['Total Applications', totalApplications.toString()],
          ['Approved Applications', approvedApplications.toString()],
          ['Approval Rate', `${totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0}%`],
          ['Live Streamers', liveStreamersCount.toString()],
          ['Peak Concurrent Viewers', peakViewers.toLocaleString()],
          ['Average Viewers', avgViewers.toLocaleString()],
          ['Total Hours Streamed', totalHoursStreamed.toLocaleString()],
          ['Total Hours Watched', totalHoursWatched.toLocaleString()],
        ],
        theme: 'grid',
        headStyles: { fillColor: [147, 129, 255], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        margin: { left: 14, right: 14 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;

      // Platform Distribution Section
      if (platformData.length > 0) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(147, 129, 255);
        doc.text('Platform Distribution', 14, yPosition);
        yPosition += 10;

        doc.setTextColor(0, 0, 0);
        autoTable(doc, {
          startY: yPosition,
          head: [['Platform', 'Viewers', 'Stream Count', 'Avg per Stream']],
          body: platformData.map(p => [
            p.platform,
            p.viewers.toLocaleString(),
            p.streamCount.toString(),
            Math.round(p.viewers / p.streamCount).toLocaleString()
          ]),
          theme: 'grid',
          headStyles: { fillColor: [147, 129, 255], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [248, 249, 250] },
          margin: { left: 14, right: 14 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      // Top Streamers Section
      if (liveStreams.length > 0) {
        const topStreamers = [...liveStreams]
          .sort((a, b) => b.peak_viewers - a.peak_viewers)
          .slice(0, 10);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(147, 129, 255);
        doc.text('Top Streamers (by Peak Viewers)', 14, yPosition);
        yPosition += 10;

        doc.setTextColor(0, 0, 0);
        autoTable(doc, {
          startY: yPosition,
          head: [['Rank', 'Streamer', 'Platform', 'Current', 'Peak', 'Average']],
          body: topStreamers.map((s, idx) => [
            `${idx + 1}`,
            s.streamer_name,
            s.platform,
            s.current_viewers.toLocaleString(),
            s.peak_viewers.toLocaleString(),
            s.average_viewers.toLocaleString()
          ]),
          theme: 'grid',
          headStyles: { fillColor: [147, 129, 255], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [248, 249, 250] },
          margin: { left: 14, right: 14 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      // Language Distribution Section
      if (languageData.length > 0) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(147, 129, 255);
        doc.text('Language Distribution', 14, yPosition);
        yPosition += 10;

        const sortedLanguages = [...languageData]
          .sort((a, b) => b.viewers - a.viewers)
          .slice(0, 10);

        const totalViewersLang = sortedLanguages.reduce((sum, l) => sum + l.viewers, 0);

        doc.setTextColor(0, 0, 0);
        autoTable(doc, {
          startY: yPosition,
          head: [['Language', 'Viewers', 'Streamers', 'Percentage']],
          body: sortedLanguages.map(l => [
            l.language,
            l.viewers.toLocaleString(),
            l.streamers.toString(),
            `${totalViewersLang > 0 ? ((l.viewers / totalViewersLang) * 100).toFixed(1) : 0}%`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [147, 129, 255], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [248, 249, 250] },
          margin: { left: 14, right: 14 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Add footer with page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          'viewer.gg Analytics',
          14,
          pageHeight - 10
        );
      }

      // Download PDF
      doc.save(`analytics-${selectedTournament?.title || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Compact Header with Tournament Selector and Export */}
      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-3">
          {selectedTournamentId && (
            <ExportMenu
              tournamentName={selectedTournament?.title || 'Tournament'}
              onExport={handleExport}
            />
          )}
          <div className="w-64">
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
          {/* Compact KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <EnhancedStatCard
              title="Peak Viewers"
              value={peakViewers >= 1000 ? `${(peakViewers / 1000).toFixed(1)}K` : peakViewers}
              icon={<TrendingUpIcon />}
              color="purple"
              trend={viewerTrend}
              sparklineData={generateSparkline(peakViewers)}
            />

            <EnhancedStatCard
              title="Avg Viewers"
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

            <EnhancedStatCard
              title="Applications"
              value={totalApplications}
              icon={<UserCheckIcon />}
              color="purple"
              trend={applicationTrend}
            />

            <EnhancedStatCard
              title="Approval Rate"
              value={totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0}
              suffix="%"
              icon={<TrendingUpIcon />}
              color="lime"
              trend={approvalTrend}
            />
          </div>

          {/* Main Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Viewership Timeline - Full Width */}
            <div className="lg:col-span-3">
              <ViewershipTimeline
                data={analyticsData?.viewership_by_hour || []}
              />
            </div>

            {/* Streamer Leaderboard - 2 cols */}
            <div className="lg:col-span-2">
              <StreamerLeaderboard streams={liveStreams} />
            </div>

            {/* Platform Comparison - 1 col */}
            <div className="lg:col-span-1">
              <PlatformComparison data={platformData} />
            </div>

            {/* Engagement Metrics - 2 cols */}
            <div className="lg:col-span-2">
              <EngagementMetrics
                totalHoursStreamed={totalHoursStreamed}
                totalViewers={currentViewers}
                peakViewers={peakViewers}
                averageViewers={avgViewers}
                streamCount={liveStreamersCount}
              />
            </div>

            {/* Language Breakdown - 1 col */}
            <div className="lg:col-span-1">
              <LanguageBreakdown data={languageData} />
            </div>

            {/* Time Heatmap - Full Width */}
            <div className="lg:col-span-3">
              <TimeHeatmap data={timeHeatmapData} />
            </div>
          </div>

          {/* Stream Health Monitor - Only show if there are live streams */}
          {liveStreams.length > 0 && (
            <StreamHealthMonitor streams={liveStreams} />
          )}

          {/* Live Streamers Table */}
          {liveStreams.length > 0 && (
            <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                      Live Streamers ({liveStreams.length})
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60 mt-1">Currently streaming for this tournament</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[640px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#1F1F1F] text-white/70 text-xs sm:text-sm uppercase">
                      <th className="p-3 sm:p-4 font-semibold whitespace-nowrap">Streamer</th>
                      <th className="p-3 sm:p-4 font-semibold whitespace-nowrap">Platform</th>
                      <th className="p-3 sm:p-4 font-semibold whitespace-nowrap hidden md:table-cell">Game</th>
                      <th className="p-3 sm:p-4 font-semibold whitespace-nowrap hidden lg:table-cell">Title</th>
                      <th className="p-3 sm:p-4 font-semibold whitespace-nowrap hidden sm:table-cell">Language</th>
                      <th className="p-3 sm:p-4 font-semibold text-right whitespace-nowrap">Viewers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveStreams.map((stream) => (
                      <tr key={stream.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                        <td className="p-3 sm:p-4 font-medium text-white text-sm">{stream.streamer_name}</td>
                        <td className="p-3 sm:p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border whitespace-nowrap ${
                            stream.platform === 'Twitch'
                              ? 'bg-[#9146FF]/20 text-[#9146FF] border-[#9146FF]/30'
                              : stream.platform === 'YouTube'
                              ? 'bg-[#FF0000]/20 text-[#FF0000] border-[#FF0000]/30'
                              : 'bg-[#53FC18]/20 text-[#53FC18] border-[#53FC18]/30'
                          }`}>
                            {stream.platform}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-white/70 text-sm hidden md:table-cell">{stream.game}</td>
                        <td className="p-3 sm:p-4 text-white/70 text-sm max-w-sm truncate hidden lg:table-cell">{stream.title}</td>
                        <td className="p-3 sm:p-4 text-white/70 text-sm hidden sm:table-cell">{stream.language}</td>
                        <td className="p-3 sm:p-4 text-right">
                          <span className="font-bold text-[#DAFF7C] text-sm">{stream.current_viewers.toLocaleString()}</span>
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
