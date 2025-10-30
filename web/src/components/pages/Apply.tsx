"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { useRouter, useParams } from 'next/navigation';
import { Tournament, Application } from '@/types';
import Button from '@/components/common/Button';

interface OutletContextType {
  tournaments: Tournament[];
  addApplication: (application: Omit<Application, 'id'>) => void;
}

const Apply: React.FC = () => {
  const { tournaments, addApplication } = useAppStore();
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const router = useRouter();
  const tournament = tournaments.find(t => t.id === (tournamentId || ''));

  const [formData, setFormData] = useState<{[key: string]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;

    const custom_data: Record<string, any> = {};
    
    // Populate custom_data from form fields
    tournament.form_fields.forEach(field => {
      if (formData[field.id]) {
        custom_data[field.id] = formData[field.id];
      }
    });

    const newApplication: Omit<Application, 'id' | 'created_at' | 'updated_at'> = {
      tournament_id: tournament.id,
      streamer: {
        name: formData.streamerName,
        platform: 'Twitch', // Default platform
        channel_url: '', // Would need to be collected from form
        email: formData.email || '',
        discord_username: '', // Would need to be collected from form
        avg_viewers: 0,
        follower_count: 0,
        primary_languages: ['English'],
      },
      status: 'Pending',
      submission_date: new Date().toISOString().split('T')[0],
      custom_data,
      availability_confirmed: false,
    };

    addApplication(newApplication);
    router.push('/dashboard/applications');
  };

  if (!tournament) {
    return <div>Tournament not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-[#1E1E1E] p-8 rounded-lg shadow-sm border border-white/10">
      <img src={tournament.banner_url} alt={tournament.title} className="w-full h-48 object-cover rounded-t-lg"/>
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-2 text-white">{tournament.title}</h2>
        <p className="text-lg text-gray-400 mb-6">{tournament.game}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Standard Fields */}
          <h3 className="text-xl font-semibold text-white border-t border-white/20 pt-6 mt-6">Your Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Streamer Name</label>
            <input type="text" name="streamerName" onChange={handleChange} className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input type="email" name="email" onChange={handleChange} className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20" required />
          </div>

          {/* Custom Fields */}
          {tournament.form_fields.length > 0 && (
            <h3 className="text-xl font-semibold text-white border-t border-white/20 pt-6 mt-6">Tournament Questions</h3>
          )}
          {tournament.form_fields.map(field => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-300 mb-1">{field.label}{field.required && '*'}</label>
              <input 
                type={field.type} 
                name={field.id} 
                onChange={handleChange} 
                className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20" 
                required={field.required} 
              />
            </div>
          ))}

          <div className="pt-6">
            <Button type="submit" variant="primary" className="w-full text-lg py-3">Submit Application</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Apply;
