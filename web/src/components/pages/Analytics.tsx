"use client";

import React, { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import Card from '@/components/common/Card';
import { UsersIcon, TrendingUpIcon, UserCheckIcon, LiveIcon } from '@/components/icons/Icons';

const COLORS = ['#DAFF7C', '#9381FF', '#00F0FF', '#FFB800', '#66BB6A', '#FFF59D', '#4CAF50', '#FFEE58'];

const Analytics: React.FC = () => {
  const { analyticsData, applications, liveStreams } = useAppStore();
  
  const viewersByGame = useMemo(() => {
    const gameData: {[key: string]: number} = {};
    liveStreams.forEach(stream => {
      if(gameData[stream.game]) {
        gameData[stream.game] += stream.current_viewers;
      } else {
        gameData[stream.game] = stream.current_viewers;
      }
    });
    return Object.entries(gameData).map(([name, value]) => ({ name, value }));
  }, [liveStreams]);

  const appsByLanguage = useMemo(() => {
    const langData: {[key: string]: number} = {};
    applications.forEach(app => {
      const lang = app.streamer.primary_languages[0] || 'Unknown';
      if(langData[lang]) {
        langData[lang]++;
      } else {
        langData[lang] = 1;
      }
    });
    return Object.entries(langData).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const currentViewers = liveStreams.reduce((sum, stream) => sum + stream.current_viewers, 0);
  const peakViewers = analyticsData?.peak_concurrent_viewers || 0;
  const liveStreamersCount = liveStreams.length;
  const approvedApplications = applications.filter(app => app.status === 'Approved').length;


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Current Viewers" value={currentViewers.toLocaleString()} icon={<UsersIcon />} />
        <Card title="Peak Viewers" value={peakViewers.toLocaleString()} icon={<TrendingUpIcon />} />
        <Card title="Live Streamers" value={liveStreamersCount.toString()} icon={<LiveIcon />} />
        <Card title="Approved Streamers" value={approvedApplications.toString()} icon={<UserCheckIcon />} />
      </div>

      <div className="bg-[#2A2A2A] p-6 rounded-[10px] border border-white/10">
        <h3 className="text-xl font-semibold mb-6 text-white">Viewership History (Last 24h)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analyticsData?.viewership_by_hour || []} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <defs>
                <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DAFF7C" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#DAFF7C" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="hour" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
            <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
            />
            <Area type="monotone" dataKey="viewers" stroke="#DAFF7C" fillOpacity={1} fill="url(#colorViewers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#2A2A2A] p-6 rounded-[10px] border border-white/10">
           <h3 className="text-xl font-semibold mb-6 text-white">Viewers by Game</h3>
           <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={viewersByGame} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                         {viewersByGame.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }} />
                    <Legend />
                </PieChart>
           </ResponsiveContainer>
        </div>
        <div className="bg-[#2A2A2A] p-6 rounded-[10px] border border-white/10">
           <h3 className="text-xl font-semibold mb-6 text-white">Applications by Language</h3>
           <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={appsByLanguage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {appsByLanguage.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }} />
                    <Legend />
                </PieChart>
           </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-[#2A2A2A] rounded-[10px] overflow-hidden border border-white/10">
        <h3 className="text-xl font-semibold text-white p-6">Live Streamers</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-white/10 bg-[#1F1F1F] text-white/70 text-sm uppercase">
                        <th className="p-4 font-semibold">Streamer</th>
                        <th className="p-4 font-semibold">Game</th>
                        <th className="p-4 font-semibold">Title</th>
                        <th className="p-4 font-semibold">Language</th>
                        <th className="p-4 font-semibold">Viewers</th>
                    </tr>
                </thead>
                <tbody>
                    {liveStreams.map((stream) => (
                        <tr key={stream.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                            <td className="p-4 font-medium text-white">{stream.streamer_name}</td>
                            <td className="p-4 text-white/70">{stream.game}</td>
                            <td className="p-4 text-white/70 max-w-sm truncate">{stream.title}</td>
                            <td className="p-4 text-white/70">{stream.language}</td>
                            <td className="p-4 font-bold text-[#DAFF7C]">{stream.current_viewers.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
       </div>
    </div>
  );
};

export default Analytics;