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
        <div className="bg-[#2A2A2A] p-6 rounded-[10px] border border-white/10">
            <h3 className="text-xl font-semibold mb-6 text-white">
                Tournament Application Summary
            </h3>
            <div className="space-y-4 max-h-[280px] overflow-y-auto">
                {summaryData.map((t) => (
                    <div
                        key={t.id}
                        className="bg-[#1F1F1F] p-4 rounded-[10px] border border-white/10 hover:border-[#DAFF7C]/30 transition-all duration-200"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex-1">
                                <p className="font-semibold text-white text-sm truncate">{t.title}</p>
                                <p className="text-xs text-white/70 mt-0.5">{t.game}</p>
                            </div>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#DAFF7C]/10 text-[#DAFF7C] border border-[#DAFF7C]/20">
                                {t.total} Apps
                            </span>
                        </div>
                        <div className="w-full bg-[#1F1F1F] rounded-full h-2 flex overflow-hidden">
                           <div
                               className="bg-[#DAFF7C] h-2"
                               style={{ width: `${t.approvedPercent}%` }}
                               title={`Approved: ${t.approved}`}
                           />
                           <div
                               className="bg-[#9381FF] h-2"
                               style={{ width: `${t.pendingPercent}%` }}
                               title={`Pending: ${t.pending}`}
                           />
                           <div
                               className="bg-red-500 h-2"
                               style={{ width: `${t.rejectedPercent}%` }}
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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Applications" value={stats?.totalApplications || 0} icon={<ApplicationIcon />} />
        <Card title="Approved" value={stats?.approved || 0} icon={<CheckCircleIcon />} />
        <Card title="Rejected" value={stats?.rejected || 0} icon={<XCircleIcon />} />
        <Card title="Pending" value={stats?.pending || 0} icon={<ClockIcon />} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#2A2A2A] p-6 rounded-[10px] border border-white/10">
          <h3 className="text-xl font-semibold mb-6 text-white">
            Application Status
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={applicationStatusData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2A2A2A',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  fontSize: '14px'
                }}
              />
              <Bar
                dataKey="count"
                barSize={40}
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <TournamentApplicationSummary tournaments={tournaments} applications={applications} />
      </div>

      {/* Recent Applications Table */}
      <div className="bg-[#2A2A2A] p-6 rounded-[10px] border border-white/10">
          <h3 className="text-xl font-semibold mb-6 text-white">
            Recent Applications
          </h3>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="border-b border-white/10 text-white/70 uppercase text-xs tracking-wide">
                          <th className="p-4 font-semibold">Streamer</th>
                          <th className="p-4 font-semibold">Tournament</th>
                          <th className="p-4 font-semibold hidden sm:table-cell">Date</th>
                          <th className="p-4 font-semibold">Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      {applications.slice(0, 5).map((app) => (
                          <tr
                              key={app.id}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                          >
                              <td className="p-4 font-medium text-white text-sm">{app.streamer.name}</td>
                              <td className="p-4 text-white/70 text-sm">{app.tournament?.title || 'Unknown'}</td>
                              <td className="p-4 text-white/70 text-sm hidden sm:table-cell">{app.submission_date}</td>
                              <td className="p-4">
                                  <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${
                                      app.status === 'Approved' ? 'bg-[#DAFF7C]/10 text-[#DAFF7C] border border-[#DAFF7C]/20' :
                                      app.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                      'bg-[#9381FF]/10 text-[#9381FF] border border-[#9381FF]/20'
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
