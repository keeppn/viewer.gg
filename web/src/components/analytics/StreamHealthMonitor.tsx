import React, { useMemo } from 'react';
import { LiveStream } from '@/types';

interface StreamHealthMonitorProps {
  streams: LiveStream[];
}

type HealthStatus = 'excellent' | 'good' | 'warning' | 'critical';

interface StreamHealth {
  stream: LiveStream;
  status: HealthStatus;
  healthScore: number;
  issues: string[];
  recommendations: string[];
}

const StreamHealthMonitor: React.FC<StreamHealthMonitorProps> = ({ streams }) => {
  // Calculate health status for each stream
  const streamHealthData = useMemo(() => {
    return streams.map(stream => {
      const issues: string[] = [];
      const recommendations: string[] = [];
      let healthScore = 100;

      // Check viewer drop (comparing current to peak)
      const viewerRetention = stream.peak_viewers > 0
        ? (stream.current_viewers / stream.peak_viewers) * 100
        : 100;

      if (viewerRetention < 30) {
        healthScore -= 40;
        issues.push('Significant viewer drop (-70%)');
        recommendations.push('Check stream quality and engagement');
      } else if (viewerRetention < 50) {
        healthScore -= 20;
        issues.push('Moderate viewer drop (-50%)');
        recommendations.push('Consider interactive content');
      } else if (viewerRetention < 70) {
        healthScore -= 10;
        issues.push('Slight viewer decline');
      }

      // Check stream duration
      const streamDuration = (Date.now() - new Date(stream.stream_start).getTime()) / (1000 * 60 * 60);

      if (streamDuration > 8) {
        healthScore -= 10;
        issues.push('Long stream duration (fatigue risk)');
        recommendations.push('Consider taking breaks');
      }

      // Check viewer count relative to average
      if (stream.current_viewers < stream.average_viewers * 0.5) {
        healthScore -= 15;
        issues.push('Below average viewership');
        recommendations.push('Boost engagement or promote stream');
      }

      // Determine status based on health score
      let status: HealthStatus;
      if (healthScore >= 85) status = 'excellent';
      else if (healthScore >= 70) status = 'good';
      else if (healthScore >= 50) status = 'warning';
      else status = 'critical';

      return {
        stream,
        status,
        healthScore: Math.max(0, Math.min(100, healthScore)),
        issues,
        recommendations
      };
    });
  }, [streams]);

  const statusConfig = {
    excellent: {
      icon: '🟢',
      label: 'Excellent',
      color: 'text-[#10b981]',
      bg: 'bg-[#10b981]/10',
      border: 'border-[#10b981]/30',
      glow: 'shadow-[#10b981]/20'
    },
    good: {
      icon: '🟡',
      label: 'Good',
      color: 'text-[var(--contrast)]',
      bg: 'bg-[var(--contrast)]/10',
      border: 'border-[var(--contrast)]/30',
      glow: 'shadow-[var(--contrast)]/20'
    },
    warning: {
      icon: '🟠',
      label: 'Warning',
      color: 'text-[#f59e0b]',
      bg: 'bg-[#f59e0b]/10',
      border: 'border-[#f59e0b]/30',
      glow: 'shadow-[#f59e0b]/20'
    },
    critical: {
      icon: '🔴',
      label: 'Critical',
      color: 'text-[#ef4444]',
      bg: 'bg-[#ef4444]/10',
      border: 'border-[#ef4444]/30',
      glow: 'shadow-[#ef4444]/20'
    }
  };

  // Count by status
  const statusCounts = useMemo(() => {
    return {
      excellent: streamHealthData.filter(s => s.status === 'excellent').length,
      good: streamHealthData.filter(s => s.status === 'good').length,
      warning: streamHealthData.filter(s => s.status === 'warning').length,
      critical: streamHealthData.filter(s => s.status === 'critical').length
    };
  }, [streamHealthData]);

  // Sort by health score (worst first for attention)
  const sortedStreams = [...streamHealthData].sort((a, b) => a.healthScore - b.healthScore);

  return (
    <div className="bg-gradient-to-br from-[var(--neutral-1-bg)]/90 to-[var(--neutral-2-surface)]/90 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              Stream Health Monitor
            </h3>
            <p className="text-sm text-white/60 mt-1">Real-time health status and alerts</p>
          </div>

          {/* Status summary */}
          <div className="flex items-center gap-3">
            {(Object.keys(statusConfig) as HealthStatus[]).map(status => {
              const count = statusCounts[status];
              const config = statusConfig[status];
              if (count === 0) return null;

              return (
                <div key={status} className="flex items-center gap-2">
                  <span className="text-xl">{config.icon}</span>
                  <span className="text-sm font-semibold text-white">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stream list */}
      {streamHealthData.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--base)]/20 to-[var(--contrast)]/20 flex items-center justify-center">
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-white/60 mb-2">No active streams to monitor</p>
          <p className="text-sm text-white/40">Health monitoring will appear when streams are live</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {sortedStreams.map(({ stream, status, healthScore, issues, recommendations }) => {
            const config = statusConfig[status];

            return (
              <div
                key={stream.id}
                className="p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div className="flex-shrink-0 pt-1">
                    <span className="text-2xl">{config.icon}</span>
                  </div>

                  {/* Stream info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white truncate">{stream.streamer_name}</h4>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${config.bg} ${config.border} ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-white/60">
                        Health Score: <span className={`font-semibold ${config.color}`}>{healthScore}/100</span>
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-4 text-xs text-white/60 mb-3">
                      <span>Current: <span className="text-white font-semibold">{stream.current_viewers.toLocaleString()}</span></span>
                      <span>•</span>
                      <span>Peak: <span className="text-white font-semibold">{stream.peak_viewers.toLocaleString()}</span></span>
                      <span>•</span>
                      <span>Avg: <span className="text-white font-semibold">{stream.average_viewers.toLocaleString()}</span></span>
                      <span>•</span>
                      <span>Retention: <span className={`font-semibold ${
                        stream.peak_viewers > 0 && (stream.current_viewers / stream.peak_viewers) < 0.5 ? 'text-[#ef4444]' : 'text-[#10b981]'
                      }`}>
                        {stream.peak_viewers > 0 ? `${((stream.current_viewers / stream.peak_viewers) * 100).toFixed(0)}%` : 'N/A'}
                      </span></span>
                    </div>

                    {/* Issues */}
                    {issues.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold text-white/70 mb-1">Issues:</div>
                        <div className="space-y-1">
                          {issues.map((issue, index) => (
                            <div key={index} className="flex items-start gap-2 text-xs text-[#f59e0b]">
                              <span>⚠️</span>
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-white/70 mb-1">Recommendations:</div>
                        <div className="space-y-1">
                          {recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 text-xs text-[var(--base)]">
                              <span>💡</span>
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Overall health summary */}
      {streamHealthData.length > 0 && (
        <div className="p-6 border-t border-white/10 bg-gradient-to-br from-white/5 to-transparent">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#10b981]">{statusCounts.excellent}</div>
              <div className="text-xs text-white/60 mt-1">Excellent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--contrast)]">{statusCounts.good}</div>
              <div className="text-xs text-white/60 mt-1">Good</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#f59e0b]">{statusCounts.warning}</div>
              <div className="text-xs text-white/60 mt-1">Warning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#ef4444]">{statusCounts.critical}</div>
              <div className="text-xs text-white/60 mt-1">Critical</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamHealthMonitor;
