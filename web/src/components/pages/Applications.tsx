"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { Application } from '@/types';
import Button from '@/components/common/Button';
import ErrorAlert from '@/components/common/ErrorAlert';

interface OutletContextType {
  applications: Application[];
  updateApplicationStatus: (id: number, status: 'Approved' | 'Rejected') => void;
}

type StatusFilter = 'All' | 'Pending' | 'Approved' | 'Rejected';

const Applications: React.FC = () => {
  const { applications, updateApplicationStatus, fetchApplications, error, clearError } = useAppStore();
  const { user, organization } = useAuthStore();
  const [filter, setFilter] = useState<StatusFilter>('All');

  // Fetch applications when component mounts or when organization changes
  useEffect(() => {
    if (organization?.id) {
      console.log('[Applications] Fetching applications for organization:', organization.id);
      fetchApplications(organization.id);
    }
  }, [organization?.id]); // Refetch when organization changes

  const filteredApplications = useMemo(() => {
    if (filter === 'All') return applications;
    return applications.filter(app => app.status === filter);
  }, [applications, filter]);

  const getStatusStyle = (status: Application['status']) => {
    switch (status) {
      case 'Approved': return 'bg-[#DAFF7C]/10 text-[#DAFF7C] border border-[#DAFF7C]/20';
      case 'Rejected': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'Pending': return 'bg-[#9381FF]/10 text-[#9381FF] border border-[#9381FF]/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      <ErrorAlert error={error} onDismiss={clearError} />

      <div className="bg-[#2A2A2A] rounded-[10px] border border-white/10">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
        {(['All', 'Pending', 'Approved', 'Rejected'] as StatusFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-semibold rounded-[10px] transition-all duration-200 ${
              filter === f
                ? 'bg-[#DAFF7C] text-[#1F1F1F]'
                : 'bg-transparent text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-white/70 text-sm uppercase bg-[#1F1F1F]">
            <tr className="border-b border-white/10">
              <th className="p-4 font-semibold">Streamer</th>
              <th className="p-4 font-semibold">Followers</th>
              <th className="p-4 font-semibold">Tournament</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map(app => (
              <tr key={app.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                <td className="p-4 font-medium text-white">{app.streamer.name}</td>
                <td className="p-4 text-white/70">{app.streamer.follower_count.toLocaleString()}</td>
                <td className="p-4 text-white/70">{app.tournament?.title || 'N/A'}</td>
                <td className="p-4 text-white/70">{new Date(app.submission_date).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusStyle(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="p-4">
                  {app.status === 'Pending' && (
                    <div className="flex justify-center items-center gap-2">
                      <Button variant="success" onClick={() => updateApplicationStatus(app.id, 'Approved', user?.id || '')} className="px-3 py-1 text-sm">Approve</Button>
                      <Button variant="danger" onClick={() => updateApplicationStatus(app.id, 'Rejected', user?.id || '')} className="px-3 py-1 text-sm">Reject</Button>
                    </div>
                  )}
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

export default Applications;
