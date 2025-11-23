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

// Application Review Modal Component
const ApplicationReviewModal: React.FC<{
  application: Application;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'Approved' | 'Rejected', userId: string) => void;
  userId: string;
}> = ({ application, onClose, onUpdateStatus, userId }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-[#1F1F1F] to-[#2A2A2A] rounded-xl border border-white/10 max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-[#9381FF]/10 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                {application.streamer.name}
                <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${
                  application.status === 'Approved' ? 'bg-[#DAFF7C]/10 text-[#DAFF7C] border border-[#DAFF7C]/20' :
                  application.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  'bg-[#9381FF]/10 text-[#9381FF] border border-[#9381FF]/20'
                }`}>
                  {application.status}
                </span>
              </h2>
              <p className="text-white/60 mt-1">
                {application.tournament?.title || 'N/A'} • Submitted {new Date(application.submission_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-thin">
          <div className="space-y-6">
            {/* Streamer Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9381FF]" />
                Streamer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-white/50 mb-1">Platform</p>
                  <p className="text-white font-medium">{application.streamer.platform}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-white/50 mb-1">Email</p>
                  <p className="text-white font-medium">{application.streamer.email}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-white/50 mb-1">Channel URL</p>
                  <a href={application.streamer.channel_url} target="_blank" rel="noopener noreferrer" className="text-[#9381FF] hover:text-[#DAFF7C] transition-colors truncate block">
                    {application.streamer.channel_url}
                  </a>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-white/50 mb-1">Followers</p>
                  <p className="text-white font-medium">{application.streamer.follower_count.toLocaleString()}</p>
                </div>
                {application.streamer.discord_username && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-white/50 mb-1">Discord</p>
                    <p className="text-white font-medium">{application.streamer.discord_username}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Questions & Answers */}
            {application.custom_data && Object.keys(application.custom_data).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DAFF7C]" />
                  Tournament Questions & Answers
                </h3>
                <div className="space-y-4">
                  {Object.entries(application.custom_data).map(([key, value]) => {
                    // Skip discord_user_id as it's already shown above
                    if (key === 'discord_user_id' || key === 'discordUserId') return null;

                    // Try to find the field label from the tournament's form fields
                    const fieldLabel = application.tournament?.form_fields?.find(f => f.id === key)?.label || key;

                    return (
                      <div key={key} className="bg-gradient-to-br from-white/5 to-transparent rounded-lg p-4 border border-white/10">
                        <p className="text-sm font-medium text-white/70 mb-2">{fieldLabel}</p>
                        <p className="text-white">{String(value)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes (if any) */}
            {application.notes && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#fd934e]" />
                  Review Notes
                </h3>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white/80">{application.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {application.status === 'Pending' && (
          <div className="p-6 border-t border-white/10 bg-gradient-to-r from-[#9381FF]/5 to-transparent">
            <div className="flex items-center gap-3 justify-end">
              <Button variant="danger" onClick={() => {
                onUpdateStatus(application.id, 'Rejected', userId);
                onClose();
              }}>
                Reject Application
              </Button>
              <Button variant="success" onClick={() => {
                onUpdateStatus(application.id, 'Approved', userId);
                onClose();
              }}>
                Approve Application
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Applications: React.FC = () => {
  const { applications, updateApplicationStatus, fetchApplications, error, clearError } = useAppStore();
  const { user, organization } = useAuthStore();
  const [filter, setFilter] = useState<StatusFilter>('All');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

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
    <>
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
              <tr
                key={app.id}
                onClick={() => setSelectedApplication(app)}
                className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200 cursor-pointer"
              >
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
                    <div className="flex justify-center items-center gap-2" onClick={(e) => e.stopPropagation()}>
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

    {/* Application Review Modal */}
    {selectedApplication && (
      <ApplicationReviewModal
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onUpdateStatus={updateApplicationStatus}
        userId={user?.id || ''}
      />
    )}
    </>
  );
};

export default Applications;
