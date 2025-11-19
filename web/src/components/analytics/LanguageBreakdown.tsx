import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface LanguageBreakdownProps {
  data: Array<{
    language: string;
    viewers: number;
    streamers: number;
  }>;
}

const LanguageBreakdown: React.FC<LanguageBreakdownProps> = ({ data }) => {
  const COLORS = ['#DAFF7C', '#9381FF', '#00F0FF', '#FFB800', '#66BB6A', '#FFF59D', '#4CAF50', '#FFEE58'];

  const totalViewers = data.reduce((sum, item) => sum + item.viewers, 0);
  const totalStreamers = data.reduce((sum, item) => sum + item.streamers, 0);

  // Sort by viewers and take top 8
  const sortedData = [...data]
    .sort((a, b) => b.viewers - a.viewers)
    .slice(0, 8)
    .map((item, index) => ({
      ...item,
      percentage: totalViewers > 0 ? ((item.viewers / totalViewers) * 100).toFixed(1) : 0,
      color: COLORS[index % COLORS.length]
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gradient-to-br from-[#1F1F1F]/95 to-[#2A2A2A]/95 backdrop-blur-xl p-4 rounded-xl border border-white/20 shadow-xl">
          <p className="text-white font-semibold mb-2">{data.language}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/70">Viewers:</span>
              <span className="text-white font-semibold">{data.viewers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/70">Streamers:</span>
              <span className="text-white font-semibold">{data.streamers}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/70">Percentage:</span>
              <span className="text-white font-semibold">{data.percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-xl border border-white/10 p-6 h-full flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DAFF7C]" />
          Language Distribution
        </h3>
        <p className="text-sm text-white/60 mt-1">Viewership breakdown by stream language</p>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#9381FF]/20 to-[#DAFF7C]/20 flex items-center justify-center">
              <span className="text-3xl">🌍</span>
            </div>
            <p className="text-white/60">No language data available</p>
          </div>
        </div>
      ) : (
        <>
          {/* Donut Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sortedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="viewers"
                animationDuration={1000}
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Language list */}
          <div className="mt-6 space-y-2">
            {sortedData.map((item, index) => (
              <div
                key={item.language}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <span className="text-sm font-semibold text-white">{item.language}</span>
                    <span className="text-xs text-white/60 ml-2">({item.streamers} streamers)</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{item.viewers.toLocaleString()}</div>
                    <div className="text-xs text-white/60">viewers</div>
                  </div>
                  <div className="text-right min-w-[50px]">
                    <div className="text-sm font-bold text-[#DAFF7C]">{item.percentage}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary stats */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{data.length}</div>
              <div className="text-xs text-white/60 mt-1">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#DAFF7C]">{totalViewers.toLocaleString()}</div>
              <div className="text-xs text-white/60 mt-1">Total Viewers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#9381FF]">{totalStreamers}</div>
              <div className="text-xs text-white/60 mt-1">Total Streamers</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageBreakdown;
