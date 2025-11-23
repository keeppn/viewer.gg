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
        <div className="bg-gradient-to-br from-[#2A2A2A] to-[#252525] p-5 rounded-[12px] border border-[#9381FF]/20 relative overflow-hidden h-full">
            {/* Purple accent glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9381FF]/10 rounded-full blur-3xl" />

            <h3 className="relative text-lg font-semibold mb-4 text-white">
                Tournament Summary
            </h3>
            <div className="relative space-y-3 max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#9381FF]/30 scrollbar-track-transparent">
                {summaryData.map((t) => (
                    <div
                        key={t.id}
                        className="bg-[#1F1F1F] p-4 rounded-[10px] border border-[#9381FF]/10 hover:border-[#9381FF]/30 hover:shadow-lg hover:shadow-[#9381FF]/10 transition-all duration-300"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex-1">
                                <p className="font-semibold text-white text-sm truncate">{t.title}</p>
                                <p className="text-xs text-[#9381FF] mt-0.5">{t.game}</p>
                            </div>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-[#DAFF7C]/20 to-[#9381FF]/10 text-[#DAFF7C] border border-[#DAFF7C]/30 shadow-lg shadow-[#DAFF7C]/10">
                                {t.total} Apps
                            </span>
                        </div>
                        <div className="w-full bg-[#1A1A1A] rounded-full h-2.5 flex overflow-hidden shadow-inner">
                           <div
                               className="bg-gradient-to-r from-[#DAFF7C] to-[#c4e96e] h-2.5 shadow-[0_0_10px_rgba(218,255,124,0.5)]"
                               style={{ width: `${t.approvedPercent}%` }}
                               title={`Approved: ${t.approved}`}
                           />
                           <div
                               className="bg-gradient-to-r from-[#9381FF] to-[#7d6dd9] h-2.5 shadow-[0_0_10px_rgba(147,129,255,0.5)]"
                               style={{ width: `${t.pendingPercent}%` }}
                               title={`Pending: ${t.pending}`}
                           />
                           <div
                               className="bg-gradient-to-r from-red-500 to-red-600 h-2.5"
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
    <div className="space-y-5">
      {/* Compact description */}
      <p className="text-sm text-white/60">Quick overview of your tournament applications and status</p>

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card title="Applications" value={stats?.totalApplications || 0} icon={<ApplicationIcon />} accentColor="purple" />
        <Card title="Approved" value={stats?.approved || 0} icon={<CheckCircleIcon />} accentColor="lime" />
        <Card title="Pending" value={stats?.pending || 0} icon={<ClockIcon />} accentColor="orange" />
        <Card title="Rejected" value={stats?.rejected || 0} icon={<XCircleIcon />} accentColor="red" />
      </div>

      {/* Charts Section - Compact Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="lg:col-span-3 bg-gradient-to-br from-[#2A2A2A] to-[#252525] p-5 rounded-[12px] border border-[#9381FF]/20 relative overflow-hidden">
          {/* Purple accent glow */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#9381FF]/10 rounded-full blur-3xl" />

          <h3 className="relative text-lg font-semibold mb-4 text-white">
            Application Status
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={applicationStatusData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(147,129,255,0.1)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#9381FF"
                tick={{ fill: '#9381FF', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#9381FF', strokeWidth: 2 }}
              />
              <YAxis
                stroke="#9381FF"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2A2A2A',
                  border: '1px solid rgba(147,129,255,0.3)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  boxShadow: '0 4px 12px rgba(147,129,255,0.2)',
                  color: '#fff',
                  fontWeight: 600
                }}
                cursor={{ fill: 'rgba(147,129,255,0.1)' }}
                labelStyle={{ color: '#DAFF7C', fontWeight: 700 }}
              />
              <Bar
                dataKey="count"
                barSize={45}
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2">
          <TournamentApplicationSummary tournaments={tournaments} applications={applications} />
        </div>
      </div>

      {/* Recent Applications Table - Compact */}
      <div className="bg-gradient-to-br from-[#2A2A2A] to-[#252525] p-5 rounded-[12px] border border-[#9381FF]/20 relative overflow-hidden">
          {/* Purple accent glow */}
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#9381FF]/10 rounded-full blur-3xl" />

          <h3 className="relative text-lg font-semibold mb-4 text-white">
            Recent Applications
          </h3>
          <div className="relative overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="border-b border-[#9381FF]/20 text-white/70 uppercase text-xs tracking-wide bg-[#1F1F1F]/50">
                          <th className="p-3 font-semibold">Streamer</th>
                          <th className="p-3 font-semibold">Tournament</th>
                          <th className="p-3 font-semibold hidden sm:table-cell">Date</th>
                          <th className="p-3 font-semibold">Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      {applications.slice(0, 5).map((app) => (
                          <tr
                              key={app.id}
                              className="border-b border-white/5 hover:bg-gradient-to-r hover:from-[#9381FF]/5 hover:to-transparent transition-all duration-300"
                          >
                              <td className="p-3 font-medium text-white text-sm">{app.streamer.name}</td>
                              <td className="p-3 text-white/70 text-sm">{app.tournament?.title || 'Unknown'}</td>
                              <td className="p-3 text-white/70 text-xs hidden sm:table-cell">{new Date(app.submission_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                              <td className="p-3">
                                  <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                                      app.status === 'Approved' ? 'bg-gradient-to-r from-[#DAFF7C]/20 to-[#DAFF7C]/10 text-[#DAFF7C] border border-[#DAFF7C]/30' :
                                      app.status === 'Rejected' ? 'bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-400 border border-red-500/30' :
                                      'bg-gradient-to-r from-[#9381FF]/20 to-[#9381FF]/10 text-[#9381FF] border border-[#9381FF]/30'
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
