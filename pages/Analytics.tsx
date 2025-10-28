import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import Card from '../components/common/Card';
import { AnalyticsData, Application } from '../types';
import { UsersIcon, TrendingUpIcon, UserCheckIcon, LiveIcon } from '../components/icons/Icons';

interface OutletContextType {
  analyticsData: AnalyticsData;
  applications: Application[];
}

const COLORS = ['#387B66', '#FFCB82', '#A5D6A7', '#FFEDA0', '#66BB6A', '#FFF59D', '#4CAF50', '#FFEE58'];

const Analytics: React.FC = () => {
  const { analyticsData, applications } = useOutletContext<OutletContextType>();
  const viewersByGame = useMemo(() => {
    const gameData: {[key: string]: number} = {};
    analyticsData.liveStreamers.forEach(streamer => {
      if(gameData[streamer.game]) {
        gameData[streamer.game] += streamer.viewers;
      } else {
        gameData[streamer.game] = streamer.viewers;
      }
    });
    return Object.entries(gameData).map(([name, value]) => ({ name, value }));
  }, [analyticsData.liveStreamers]);

  const appsByLanguage = useMemo(() => {
    const langData: {[key: string]: number} = {};
    applications.forEach(app => {
        if(langData[app.language]) {
            langData[app.language]++;
        } else {
            langData[app.language] = 1;
        }
    });
    return Object.entries(langData).map(([name, value]) => ({ name, value }));
  }, [applications]);


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Current Viewers" value={analyticsData.currentViewers.toLocaleString()} icon={<UsersIcon />} />
        <Card title="Peak Viewers" value={analyticsData.maxViewers.toLocaleString()} icon={<TrendingUpIcon />} />
        <Card title="Live Streamers" value={analyticsData.liveStreamersCount} icon={<LiveIcon />} />
        <Card title="Approved Streamers" value={analyticsData.approvedStreamers} icon={<UserCheckIcon />} />
      </div>

      <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-sm border border-white/10">
        <h3 className="text-xl font-bold mb-4 text-white">Viewership History (Last 24h)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analyticsData.viewershipHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <defs>
                <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#387B66" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#387B66" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#A4A6B3" />
            <YAxis stroke="#A4A6B3" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }}
              cursor={{ stroke: '#387B66' }}
            />
            <Area type="monotone" dataKey="viewers" stroke="#387B66" fillOpacity={1} fill="url(#colorViewers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-sm border border-white/10">
           <h3 className="text-xl font-bold mb-4 text-white">Viewers by Game</h3>
           <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={viewersByGame} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#387B66" label>
                         {viewersByGame.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }} />
                    <Legend />
                </PieChart>
           </ResponsiveContainer>
        </div>
        <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-sm border border-white/10">
           <h3 className="text-xl font-bold mb-4 text-white">Applications by Language</h3>
           <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={appsByLanguage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#FFCB82" label>
                        {appsByLanguage.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }} />
                    <Legend />
                </PieChart>
           </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-[#1E1E1E] rounded-lg shadow-sm overflow-hidden border border-white/10">
        <h3 className="text-xl font-bold text-white p-6">Live Streamers</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-t border-white/20 bg-black/20 text-gray-400 text-sm uppercase">
                        <th className="p-4">Streamer</th>
                        <th className="p-4">Game</th>
                        <th className="p-4">Title</th>
                        <th className="p-4">Language</th>
                        <th className="p-4">Viewers</th>
                    </tr>
                </thead>
                <tbody>
                    {analyticsData.liveStreamers.map((streamer, index) => (
                        <tr key={index} className="border-b border-white/10 hover:bg-black/20">
                            <td className="p-4 font-medium text-white">{streamer.name}</td>
                            <td className="p-4 text-gray-300">{streamer.game}</td>
                            <td className="p-4 text-gray-300 max-w-sm truncate">{streamer.title}</td>
                            <td className="p-4 text-gray-400">{streamer.language}</td>
                            <td className="p-4 font-bold text-[#FFCB82]">{streamer.viewers.toLocaleString()}</td>
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