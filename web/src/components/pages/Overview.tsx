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
        <div className="bg-[var(--neutral-2-surface)] p-6 rounded-2xl border border-[var(--neutral-border)] h-full">
            <h3 className="text-lg font-semibold mb-4 text-white">
                Tournament Summary
            </h3>
            <div className="space-y-3 max-h-[240px] overflow-y-auto scrollbar-thin">
                {summaryData.map((t) => (
                    <div
                        key={t.id}
                        className="bg-[var(--neutral-1-bg)] p-4 rounded-xl border border-[var(--neutral-border)] hover:border-white/20 transition-all duration-200"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex-1">
                                <p className="font-semibold text-white text-sm truncate">{t.title}</p>
                                <p className="text-xs text-white/60 mt-0.5">{t.game}</p>
                            </div>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white/90 border border-white/20">
                                {t.total} Apps
                            </span>
                        </div>
                        <div className="w-full bg-[#1A1A1A] rounded-full h-2 flex overflow-hidden">
                           <div
                               className="bg-[var(--semantic-success)] h-2"
                               style={{ width: `${t.approvedPercent}%` }}
                               title={`Approved: ${t.approved}`}
                           />
                           <div
                               className="bg-[var(--base)] h-2"
                               style={{ width: `${t.pendingPercent}%` }}
                               title={`Pending: ${t.pending}`}
                           />
                           <div
                               className="bg-[var(--semantic-error)] h-2"
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
    { name: 'Pending', count: stats?.pending || 0, fill: 'var(--base)' },
    { name: 'Approved', count: stats?.approved || 0, fill: 'var(--semantic-success)' },
    { name: 'Rejected', count: stats?.rejected || 0, fill: 'var(--semantic-error)' },
  ];

  return (
    <div className="space-y-6">
      {/* Compact description */}
      <p className="text-sm text-white/60">Quick overview of your tournament applications and status</p>

      {/* Compact Stats Cards - 8pt spacing */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card title="Applications" value={stats?.totalApplications || 0} icon={<ApplicationIcon />} accentColor="neutral" />
        <Card title="Approved" value={stats?.approved || 0} icon={<CheckCircleIcon />} accentColor="success" />
        <Card title="Pending" value={stats?.pending || 0} icon={<ClockIcon />} accentColor="purple" />
        <Card title="Rejected" value={stats?.rejected || 0} icon={<XCircleIcon />} accentColor="error" />
      </div>

      {/* Charts Section - 8pt spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-[var(--neutral-2-surface)] p-6 rounded-2xl border border-[var(--neutral-border)]">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Application Status
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={applicationStatusData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--neutral-1-bg)',
                  border: '1px solid var(--neutral-border)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#fff',
                  fontWeight: 600
                }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                labelStyle={{ color: '#fff', fontWeight: 700 }}
              />
              <Bar
                dataKey="count"
                barSize={45}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2">
          <TournamentApplicationSummary tournaments={tournaments} applications={applications} />
        </div>
      </div>

      {/* Recent Applications Table - 8pt spacing */}
      <div className="bg-[var(--neutral-2-surface)] p-6 rounded-2xl border border-[var(--neutral-border)]">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Recent Applications
          </h3>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="border-b border-[var(--neutral-border)] text-white/60 uppercase text-xs tracking-wide">
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
                              className="border-b border-white/5 hover:bg-white/5 transition-all duration-200"
                          >
                              <td className="p-3 font-medium text-white text-sm">{app.streamer.name}</td>
                              <td className="p-3 text-white/70 text-sm">{app.tournament?.title || 'Unknown'}</td>
                              <td className="p-3 text-white/60 text-xs hidden sm:table-cell">{app.submission_date}</td>
                              <td className="p-3">
                                  <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                                      app.status === 'Approved' ? 'bg-[var(--semantic-success)]/10 text-[var(--semantic-success)] border border-[var(--semantic-success)]/30' :
                                      app.status === 'Rejected' ? 'bg-[var(--semantic-error)]/10 text-[var(--semantic-error)] border border-[var(--semantic-error)]/30' :
                                      'bg-[var(--base)]/10 text-[var(--base)] border border-[var(--base)]/30'
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
