"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/common/Button';
import { Tournament } from '@/types';
import { useRouter } from 'next/navigation';

const NewTournament: React.FC = () => {
  const { addTournament } = useAppStore();
  const { organization } = useAuthStore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    game: '',
    date: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.game || !formData.date) {
      setError('Please fill in all fields');
      return;
    }

    if (!organization) {
      setError('No organization found. Please refresh the page and try again.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const banner_url = `https://picsum.photos/seed/${formData.game.replace(/\s/g, '-')}${Date.now()}/800/200`;

      const newTournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at' | 'application_count'> = {
        title: formData.title,
        game: formData.game,
        start_date: formData.date,
        end_date: formData.date, // Using same date for now
        banner_url,
        organization_id: organization.id, // Use real organization ID
        form_fields: [],
        custom_fields: [],
        status: 'draft',
      };

      await addTournament(newTournament);
      router.push('/dashboard/tournaments');
    } catch (err: any) {
      console.error('Error creating tournament:', err);
      setError(err.message || 'Failed to create tournament');
      setSubmitting(false);
    }
  };

  if (!organization) {
    return (
      <div className="max-w-2xl mx-auto bg-[#1E1E1E] p-8 rounded-lg shadow-sm border border-red-500/20">
        <h2 className="text-2xl font-bold mb-4 text-red-500">Error</h2>
        <p className="text-gray-300 mb-4">No organization found. Please make sure you're logged in.</p>
        <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-[#1E1E1E] p-8 rounded-lg shadow-sm border border-white/10">
      <h2 className="text-2xl font-bold mb-6 text-white">Create New Tournament</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Tournament Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20 focus:ring-2 focus:ring-[#387B66] focus:border-[#387B66] outline-none"
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="game" className="block text-sm font-medium text-gray-300 mb-1">Game</label>
          <input
            type="text"
            id="game"
            name="game"
            value={formData.game}
            onChange={handleChange}
            className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20 focus:ring-2 focus:ring-[#387B66] focus:border-[#387B66] outline-none"
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20 focus:ring-2 focus:ring-[#387B66] focus:border-[#387B66] outline-none"
            required
            disabled={submitting}
          />
        </div>
        <div className="flex justify-end pt-4 space-x-2">
          <Button type="button" variant="secondary" onClick={() => router.push('/dashboard/tournaments')} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Tournament'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewTournament;
