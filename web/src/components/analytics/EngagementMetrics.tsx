import React from 'react';

interface EngagementMetricsProps {
  totalHoursStreamed: number;
  totalViewers: number;
  peakViewers: number;
  averageViewers: number;
  streamCount: number;
}

const EngagementMetrics: React.FC<EngagementMetricsProps> = ({
  totalHoursStreamed,
  totalViewers,
  peakViewers,
  averageViewers,
  streamCount
}) => {
  // Calculate engagement metrics
  const totalHoursWatched = Math.round(totalHoursStreamed * averageViewers);
  const estimatedUniqueViewers = Math.round(peakViewers * 1.5); // Rough estimate
  const averageWatchTime = streamCount > 0 ? totalHoursStreamed / streamCount : 0;
  const totalImpressions = totalHoursWatched; // Simplified calculation
  const engagementRate = peakViewers > 0 ? (averageViewers / peakViewers) * 100 : 0;

  const metrics = [
    {
      title: 'Total Hours Watched',
      value: totalHoursWatched,
      suffix: 'hrs',
      description: 'Cumulative viewing time',
      color: 'from-[#DAFF7C]/20 to-[#DAFF7C]/5',
      borderColor: 'border-[#DAFF7C]/30',
      textColor: 'text-[#DAFF7C]',
      icon: '⏱️'
    },
    {
      title: 'Estimated Unique Viewers',
      value: estimatedUniqueViewers,
      suffix: '',
      description: 'Approximate reach',
      color: 'from-[#9381FF]/20 to-[#9381FF]/5',
      borderColor: 'border-[#9381FF]/30',
      textColor: 'text-[#9381FF]',
      icon: '👥'
    },
    {
      title: 'Average Watch Time',
      value: averageWatchTime.toFixed(1),
      suffix: 'hrs',
      description: 'Per stream session',
      color: 'from-[#3b82f6]/20 to-[#3b82f6]/5',
      borderColor: 'border-[#3b82f6]/30',
      textColor: 'text-[#3b82f6]',
      icon: '📺'
    },
    {
      title: 'Total Impressions',
      value: totalImpressions >= 1000 ? `${(totalImpressions / 1000).toFixed(1)}K` : totalImpressions,
      suffix: '',
      description: 'Viewer × Hours metric',
      color: 'from-[#fd934e]/20 to-[#fd934e]/5',
      borderColor: 'border-[#fd934e]/30',
      textColor: 'text-[#fd934e]',
      icon: '📊'
    },
    {
      title: 'Engagement Rate',
      value: engagementRate.toFixed(1),
      suffix: '%',
      description: 'Avg/Peak viewer ratio',
      color: 'from-[#10b981]/20 to-[#10b981]/5',
      borderColor: 'border-[#10b981]/30',
      textColor: 'text-[#10b981]',
      icon: '💬'
    },
    {
      title: 'Concurrent Peak',
      value: peakViewers,
      suffix: '',
      description: 'Highest simultaneous',
      color: 'from-[#f59e0b]/20 to-[#f59e0b]/5',
      borderColor: 'border-[#f59e0b]/30',
      textColor: 'text-[#f59e0b]',
      icon: '🔥'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-xl border border-white/10 p-6 h-full flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          Engagement Metrics
        </h3>
        <p className="text-sm text-white/60 mt-1">Advanced reach and engagement analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`group relative bg-gradient-to-br ${metric.color} backdrop-blur-sm rounded-lg border ${metric.borderColor} p-4 hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="text-xs text-white/60 font-medium mb-1">{metric.title}</div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${metric.textColor}`}>
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </span>
                  {metric.suffix && <span className="text-sm text-white/60">{metric.suffix}</span>}
                </div>
              </div>
              <span className="text-2xl flex-shrink-0">{metric.icon}</span>
            </div>
            <div className="text-xs text-white/40">{metric.description}</div>
          </div>
        ))}
      </div>

      {/* Insights section */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="text-sm font-semibold text-white mb-3">📈 Engagement Insights</div>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <span className="text-[#10b981] flex-shrink-0">✓</span>
            <span className="text-white/70">
              {engagementRate >= 60
                ? 'Excellent viewer retention - audience is highly engaged'
                : engagementRate >= 40
                ? 'Good engagement levels - consider interactive content to boost further'
                : 'Viewer retention could be improved - focus on engagement strategies'
              }
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-[#10b981] flex-shrink-0">✓</span>
            <span className="text-white/70">
              Total reach of approximately <span className="text-[#DAFF7C] font-semibold">{estimatedUniqueViewers.toLocaleString()}</span> unique viewers
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-[#10b981] flex-shrink-0">✓</span>
            <span className="text-white/70">
              Generated <span className="text-[#9381FF] font-semibold">{totalHoursWatched.toLocaleString()}</span> hours of content consumption
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementMetrics;
