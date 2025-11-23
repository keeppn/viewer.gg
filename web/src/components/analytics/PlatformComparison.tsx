import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend } from 'recharts';

interface PlatformComparisonProps {
  data: Array<{
    platform: string;
    viewers: number;
    streamCount: number;
  }>;
}

const PlatformComparison: React.FC<PlatformComparisonProps> = ({ data }) => {
  const platformColors: { [key: string]: string } = {
    'Twitch': '#9146FF',
    'YouTube': '#FF0000',
    'Kick': '#53FC18',
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gradient-to-br from-[#1F1F1F]/95 to-[#2A2A2A]/95 backdrop-blur-xl p-4 rounded-xl border border-white/20 shadow-xl">
          <p className="text-white font-semibold mb-2">{data.platform}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/70">Viewers:</span>
              <span className="text-white font-semibold">{data.viewers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/70">Streams:</span>
              <span className="text-white font-semibold">{data.streamCount}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/70">Avg per stream:</span>
              <span className="text-white font-semibold">
                {Math.round(data.viewers / data.streamCount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-xl border border-white/10 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9381FF]" />
          Platform Distribution
        </h3>
        <p className="text-sm text-white/60 mt-1">Viewership breakdown by streaming platform</p>
      </div>

      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#9381FF]/20 to-[#DAFF7C]/20 flex items-center justify-center">
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-white/60">No platform data available</p>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <XAxis
                type="number"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis
                type="category"
                dataKey="platform"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="viewers"
                radius={[0, 8, 8, 0]}
                animationDuration={1000}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={platformColors[entry.platform] || '#9381FF'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Platform stats grid */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {data.map((platform) => (
              <div
                key={platform.platform}
                className="p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: platformColors[platform.platform] }}
                  />
                  <span className="text-sm font-semibold text-white">{platform.platform}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Viewers</span>
                    <span className="text-white font-semibold">{platform.viewers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Streams</span>
                    <span className="text-white font-semibold">{platform.streamCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PlatformComparison;
