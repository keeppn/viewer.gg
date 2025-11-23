import React from 'react';

interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  suffix?: string;
  sparklineData?: number[];
  color?: 'purple' | 'lime' | 'orange' | 'blue';
}

const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({
  title,
  value,
  icon,
  trend,
  suffix,
  sparklineData,
  color = 'purple'
}) => {
  const colorConfig = {
    purple: {
      gradient: 'from-[#9381FF]/20 to-[#9381FF]/5',
      border: 'border-[#9381FF]/30',
      glow: 'shadow-[#9381FF]/20',
      text: 'text-[#9381FF]',
      sparkline: '#9381FF'
    },
    lime: {
      gradient: 'from-[#DAFF7C]/20 to-[#DAFF7C]/5',
      border: 'border-[#DAFF7C]/30',
      glow: 'shadow-[#DAFF7C]/20',
      text: 'text-[#DAFF7C]',
      sparkline: '#DAFF7C'
    },
    orange: {
      gradient: 'from-[#fd934e]/20 to-[#fd934e]/5',
      border: 'border-[#fd934e]/30',
      glow: 'shadow-[#fd934e]/20',
      text: 'text-[#fd934e]',
      sparkline: '#fd934e'
    },
    blue: {
      gradient: 'from-[#3b82f6]/20 to-[#3b82f6]/5',
      border: 'border-[#3b82f6]/30',
      glow: 'shadow-[#3b82f6]/20',
      text: 'text-[#3b82f6]',
      sparkline: '#3b82f6'
    }
  };

  const config = colorConfig[color];
  const isPositive = trend && trend.value > 0;
  const isNegative = trend && trend.value < 0;

  // Simple sparkline SVG
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;

    const width = 80;
    const height = 24;
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;

    const points = sparklineData.map((value, index) => {
      const x = (index / (sparklineData.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="opacity-50">
        <polyline
          points={points}
          fill="none"
          stroke={config.sparkline}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className={`group relative bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-xl border ${config.border} hover:${config.glow} hover:shadow-lg transition-all duration-300 overflow-hidden`}>
      {/* Glowing gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative p-6">
        {/* Header with icon and title */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm text-white/60 font-medium mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-white">{value.toLocaleString()}</h3>
              {suffix && <span className="text-lg text-white/60">{suffix}</span>}
            </div>
          </div>
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center ${config.text}`}>
            {icon}
          </div>
        </div>

        {/* Trend and sparkline */}
        <div className="flex items-center justify-between">
          {trend && (
            <div className="flex items-center gap-1.5">
              {isPositive && (
                <svg className="w-4 h-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )}
              {isNegative && (
                <svg className="w-4 h-4 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span className={`text-sm font-semibold ${isPositive ? 'text-[#10b981]' : isNegative ? 'text-[#ef4444]' : 'text-white/60'}`}>
                {isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-white/40">{trend.label}</span>
            </div>
          )}
          {sparklineData && (
            <div className="ml-auto">
              {renderSparkline()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedStatCard;
