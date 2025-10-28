

import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Application } from '../types';
import Button from '../components/common/Button';

interface OutletContextType {
  applications: Application[];
  updateApplicationStatus: (id: number, status: 'Approved' | 'Rejected') => void;
}

type StatusFilter = 'All' | 'Pending' | 'Approved' | 'Rejected';

const Applications: React.FC = () => {
  const { applications, updateApplicationStatus } = useOutletContext<OutletContextType>();
  const [filter, setFilter] = useState<StatusFilter>('All');

  const filteredApplications = useMemo(() => {
    if (filter === 'All') return applications;
    return applications.filter(app => app.status === filter);
  }, [applications, filter]);

  const getStatusStyle = (status: Application['status']) => {
    switch (status) {
      case 'Approved': return 'bg-[#387B66] text-white';
      case 'Rejected': return 'bg-red-600 text-white';
      case 'Pending': return 'bg-[#FFCB82] text-black';
    }
  };

  return (
    <div className="bg-[#1E1E1E] rounded-lg shadow-sm border border-white/10">
      <div className="p-4 border-b border-white/20 flex items-center space-x-2">
        {(['All', 'Pending', 'Approved', 'Rejected'] as StatusFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              filter === f ? 'bg-[#387B66] text-white' : 'bg-transparent text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-gray-400 text-sm uppercase bg-black/20">
            <tr className="border-b border-white/20">
              <th className="p-4">Streamer</th>
              <th className="p-4">Followers</th>
              <th className="p-4">Tournament</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map(app => (
              <tr key={app.id} className="border-b border-white/10 hover:bg-black/20">
                <td className="p-4 font-medium text-white">{app.streamer.name}</td>
                <td className="p-4 text-gray-300">{app.streamer.followers.toLocaleString()}</td>
                <td className="p-4 text-gray-300">{app.tournament}</td>
                <td className="p-4 text-gray-400">{app.submissionDate}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="p-4">
                  {app.status === 'Pending' && (
                    <div className="flex justify-center items-center space-x-2">
                      <Button variant="success" onClick={() => updateApplicationStatus(app.id, 'Approved')} className="px-3 py-1 text-sm">Approve</Button>
                      <Button variant="danger" onClick={() => updateApplicationStatus(app.id, 'Rejected')} className="px-3 py-1 text-sm">Reject</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Applications;