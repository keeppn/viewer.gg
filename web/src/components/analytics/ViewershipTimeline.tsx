import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface ViewershipTimelineProps {
  data: Array<{
    hour: string;
    viewers: number;
    streamers: number;
  }>;
}

const ViewershipTimeline: React.FC<ViewershipTimelineProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gradient-to-br from-[var(--neutral-1-bg)]/95 to-[var(--neutral-2-surface)]/95 backdrop-blur-xl p-4 rounded-xl border border-white/20 shadow-xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-white/70">{entry.name}:</span>
              <span className="text-white font-semibold">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-[var(--neutral-1-bg)]/90 to-[var(--neutral-2-surface)]/90 backdrop-blur-xl rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--contrast)]" />
            Viewership Timeline
          </h3>
          <p className="text-sm text-white/60 mt-1">Concurrent viewers and active streamers over time</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--contrast)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--contrast)" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="colorStreamers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--base)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--base)" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="hour"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => <span className="text-white/80">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="viewers"
            stroke="var(--contrast)"
            strokeWidth={3}
            fill="url(#colorViewers)"
            name="Concurrent Viewers"
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="streamers"
            stroke="var(--base)"
            strokeWidth={2}
            fill="url(#colorStreamers)"
            name="Active Streamers"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ViewershipTimeline;
