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

// Helper function to render form field based on type
const renderFormField = (field: FormField, value: any, onChange: (value: any) => void, error?: string) => {
  const baseInputClass = `w-full bg-white/5 text-white rounded-lg p-3 border ${
    error ? 'border-red-500/50' : 'border-white/20'
  } focus:border-[#9381FF] focus:ring-2 focus:ring-[#9381FF]/20 outline-none transition-all`;

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInputClass} resize-none`}
          rows={4}
          placeholder={field.description || 'Your answer...'}
          required={field.required}
        />
      );

    case 'select':
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
          required={field.required}
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
            <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={(e) => onChange(e.target.value)}
                className="w-4 h-4 text-[#9381FF] border-white/20 focus:ring-[#9381FF]"
                required={field.required}
              />
              <span className="text-white/80">{opt}</span>
            </label>
          ))}
        </div>
      );

    case 'checkbox':
      return (
        <div className="space-y-2">
          {field.options?.map((opt, i) => (
            <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(opt)}
                onChange={(e) => {
                  const newValue = Array.isArray(value) ? [...value] : [];
                  if (e.target.checked) {
                    onChange([...newValue, opt]);
                  } else {
                    onChange(newValue.filter(v => v !== opt));
                  }
                }}
                className="w-4 h-4 text-[#9381FF] border-white/20 rounded focus:ring-[#9381FF]"
              />
              <span className="text-white/80">{opt}</span>
            </label>
          ))}
        </div>
      );

    default:
      return (
        <input
          type={field.type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
          placeholder={field.description || 'Your answer...'}
          required={field.required}
          pattern={field.validation?.pattern}
          min={field.validation?.min}
          max={field.validation?.max}
        />
      );
  }
};

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.tournamentId as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{[key: string]: any}>({});
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

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

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error for this field
    if (fieldErrors[fieldId]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      // Extract system fields from form data
      const streamerName = formData['system_streamer_name'] || formData['streamer_name'] || '';
      const email = formData['system_email'] || formData['email'] || '';
      const platform = formData['system_platform'] || formData['platform'] || 'Twitch';
      const channelUrl = formData['system_channel_url'] || formData['channel_url'] || '';
      const discordUsername = formData['system_discord_username'] || formData['discord_username'] || '';
      const discordUserId = formData['system_discord_user_id'] || formData['discord_user_id'] || '';

      // Validate required system fields
      if (!streamerName || !email || !platform || !channelUrl) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      // Prepare custom data (exclude system fields)
      const customData: Record<string, any> = {};
      Object.keys(formData).forEach(key => {
        if (!key.startsWith('system_')) {
          customData[key] = formData[key];
        }
      });

      // Add Discord User ID to custom_data for role assignment
      if (discordUserId) {
        customData.discord_user_id = discordUserId;
      }

      // Prepare streamer profile
      const streamerProfile = {
        name: streamerName,
        platform: platform as 'Twitch' | 'YouTube' | 'Kick',
        channel_url: channelUrl,
        email: email,
        discord_username: discordUsername,
        discord_user_id: discordUserId || undefined,
        avg_viewers: 0,
        follower_count: 0,
        primary_languages: ['English'],
      };

      // Submit application via API
      await applicationApi.create({
        tournament_id: tournament.id,
        streamer: streamerProfile,
        custom_data: customData,
        status: 'Pending',
        availability_confirmed: false,
        submission_date: new Date().toISOString(),
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
          <div className="inline-block w-12 h-12 border-4 border-[#9381FF] border-t-transparent rounded-full animate-spin mb-4"></div>
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

  const primaryColor = tournament.form_primary_color || '#9381FF';

  return (
    <div className="min-h-screen bg-[#121212] py-12 px-4">
      <div className="max-w-2xl mx-auto bg-[#1E1E1E] rounded-lg shadow-lg border border-white/10 overflow-hidden">
        {/* Header Image */}
        {tournament.form_header_image && (
          <img
            src={tournament.form_header_image}
            alt={tournament.title}
            className="w-full h-48 object-cover"
          />
        )}

        <div className="p-8">
          {/* Tournament Title */}
          <h1 className="text-3xl font-bold mb-2 text-white">{tournament.title}</h1>
          <p className="text-lg text-gray-400 mb-2">{tournament.game}</p>

          {/* Form Description */}
          {tournament.form_description && (
            <p className="text-white/70 mb-8">{tournament.form_description}</p>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Render all form fields */}
            {tournament.form_fields && tournament.form_fields.length > 0 ? (
              tournament.form_fields.map((field, index) => (
                <div key={field.id || index}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {field.description && !['text', 'email', 'url', 'number', 'phone'].includes(field.type) && (
                    <p className="text-sm text-gray-400 mb-2">{field.description}</p>
                  )}
                  {renderFormField(
                    field,
                    formData[field.id],
                    (value) => handleFieldChange(field.id, value),
                    fieldErrors[field.id]
                  )}
                  {fieldErrors[field.id] && (
                    <p className="text-red-400 text-sm mt-1">{fieldErrors[field.id]}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-white/60">No form fields available. Please contact the tournament organizer.</p>
              </div>
            )}

            {/* Submit Button */}
            {tournament.form_fields && tournament.form_fields.length > 0 && (
              <div className="pt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-lg py-3"
                  style={{ backgroundColor: primaryColor }}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : (tournament.form_button_text || 'Submit Application')}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
