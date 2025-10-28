import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import Card from '../components/common/Card';
import { Application, Stats, Tournament } from '../types';
import { ApplicationIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '../components/icons/Icons';

interface OutletContextType {
  stats: Stats;
  applications: Application[];
  tournaments: Tournament[];
}

const TournamentApplicationSummary: React.FC<{ tournaments: Tournament[], applications: Application[] }> = ({ tournaments, applications }) => {
    const summaryData = useMemo(() => {
        return tournaments.map(tournament => {
            const relevantApps = applications.filter(app => app.tournament === tournament.title);
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
         <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-sm border border-white/10">
            <h3 className="text-xl font-bold mb-4 text-white">Tournament Application Summary</h3>
            <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2">
                {summaryData.map(t => (
                    <div key={t.id} className="bg-black/20 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <p className="font-semibold text-white">{t.title}</p>
                                <p className="text-sm text-gray-400">{t.game}</p>
                            </div>
                            <span className="text-sm font-bold text-[#FFCB82]">{t.total} Apps</span>
                        </div>
                        <div className="w-full bg-black/30 rounded-full h-2 flex overflow-hidden">
                           <div className="bg-[#387B66] h-2" style={{ width: `${t.approvedPercent}%` }} title={`Approved: ${t.approved}`}></div>
                           <div className="bg-[#FFCB82] h-2" style={{ width: `${t.pendingPercent}%` }} title={`Pending: ${t.pending}`}></div>
                           <div className="bg-red-500 h-2" style={{ width: `${t.rejectedPercent}%` }} title={`Rejected: ${t.rejected}`}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const Overview: React.FC = () => {
  const { stats, applications, tournaments } = useOutletContext<OutletContextType>();
  const applicationStatusData = [
    { name: 'Pending', count: stats.pending, fill: '#FFCB82' },
    { name: 'Approved', count: stats.approved, fill: '#387B66' },
    { name: 'Rejected', count: stats.rejected, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Applications" value={stats.totalApplications} icon={<ApplicationIcon />} />
        <Card title="Approved" value={stats.approved} icon={<CheckCircleIcon />} />
        <Card title="Rejected" value={stats.rejected} icon={<XCircleIcon />} />
        <Card title="Pending" value={stats.pending} icon={<ClockIcon />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#1E1E1E] p-6 rounded-lg shadow-sm border border-white/10">
          <h3 className="text-xl font-bold mb-4 text-white">Application Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={applicationStatusData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#A4A6B3" />
              <YAxis stroke="#A4A6B3" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }}
                cursor={{ fill: 'rgba(56, 123, 102, 0.1)' }}
              />
              <Bar dataKey="count" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
       <TournamentApplicationSummary tournaments={tournaments} applications={applications} />
      </div>
      
       <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-sm border border-white/10">
          <h3 className="text-xl font-bold mb-4 text-white">Recent Applications</h3>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="border-b border-white/20 text-gray-400 uppercase text-xs">
                          <th className="p-3">Streamer</th>
                          <th className="p-3">Tournament</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      {applications.slice(0, 5).map(app => (
                          <tr key={app.id} className="border-b border-white/10 hover:bg-black/20">
                              <td className="p-3 font-medium text-white">{app.streamer.name}</td>
                              <td className="p-3 text-gray-300">{app.tournament}</td>
                              <td className="p-3 text-gray-400">{app.submissionDate}</td>
                              <td className="p-3">
                                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                      app.status === 'Approved' ? 'bg-[#387B66] text-white' :
                                      app.status === 'Rejected' ? 'bg-red-600 text-white' :
                                      'bg-[#FFCB82] text-black'
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