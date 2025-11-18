import React, { useState } from 'react';
import { Tournament } from '@/types';

interface TournamentComparisonProps {
  tournaments: Tournament[];
  onCompare: (tournamentIds: string[]) => void;
}

interface ComparisonData {
  tournament: Tournament;
  metrics: {
    totalApplications: number;
    approved: number;
    rejected: number;
    pending: number;
    approvalRate: number;
    liveStreamers: number;
    peakViewers: number;
    avgViewers: number;
    totalHoursStreamed: number;
  };
}

interface ComparisonMetricCardProps {
  label: string;
  values: Array<{ tournament: string; value: string | number; growth?: number }>;
  icon: string;
}

const ComparisonMetricCard: React.FC<ComparisonMetricCardProps> = ({ label, values, icon }) => {
  // Find the best value for highlighting
  const numericValues = values.map(v => typeof v.value === 'number' ? v.value : parseFloat(v.value.toString().replace(/[^0-9.-]/g, '')) || 0);
  const maxValue = Math.max(...numericValues);

  return (
    <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-lg border border-white/10 p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg sm:text-xl">{icon}</span>
        <h4 className="text-xs sm:text-sm font-semibold text-white/70">{label}</h4>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {values.map((item, index) => {
          const isNumeric = typeof item.value === 'number';
          const numValue = isNumeric ? item.value : parseFloat(item.value.toString().replace(/[^0-9.-]/g, '')) || 0;
          const isBest = numValue === maxValue && maxValue > 0;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60 truncate max-w-[100px] sm:max-w-[120px]">{item.tournament}</span>
                {item.growth !== undefined && (
                  <span className={`text-xs font-semibold ${item.growth >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {item.growth >= 0 ? '+' : ''}{item.growth}%
                  </span>
                )}
              </div>
              <div className={`text-xl sm:text-2xl font-bold ${isBest ? 'text-[#DAFF7C]' : 'text-white'}`}>
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TournamentComparison: React.FC<TournamentComparisonProps> = ({ tournaments, onCompare }) => {
  const [selectedTournaments, setSelectedTournaments] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);

  const handleTournamentToggle = (tournamentId: string) => {
    setSelectedTournaments(prev => {
      if (prev.includes(tournamentId)) {
        return prev.filter(id => id !== tournamentId);
      } else if (prev.length < 3) {
        return [...prev, tournamentId];
      }
      return prev;
    });
  };

  const handleStartComparison = () => {
    if (selectedTournaments.length >= 2) {
      setComparisonMode(true);
      onCompare(selectedTournaments);
    }
  };

  // Mock comparison data (in production, this would come from API)
  const comparisonData: ComparisonData[] = selectedTournaments.map(id => {
    const tournament = tournaments.find(t => t.id === id)!;
    return {
      tournament,
      metrics: {
        totalApplications: Math.floor(Math.random() * 300) + 100,
        approved: Math.floor(Math.random() * 200) + 50,
        rejected: Math.floor(Math.random() * 50) + 10,
        pending: Math.floor(Math.random() * 30) + 5,
        approvalRate: Math.floor(Math.random() * 40) + 60,
        liveStreamers: Math.floor(Math.random() * 150) + 50,
        peakViewers: Math.floor(Math.random() * 5000) + 2000,
        avgViewers: Math.floor(Math.random() * 3000) + 1000,
        totalHoursStreamed: Math.floor(Math.random() * 500) + 200
      }
    };
  });

  if (!comparisonMode) {
    return (
      <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9381FF]" />
            Tournament Comparison
          </h3>
          <p className="text-sm text-white/60 mt-1">Select 2-3 tournaments to compare side-by-side</p>
        </div>

        {/* Tournament selector */}
        <div className="space-y-3 mb-6">
          {tournaments.map(tournament => (
            <button
              key={tournament.id}
              onClick={() => handleTournamentToggle(tournament.id)}
              disabled={!selectedTournaments.includes(tournament.id) && selectedTournaments.length >= 3}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                selectedTournaments.includes(tournament.id)
                  ? 'border-[#9381FF] bg-gradient-to-br from-[#9381FF]/20 to-transparent'
                  : 'border-white/10 bg-white/5 hover:border-[#9381FF]/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-3 text-left">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  selectedTournaments.includes(tournament.id)
                    ? 'border-[#9381FF] bg-[#9381FF]'
                    : 'border-white/30'
                }`}>
                  {selectedTournaments.includes(tournament.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{tournament.title}</div>
                  <div className="text-xs text-white/60">{tournament.game}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tournament.status === 'active'
                    ? 'bg-[#DAFF7C]/10 text-[#DAFF7C]'
                    : tournament.status === 'completed'
                    ? 'bg-[#9381FF]/10 text-[#9381FF]'
                    : 'bg-white/10 text-white/60'
                }`}>
                  {tournament.status}
                </span>
                <span className="text-sm text-white/60">{tournament.application_count || 0} apps</span>
              </div>
            </button>
          ))}
        </div>

        {/* Compare button */}
        <button
          onClick={handleStartComparison}
          disabled={selectedTournaments.length < 2}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#9381FF]/20 to-[#DAFF7C]/10 hover:from-[#9381FF]/30 hover:to-[#DAFF7C]/20 border border-[#9381FF]/30 hover:border-[#DAFF7C]/50 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[#DAFF7C]/20"
        >
          {selectedTournaments.length < 2
            ? `Select ${2 - selectedTournaments.length} more tournament${2 - selectedTournaments.length > 1 ? 's' : ''}`
            : `Compare ${selectedTournaments.length} Tournaments`
          }
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-xl border border-white/10 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9381FF]" />
              Tournament Comparison
            </h3>
            <p className="text-xs sm:text-sm text-white/60 mt-1">Comparing {selectedTournaments.length} tournaments</p>
          </div>
          <button
            onClick={() => {
              setComparisonMode(false);
              setSelectedTournaments([]);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm rounded-lg transition-colors"
          >
            Change Selection
          </button>
        </div>

        {/* Tournament headers */}
        <div className={`grid grid-cols-1 ${selectedTournaments.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4 mt-6`}>
          {comparisonData.map((data, index) => (
            <div key={index} className="text-center p-4 rounded-lg bg-gradient-to-br from-[#9381FF]/10 to-transparent border border-[#9381FF]/20">
              <h4 className="font-bold text-white mb-1 text-sm sm:text-base">{data.tournament.title}</h4>
              <p className="text-xs text-white/60">{data.tournament.game}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                data.tournament.status === 'active'
                  ? 'bg-[#DAFF7C]/10 text-[#DAFF7C]'
                  : 'bg-[#9381FF]/10 text-[#9381FF]'
              }`}>
                {data.tournament.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ComparisonMetricCard
          label="Total Applications"
          icon="📊"
          values={comparisonData.map(d => ({
            tournament: d.tournament.title,
            value: d.metrics.totalApplications
          }))}
        />
        <ComparisonMetricCard
          label="Approved"
          icon="✅"
          values={comparisonData.map(d => ({
            tournament: d.tournament.title,
            value: d.metrics.approved
          }))}
        />
        <ComparisonMetricCard
          label="Approval Rate"
          icon="📈"
          values={comparisonData.map(d => ({
            tournament: d.tournament.title,
            value: `${d.metrics.approvalRate}%`
          }))}
        />
        <ComparisonMetricCard
          label="Live Streamers"
          icon="🔴"
          values={comparisonData.map(d => ({
            tournament: d.tournament.title,
            value: d.metrics.liveStreamers
          }))}
        />
        <ComparisonMetricCard
          label="Peak Viewers"
          icon="🔥"
          values={comparisonData.map(d => ({
            tournament: d.tournament.title,
            value: d.metrics.peakViewers
          }))}
        />
        <ComparisonMetricCard
          label="Average Viewers"
          icon="👥"
          values={comparisonData.map(d => ({
            tournament: d.tournament.title,
            value: d.metrics.avgViewers
          }))}
        />
        <ComparisonMetricCard
          label="Total Hours Streamed"
          icon="⏱️"
          values={comparisonData.map(d => ({
            tournament: d.tournament.title,
            value: d.metrics.totalHoursStreamed
          }))}
        />
        <ComparisonMetricCard
          label="Pending Applications"
          icon="⏳"
          values={comparisonData.map(d => ({
            tournament: d.tournament.title,
            value: d.metrics.pending
          }))}
        />
        <ComparisonMetricCard
          label="Rejected"
          icon="❌"
          values={comparisonData.map(d => ({
            tournament: d.tournament.title,
            value: d.metrics.rejected
          }))}
        />
      </div>

      {/* Summary insights */}
      <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <h4 className="text-lg font-bold text-white mb-4">Comparison Insights</h4>
        <div className="space-y-3">
          {(() => {
            const bestApprovalRate = Math.max(...comparisonData.map(d => d.metrics.approvalRate));
            const bestApprovalTournament = comparisonData.find(d => d.metrics.approvalRate === bestApprovalRate);
            const mostApplications = Math.max(...comparisonData.map(d => d.metrics.totalApplications));
            const mostAppTournament = comparisonData.find(d => d.metrics.totalApplications === mostApplications);
            const bestViewers = Math.max(...comparisonData.map(d => d.metrics.peakViewers));
            const bestViewersTournament = comparisonData.find(d => d.metrics.peakViewers === bestViewers);

            return (
              <>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-[#DAFF7C]/10 to-transparent">
                  <span className="text-[#DAFF7C]">🏆</span>
                  <div className="flex-1 text-sm text-white/80">
                    <span className="font-semibold text-[#DAFF7C]">{bestApprovalTournament?.tournament.title}</span> has the highest approval rate at <span className="font-semibold">{bestApprovalRate}%</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-[#9381FF]/10 to-transparent">
                  <span className="text-[#9381FF]">📊</span>
                  <div className="flex-1 text-sm text-white/80">
                    <span className="font-semibold text-[#9381FF]">{mostAppTournament?.tournament.title}</span> received the most applications with <span className="font-semibold">{mostApplications}</span> submissions
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-[#fd934e]/10 to-transparent">
                  <span className="text-[#fd934e]">🔥</span>
                  <div className="flex-1 text-sm text-white/80">
                    <span className="font-semibold text-[#fd934e]">{bestViewersTournament?.tournament.title}</span> achieved the highest peak viewership with <span className="font-semibold">{bestViewers.toLocaleString()}</span> concurrent viewers
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default TournamentComparison;
