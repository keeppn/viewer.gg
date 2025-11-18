"use client";

import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Card from '@/components/common/Card';
import { Application, Stats, Tournament } from '@/types';
import { ApplicationIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@/components/icons/Icons';
import { useAppStore } from '@/store/appStore';

const TournamentApplicationSummary: React.FC<{ tournaments: Tournament[], applications: Application[] }> = ({ tournaments, applications }) => {
    const summaryData = useMemo(() => {
        return tournaments.map(tournament => {
            const relevantApps = applications.filter(app => app.tournament_id === tournament.id);
            const total = relevantApps.length;
            const approved = relevantApps.filter(app => app.status === 'Approved').length;
            const pending = relevantApps.filter(app => app.status === 'Pending').length;
            const rejected = relevantApps.filter(app => app.status === 'Rejected').length;
            
            return {
                ...tournament,
                total,
                approved,
                pending,
                rejected,
                approvedPercent: total > 0 ? (approved / total) * 100 : 0,
                pendingPercent: total > 0 ? (pending / total) * 100 : 0,
                rejectedPercent: total > 0 ? (rejected / total) * 100 : 0,
            };
        });
    }, [tournaments, applications]);

    return (
         <div className="bg-[#2A2A2A] p-4 rounded-[10px]">
            <h3 className="text-lg font-semibold mb-4 text-white">
                Tournament Applications
            </h3>
            <div className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {summaryData.map((t) => (
                    <div
                        key={t.id}
                        className="bg-[#1F1F1F] p-3 rounded-[10px]"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-sm truncate">{t.title}</p>
                                <p className="text-xs text-white/50 mt-0.5">{t.game}</p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#DAFF7C]/10 text-[#DAFF7C] ml-2">
                                {t.total}
                            </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-[10px] h-[5px] flex overflow-hidden">
                           <div
                               style={{ width: `${t.approvedPercent}%` }}
                               className="bg-[#DAFF7C] h-full"
                               title={`Approved: ${t.approved}`}
                           />
                           <div
                               style={{ width: `${t.pendingPercent}%` }}
                               className="bg-[#9381FF] h-full"
                               title={`Pending: ${t.pending}`}
                           />
                           <div
                               style={{ width: `${t.rejectedPercent}%` }}
                               className="bg-red-500 h-full"
                               title={`Rejected: ${t.rejected}`}
                           />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const Overview: React.FC = () => {
  const { stats, applications = [], tournaments = [] } = useAppStore();
  
  const applicationStatusData = [
    { name: 'Pending', count: stats?.pending || 0, fill: '#9381FF' },
    { name: 'Approved', count: stats?.approved || 0, fill: '#DAFF7C' },
    { name: 'Rejected', count: stats?.rejected || 0, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Applications" value={stats?.totalApplications || 0} icon={<ApplicationIcon />} color="#DAFF7C" />
        <Card title="Approved" value={stats?.approved || 0} icon={<CheckCircleIcon />} color="#DAFF7C" />
        <Card title="Rejected" value={stats?.rejected || 0} icon={<XCircleIcon />} color="#ef4444" />
        <Card title="Pending" value={stats?.pending || 0} icon={<ClockIcon />} color="#9381FF" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#2A2A2A] p-4 rounded-[10px]">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Application Status
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={applicationStatusData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                stroke="#888"
                tick={{ fill: '#999', fontSize: 12 }}
              />
              <YAxis stroke="#888" tick={{ fill: '#999', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2A2A2A',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#fff'
                }}
                cursor={{ fill: 'rgba(218, 255, 124, 0.1)' }}
              />
              <Bar
                dataKey="count"
                barSize={40}
                radius={[10, 10, 0, 0]}
                fill="#DAFF7C"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <TournamentApplicationSummary tournaments={tournaments} applications={applications} />
      </div>
      
      {/* Recent Applications Table */}
       <div className="bg-[#2A2A2A] p-4 rounded-[10px]">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Recent Applications
          </h3>
          <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px] sm:min-w-0">
                  <thead>
                      <tr className="border-b border-white/10 text-white/50 text-xs">
                          <th className="p-3 font-medium">Streamer</th>
                          <th className="p-3 font-medium">Tournament</th>
                          <th className="p-3 font-medium hidden sm:table-cell">Date</th>
                          <th className="p-3 font-medium">Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      {applications.slice(0, 5).map((app) => (
                          <tr
                              key={app.id}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                              <td className="p-3 font-medium text-white text-sm">{app.streamer.name}</td>
                              <td className="p-3 text-white/70 text-sm truncate max-w-[150px] sm:max-w-none">{app.tournament?.title || 'Unknown'}</td>
                              <td className="p-3 text-white/50 text-sm hidden sm:table-cell">{app.submission_date}</td>
                              <td className="p-3">
                                  <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                                      app.status === 'Approved' ? 'bg-[#DAFF7C]/10 text-[#DAFF7C]' :
                                      app.status === 'Rejected' ? 'bg-red-500/10 text-red-400' :
                                      'bg-[#9381FF]/10 text-[#9381FF]'
                                  }`}>
                                      {app.status}
                                  </span>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
       </div>
    </div>
  );
};

export default Overview;
