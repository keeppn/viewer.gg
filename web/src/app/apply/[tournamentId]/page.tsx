"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { applicationApi } from '@/lib/api/applications';
import Button from '@/components/common/Button';
import { FormField } from '@/types';

interface Tournament {
  id: string;
  title: string;
  game: string;
  banner_url: string;
  form_fields: FormField[];
  form_header_image?: string;
  form_description?: string;
  form_primary_color?: string;
  form_button_text?: string;
}

// Platform options
const PLATFORMS = ['Twitch', 'YouTube', 'Kick'] as const;

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.tournamentId as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // System fields (required base fields)
  const [streamerName, setStreamerName] = useState('');
  const [email, setEmail] = useState('');
  const [platform, setPlatform] = useState<string>('Twitch');
  const [channelUrl, setChannelUrl] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [discordUserId, setDiscordUserId] = useState('');

  // Custom fields data
  const [customData, setCustomData] = useState<Record<string, any>>({});

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

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCustomData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;

    // Validate required system fields
    if (!streamerName.trim()) {
      setError('Streamer name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!channelUrl.trim()) {
      setError('Channel URL is required');
      return;
    }
    if (!discordUserId.trim()) {
      setError('Discord User ID is required for role assignment');
      return;
    }

    // Validate custom required fields
    if (tournament.form_fields) {
      for (const field of tournament.form_fields) {
        if (field.required && !customData[field.id]) {
          setError(`Please fill in: ${field.label}`);
          return;
        }
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      // Prepare streamer profile
      const streamerProfile = {
        name: streamerName.trim(),
        platform: platform as 'Twitch' | 'YouTube' | 'Kick',
        channel_url: channelUrl.trim(),
        email: email.trim(),
        discord_username: discordUsername.trim(),
        avg_viewers: 0,
        follower_count: 0,
        primary_languages: ['English'],
      };

      // Add Discord User ID to custom_data for role assignment
      const applicationCustomData = {
        ...customData,
        discord_user_id: discordUserId.trim(),
      };

      // Submit application via API
      await applicationApi.create({
        tournament_id: tournament.id,
        streamer: streamerProfile,
        custom_data: applicationCustomData,
        status: 'Pending',
        availability_confirmed: true,
        submission_date: new Date().toISOString(),
      });

      setSuccess(true);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render custom form field based on type
  const renderCustomField = (field: FormField) => {
    const value = customData[field.id] || '';
    const inputClass = "w-full bg-white/5 text-white rounded-lg p-3 border border-white/20 focus:border-[#9381FF] focus:ring-2 focus:ring-[#9381FF]/20 outline-none transition-all";

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            className={`${inputClass} resize-none`}
            rows={4}
            placeholder={field.placeholder || 'Your answer...'}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            className={inputClass}
          >
            <option value="">Choose an option...</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                  className="w-4 h-4 text-[#9381FF]"
                />
                <span className="text-white/80">{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((opt, i) => {
              const checkedValues = Array.isArray(value) ? value : [];
              return (
                <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedValues.includes(opt)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleCustomFieldChange(field.id, [...checkedValues, opt]);
                      } else {
                        handleCustomFieldChange(field.id, checkedValues.filter((v: string) => v !== opt));
                      }
                    }}
                    className="w-4 h-4 text-[#9381FF] rounded"
                  />
                  <span className="text-white/80">{opt}</span>
                </label>
              );
            })}
          </div>
        );

      default:
        return (
          <input
            type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            className={inputClass}
            placeholder={field.placeholder || 'Your answer...'}
          />
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#9381FF] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-xl">Loading tournament...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (!tournament) {
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

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1E1E1E] p-8 rounded-lg border border-green-500/20 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-500 mb-2">Application Submitted!</h2>
          <p className="text-gray-300 mb-6">
            Thank you for applying to {tournament.title}. You will be notified of the decision via Discord.
          </p>
          <Button variant="primary" onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const primaryColor = tournament.form_primary_color || '#9381FF';
  const inputClass = "w-full bg-white/5 text-white rounded-lg p-3 border border-white/20 focus:border-[#9381FF] focus:ring-2 focus:ring-[#9381FF]/20 outline-none transition-all";

  return (
    <div className="min-h-screen bg-[#121212] py-8 px-4">
      <div className="max-w-2xl mx-auto bg-[#1E1E1E] rounded-xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        {tournament.banner_url && (
          <img src={tournament.banner_url} alt={tournament.title} className="w-full h-48 object-cover" />
        )}

        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2 text-white">{tournament.title}</h1>
          <p className="text-lg text-[#9381FF] mb-2">{tournament.game}</p>
          {tournament.form_description && (
            <p className="text-white/70 mb-6">{tournament.form_description}</p>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required System Fields Section */}
            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#9381FF] rounded-full"></span>
                Basic Information
              </h2>
              
              <div className="space-y-4">
                {/* Streamer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Streamer Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={streamerName}
                    onChange={(e) => setStreamerName(e.target.value)}
                    className={inputClass}
                    placeholder="Your streamer/channel name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Streaming Platform <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className={inputClass}
                    required
                  >
                    {PLATFORMS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Channel URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Channel URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    className={inputClass}
                    placeholder="https://twitch.tv/yourchannel"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Discord Information Section */}
            <div className="bg-[#5865F2]/10 p-6 rounded-lg border border-[#5865F2]/20">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Discord Information
              </h2>
              
              <div className="space-y-4">
                {/* Discord Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Discord Username
                  </label>
                  <input
                    type="text"
                    value={discordUsername}
                    onChange={(e) => setDiscordUsername(e.target.value)}
                    className={inputClass}
                    placeholder="username#1234 or just username"
                  />
                </div>

                {/* Discord User ID - REQUIRED for role assignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Discord User ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={discordUserId}
                    onChange={(e) => setDiscordUserId(e.target.value)}
                    className={inputClass}
                    placeholder="e.g., 123456789012345678"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    💡 To find your Discord User ID: Enable Developer Mode in Discord Settings → App Settings → Advanced, 
                    then right-click your name and select &quot;Copy User ID&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Fields Section */}
            {tournament.form_fields && tournament.form_fields.length > 0 && (
              <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#DAFF7C] rounded-full"></span>
                  Additional Questions
                </h2>
                
                <div className="space-y-4">
                  {tournament.form_fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      {field.description && (
                        <p className="text-xs text-gray-400 mb-2">{field.description}</p>
                      )}
                      {renderCustomField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full text-lg py-3 font-semibold"
              style={{ backgroundColor: primaryColor }}
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Submitting...
                </span>
              ) : (tournament.form_button_text || 'Submit Application')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
