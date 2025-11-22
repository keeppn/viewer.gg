"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { Application } from '@/types';
import Button from '@/components/common/Button';
import ErrorAlert from '@/components/common/ErrorAlert';
import { motion, staggerContainer, fadeInUp } from '@/animations';

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
      case 'Approved': return 'bg-[var(--semantic-success)]/10 text-[var(--semantic-success)] border border-[var(--semantic-success)]/30';
      case 'Rejected': return 'bg-[var(--semantic-error)]/10 text-[var(--semantic-error)] border border-[var(--semantic-error)]/30';
      case 'Pending': return 'bg-[var(--base)]/10 text-[var(--base)] border border-[var(--base)]/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      <ErrorAlert error={error} onDismiss={clearError} />

      {/* Description */}
      <p className="text-sm text-white/60">Review and manage streamer applications for your tournaments</p>

      <motion.div
        className="bg-[var(--neutral-2-surface)] rounded-2xl border border-[var(--neutral-border)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        {/* Filter Tabs - 8pt spacing */}
        <div className="p-6 border-b border-[var(--neutral-border)] flex items-center gap-2">
        {(['All', 'Pending', 'Approved', 'Rejected'] as StatusFilter[]).map((f, idx) => (
          <motion.button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              filter === f
                ? 'bg-[var(--base)] text-white shadow-lg shadow-[var(--base)]/20'
                : 'bg-transparent text-white/70 hover:bg-white/5 hover:text-white'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            {f}
          </motion.button>
        ))}
      </div>

      {/* Table - Premium styling with animations */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-white/70 text-xs uppercase bg-[var(--neutral-1-bg)]">
            <tr className="border-b border-[var(--neutral-border)]">
              <th className="p-4 font-semibold">Streamer</th>
              <th className="p-4 font-semibold">Followers</th>
              <th className="p-4 font-semibold">Tournament</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <motion.tbody
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filteredApplications.map(app => (
              <motion.tr
                key={app.id}
                className="border-b border-white/5 hover:bg-[var(--base-dim)] transition-colors duration-200"
                variants={fadeInUp}
              >
                <td className="p-4 font-medium text-white">{app.streamer.name}</td>
                <td className="p-4 text-white/70">{app.streamer.follower_count.toLocaleString()}</td>
                <td className="p-4 text-white/70">{app.tournament?.title || 'N/A'}</td>
                <td className="p-4 text-white/60 text-sm">{new Date(app.submission_date).toLocaleDateString()}</td>
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
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
    </div>
  );
};

export default Applications;
