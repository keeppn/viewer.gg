"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { applicationApi } from '@/lib/api/applications';
import Button from '@/components/common/Button';

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

interface Tournament {
  id: string;
  title: string;
  game: string;
  banner_url: string;
  form_fields: FormField[];
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.tournamentId as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discordIdError, setDiscordIdError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{[key: string]: string}>({
    streamerName: '',
    email: '',
    platform: 'Twitch',
    channelUrl: '',
    discordUsername: '',
    discordUserId: '',
  });

  useEffect(() => {
    async function fetchTournament() {
      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', tournamentId)
          .single();

        if (error) {
          console.error('Error fetching tournament:', error);
          setError('Tournament not found');
          setLoading(false);
          return;
        }

        setTournament(data);
        
        // Debug: Log the form fields to see what's being loaded
        console.log('Tournament loaded:', data);
        console.log('Form fields:', data.form_fields);
        
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Failed to load tournament');
        setLoading(false);
      }
    }

    if (tournamentId) {
      fetchTournament();
    }
  }, [tournamentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate Discord User ID format if it's being changed
    if (name === 'discordUserId') {
      if (value === '') {
        setDiscordIdError(null); // Optional field, empty is valid
      } else if (!/^\d{17,19}$/.test(value)) {
        setDiscordIdError('Discord User ID must be 17-19 digits (numbers only)');
      } else {
        setDiscordIdError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;

    // Validate Discord ID before submission if provided
    if (formData.discordUserId && !/^\d{17,19}$/.test(formData.discordUserId)) {
      setError('Please enter a valid Discord User ID (17-19 digits)');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Collect custom field data
      const customData: Record<string, any> = {};
      tournament.form_fields.forEach(field => {
        if (formData[field.id]) {
          customData[field.id] = formData[field.id];
        }
      });

      // Prepare streamer profile
      const streamerProfile = {
        name: formData.streamerName,
        platform: formData.platform as 'Twitch' | 'YouTube' | 'Kick',
        channel_url: formData.channelUrl,
        email: formData.email,
        discord_username: formData.discordUsername,
        discord_user_id: formData.discordUserId, // Required field
        avg_viewers: 0,
        follower_count: 0,
        primary_languages: ['English'],
      };

      console.log('[Application Form] Submitting with Discord User ID:', {
        discord_user_id: formData.discordUserId,
        streamerProfile,
      });

      // Submit application via API
      const result = await applicationApi.create({
        tournament_id: tournament.id,
        streamer: streamerProfile,
        custom_data: customData,
        status: 'Pending',
        availability_confirmed: false,
        submission_date: new Date().toISOString(),
      });

      console.log('[Application Form] Application created:', {
        id: result.id,
        streamer: result.streamer,
      });

      // Show success and redirect
      alert('Application submitted successfully! You will be notified via email.');
      router.push('/');
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#387B66] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-xl">Loading tournament...</div>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1E1E1E] p-8 rounded-lg border border-red-500/20">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error || 'Tournament not found'}</p>
          <Button variant="primary" onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] py-12 px-4">
      <div className="max-w-2xl mx-auto bg-[#1E1E1E] rounded-lg shadow-lg border border-white/10 overflow-hidden">
        {/* Tournament Header */}
        <img
          src={tournament.banner_url}
          alt={tournament.title}
          className="w-full h-48 object-cover"
        />

        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2 text-white">{tournament.title}</h1>
          <p className="text-lg text-gray-400 mb-8">{tournament.game}</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Standard Fields */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Your Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Streamer Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="streamerName"
                    value={formData.streamerName}
                    onChange={handleChange}
                    className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20 focus:border-[#387B66] focus:outline-none transition-colors"
                    required
                    placeholder="Your streaming name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20 focus:border-[#387B66] focus:outline-none transition-colors"
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Platform <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20 focus:border-[#387B66] focus:outline-none transition-colors"
                    required
                  >
                    <option value="Twitch">Twitch</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Kick">Kick</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Channel URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    name="channelUrl"
                    value={formData.channelUrl}
                    onChange={handleChange}
                    className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20 focus:border-[#387B66] focus:outline-none transition-colors"
                    required
                    placeholder="https://twitch.tv/yourname"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Discord Username
                  </label>
                  <input
                    type="text"
                    name="discordUsername"
                    value={formData.discordUsername}
                    onChange={handleChange}
                    className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20 focus:border-[#387B66] focus:outline-none transition-colors"
                    placeholder="username#0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Discord User ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="discordUserId"
                    value={formData.discordUserId}
                    onChange={handleChange}
                    className={`w-full bg-[#121212] text-white rounded-md p-3 border ${
                      discordIdError
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/20 focus:border-[#387B66]'
                    } focus:outline-none transition-colors`}
                    placeholder="123456789012345678"
                    pattern="\d{17,19}"
                    required
                  />
                  {discordIdError && (
                    <p className="text-red-400 text-sm mt-1">{discordIdError}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-2">
                    Your Discord User ID is a 17-19 digit number. To find it:
                    <br />
                    1. Open Discord and enable Developer Mode (User Settings → Advanced → Developer Mode)
                    <br />
                    2. Right-click your username and select &apos;Copy User ID&apos;
                    <br />
                    3. Paste the number here
                    <br />
                    <a 
                      href="https://support.discord.com/hc/en-us/articles/206346498" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#387B66] hover:text-[#2d6350] underline"
                    >
                      Learn more about finding your Discord ID →
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Fields */}
            {tournament.form_fields && tournament.form_fields.length > 0 && (
              <div className="pt-6 border-t border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Tournament Questions</h3>
                <div className="space-y-4">
                  {tournament.form_fields.map(field => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-400"> *</span>}
                      </label>
                      <input
                        type={field.type}
                        name={field.id}
                        onChange={handleChange}
                        className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20 focus:border-[#387B66] focus:outline-none transition-colors"
                        required={field.required}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                variant="primary"
                className="w-full text-lg py-3"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
