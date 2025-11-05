"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
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
         <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative bg-gradient-to-br from-[#1E1E1E] to-[#161616] p-6 rounded-2xl shadow-xl border border-white/5 overflow-hidden"
         >
            {/* Glassmorphic overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <h3 className="relative text-xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Tournament Application Summary
            </h3>
            <div className="relative space-y-4 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#387B66]/30 scrollbar-track-transparent">
                {summaryData.map((t, index) => (
                    <motion.div 
                        key={t.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:border-[#387B66]/30 transition-all duration-300 hover:bg-black/30"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <p className="font-semibold text-white">{t.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{t.game}</p>
                            </div>
                            <span className="text-sm font-bold px-3 py-1 rounded-full bg-gradient-to-r from-[#FFCB82]/20 to-[#FFCB82]/10 text-[#FFCB82] border border-[#FFCB82]/20">
                                {t.total} Apps
                            </span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-2.5 flex overflow-hidden backdrop-blur-sm">
                           <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${t.approvedPercent}%` }}
                               transition={{ duration: 0.8, delay: 0.2 }}
                               className="bg-gradient-to-r from-[#387B66] to-[#4a9978] h-2.5" 
                               title={`Approved: ${t.approved}`}
                           />
                           <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${t.pendingPercent}%` }}
                               transition={{ duration: 0.8, delay: 0.3 }}
                               className="bg-gradient-to-r from-[#FFCB82] to-[#ffd79a] h-2.5" 
                               title={`Pending: ${t.pending}`}
                           />
                           <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${t.rejectedPercent}%` }}
                               transition={{ duration: 0.8, delay: 0.4 }}
                               className="bg-gradient-to-r from-red-500 to-red-400 h-2.5" 
                               title={`Rejected: ${t.rejected}`}
                           />
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}

const Overview: React.FC = () => {
  const { stats, applications = [], tournaments = [] } = useAppStore();
  
  const applicationStatusData = [
    { name: 'Pending', count: stats?.pending || 0, fill: '#FFCB82' },
    { name: 'Approved', count: stats?.approved || 0, fill: '#387B66' },
    { name: 'Rejected', count: stats?.rejected || 0, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Applications" value={stats?.totalApplications || 0} icon={<ApplicationIcon />} />
        <Card title="Approved" value={stats?.approved || 0} icon={<CheckCircleIcon />} />
        <Card title="Rejected" value={stats?.rejected || 0} icon={<XCircleIcon />} />
        <Card title="Pending" value={stats?.pending || 0} icon={<ClockIcon />} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 relative bg-gradient-to-br from-[#1E1E1E] to-[#161616] p-6 rounded-2xl shadow-xl border border-white/5 overflow-hidden"
        >
          {/* Glassmorphic overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
          
          <h3 className="relative text-xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Application Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={applicationStatusData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#387B66" stopOpacity={1} />
                  <stop offset="100%" stopColor="#387B66" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFCB82" stopOpacity={1} />
                  <stop offset="100%" stopColor="#FFCB82" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="rejectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
              <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(30, 30, 30, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}
                cursor={{ fill: 'rgba(56, 123, 102, 0.1)' }}
              />
              <Bar 
                dataKey="count" 
                barSize={50} 
                radius={[8, 8, 0, 0]}
                fill="url(#approvedGradient)"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
        <TournamentApplicationSummary tournaments={tournaments} applications={applications} />
      </div>
      
      {/* Recent Applications Table */}
       <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative bg-gradient-to-br from-[#1E1E1E] to-[#161616] p-6 rounded-2xl shadow-xl border border-white/5 overflow-hidden"
       >
          {/* Glassmorphic overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
          
          <h3 className="relative text-xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Recent Applications
          </h3>
          <div className="relative overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="border-b border-white/10 text-gray-400 uppercase text-xs tracking-wider">
                          <th className="p-4 font-semibold">Streamer</th>
                          <th className="p-4 font-semibold">Tournament</th>
                          <th className="p-4 font-semibold">Date</th>
                          <th className="p-4 font-semibold">Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      {applications.slice(0, 5).map((app, index) => (
                          <motion.tr 
                              key={app.id} 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-200"
                          >
                              <td className="p-4 font-medium text-white">{app.streamer.name}</td>
                              <td className="p-4 text-gray-300">{app.tournament?.title || 'Unknown'}</td>
                              <td className="p-4 text-gray-400 text-sm">{app.submission_date}</td>
                              <td className="p-4">
                                  <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-sm ${
                                      app.status === 'Approved' ? 'bg-[#387B66]/20 text-[#4a9978] border border-[#387B66]/30' :
                                      app.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                      'bg-[#FFCB82]/20 text-[#FFCB82] border border-[#FFCB82]/30'
                                  }`}>
                                      {app.status}
                                  </span>
                              </td>
                          </motion.tr>
                      ))}
                  </tbody>
              </table>
          </div>
       </motion.div>
    </div>
  );
};

export default Overview;
