"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/common/Button';
import { DiscordConfig } from '@/types';

const Settings: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Get organization from auth store instead of fetching again
    const { user, organization } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [discordConfig, setDiscordConfig] = useState<DiscordConfig | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const initializePage = async () => {
            if (!isMounted) return;

            // Check URL params for success/error messages
            const success = searchParams.get('success');
            const errorParam = searchParams.get('error');

            if (success === 'bot_connected') {
                setSuccessMessage('Discord bot connected successfully!');
            }
            if (errorParam) {
                setError(`Discord connection error: ${errorParam}`);
            }

            // Clear URL params
            if (success || errorParam) {
                window.history.replaceState({}, '', '/dashboard/settings');
            }

            // Load Discord config if organization exists
            if (organization) {
                await loadDiscordConfig(organization.id);
            }

            if (isMounted) {
                setLoading(false);
            }
        };

        initializePage();

        return () => {
            isMounted = false;
        };
    }, [organization, searchParams]);

    const loadDiscordConfig = async (orgId: string) => {
        try {
            const { data: config, error } = await supabase
                .from('discord_configs')
                .select('*')
                .eq('organization_id', orgId)
                .maybeSingle();

            if (error) {
                console.error('[Settings] Error querying discord_configs:', error);
            }

            setDiscordConfig(config);
        } catch (err: any) {
            console.error('[Settings] Exception loading Discord config:', err);
        }
    };

    const handleConnectBot = () => {
        if (!organization) return;

        const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || process.env.NEXT_PUBLIC_DISCORD_BOT_CLIENT_ID;
        const redirectUri = `${window.location.origin}/api/discord/bot-callback`;
        const permissions = '268435456';
        const state = btoa(JSON.stringify({ org_id: organization.id }));
        const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=bot&state=${encodeURIComponent(state)}`;

        window.location.href = discordAuthUrl;
    };

    const handleDisconnectBot = async () => {
        if (!discordConfig || !organization) return;

        const confirmed = confirm('Are you sure you want to disconnect the Discord bot?');
        if (!confirmed) return;

        try {
            const response = await fetch('/api/discord/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organizationId: organization.id }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to disconnect bot');
            }

            setDiscordConfig(null);
            setSuccessMessage('Discord bot disconnected successfully');
        } catch (err: any) {
            setError('Failed to disconnect bot: ' + err.message);
        }
    };

    const handleUpdateRoleName = async (roleName: string) => {
        if (!discordConfig || !organization) return;

        try {
            const { error } = await supabase
                .from('discord_configs')
                .update({ role_name: roleName })
                .eq('organization_id', organization.id);

            if (error) throw error;
            setDiscordConfig({ ...discordConfig, role_name: roleName });
        } catch (err: any) {
            setError('Failed to update role name: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="text-center py-12">
                    <div className="inline-block w-12 h-12 border-4 border-[#387B66] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 mt-4">Loading settings...</p>
                </div>
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                    <h2 className="text-red-400 font-bold text-lg mb-2">No Organization Found</h2>
                    <p className="text-red-300 mb-4">
                        {error || 'Unable to load your organization.'}
                    </p>
                    <div className="flex gap-4">
                        <Button variant="primary" onClick={() => window.location.reload()}>
                            Retry Loading
                        </Button>
                        <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-green-400">{successMessage}</p>
                    <button onClick={() => setSuccessMessage(null)} className="text-green-300 text-sm underline mt-2">
                        Dismiss
                    </button>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-400">{error}</p>
                    <button onClick={() => setError(null)} className="text-red-300 text-sm underline mt-2">
                        Dismiss
                    </button>
                </div>
            )}

            {/* Discord Integration */}
            <div className="bg-[#1E1E1E] p-8 rounded-lg shadow-sm border border-white/10">
                <h2 className="text-2xl font-bold mb-1 text-white">Discord Bot Integration</h2>
                <p className="text-gray-400 mb-6">
                    Connect the viewer.gg bot to your Discord server to automate role assignments.
                </p>

                {discordConfig && discordConfig.is_connected ? (
                    <div className="space-y-4">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-400 font-semibold mb-1">✓ Bot Connected</p>
                                    <p className="text-gray-400 text-sm">Server: {discordConfig.guild_name}</p>
                                    <p className="text-gray-400 text-xs mt-2">
                                        Connected: {new Date(discordConfig.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <Button variant="danger" onClick={handleDisconnectBot}>
                                    Disconnect
                                </Button>
                            </div>

                            <div className="mt-4 bg-[#1A1A1A] p-4 rounded-lg border border-white/10">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Discord Role Name
                                </label>
                                <input
                                    type="text"
                                    value={discordConfig.role_name || 'Approved Co-Streamer'}
                                    onChange={(e) => handleUpdateRoleName(e.target.value)}
                                    placeholder="e.g., Approved Co-Streamer"
                                    className="w-full px-4 py-2 bg-[#121212] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#387B66]"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-gray-800/50 border border-white/10 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-2">What happens when you connect:</h3>
                            <ul className="text-gray-400 text-sm space-y-1 ml-4 list-decimal">
                                <li>You&apos;ll be redirected to Discord</li>
                                <li>Select which server to add the bot to</li>
                                <li>Grant the bot permission to manage roles</li>
                                <li>Bot will be added to your server automatically</li>
                            </ul>
                        </div>

                        <Button onClick={handleConnectBot} variant="primary" className="w-full">
                            Connect Discord Bot
                        </Button>
                    </div>
                )}
            </div>

            {/* Organization Settings */}
            <div className="bg-[#1E1E1E] p-8 rounded-lg shadow-sm border border-white/10">
                <h2 className="text-2xl font-bold mb-4 text-white">Organization Settings</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Organization Name</label>
                        <input 
                            type="text" 
                            value={organization.name} 
                            disabled 
                            className="w-full bg-black/20 text-gray-400 rounded-md p-3 border border-white/20 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Organization ID</label>
                        <input 
                            type="text" 
                            value={organization.id} 
                            disabled 
                            className="w-full bg-black/20 text-gray-400 rounded-md p-3 border border-white/20 cursor-not-allowed font-mono text-xs"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
