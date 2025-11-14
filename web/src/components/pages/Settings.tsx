"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Button from '@/components/common/Button';

const Settings: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [organization, setOrganization] = useState<any>(null);
    const [discordConfig, setDiscordConfig] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Force log to verify component is rendering
    console.log('[Settings] Component rendering, loading:', loading, 'organization:', organization?.name || 'NULL', 'discordConfig:', discordConfig ? 'EXISTS' : 'NULL');

    useEffect(() => {
        console.log('[Settings] useEffect triggered');

        let isMounted = true;

        const initializePage = async () => {
            if (!isMounted) {
                console.log('[Settings] Component unmounted before initialization');
                return;
            }

            console.log('[Settings] Starting initialization');
            setLoading(true);

            try {
                // Check URL params
                const success = searchParams.get('success');
                const errorParam = searchParams.get('error');

                console.log('[Settings] URL params:', { success, errorParam });

                // Load organization data FIRST
                console.log('[Settings] About to call loadOrganizationData...');
                await loadOrganizationData();
                console.log('[Settings] loadOrganizationData completed');

                if (!isMounted) {
                    console.log('[Settings] Component unmounted after data load');
                    return;
                }

                // Clear URL params AFTER loading is complete
                if (success || errorParam) {
                    console.log('[Settings] Clearing URL params after loading');
                    // Use window.history instead of router to avoid component unmount
                    window.history.replaceState({}, '', '/dashboard/settings');
                }

                // Show message if success
                if (success === 'bot_connected') {
                    console.log('[Settings] Bot connected successfully');
                }
            } catch (err: any) {
                console.error('[Settings] Initialization failed:', err);
                console.error('[Settings] Error stack:', err?.stack);
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        };

        initializePage().catch(err => {
            console.error('[Settings] Uncaught error in initializePage:', err);
            if (isMounted) {
                setError('Failed to initialize settings');
                setLoading(false);
            }
        });

        return () => {
            console.log('[Settings] Cleanup - component unmounting');
            isMounted = false;
        };
    }, []); // Empty array - only run ONCE on mount

    const loadOrganizationData = async () => {
        try {
            console.log('[Settings] Starting loadOrganizationData...');

            // Add timeout to prevent infinite hanging
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Data loading timeout after 10 seconds')), 10000);
            });

            // Get session first to verify auth state
            const sessionPromise = supabase.auth.getSession();
            const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
            console.log('[Settings] Session:', session ? 'EXISTS' : 'NULL', session?.user?.id);
            
            const { data: { user } } = await supabase.auth.getUser();
            console.log('[Settings] User from getUser():', user ? 'EXISTS' : 'NULL', user?.id);
            
            if (!user) {
                console.error('[Settings] No user found, redirecting to login');
                router.push('/login');
                return;
            }

            // First, get user profile to find their organization_id
            console.log('[Settings] Querying users table for user:', user.id);
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            console.log('[Settings] User query result:', { userData, userError });

            if (userError) {
                console.error('[Settings] Error loading user profile:', userError);
                console.error('[Settings] Error details:', JSON.stringify(userError, null, 2));
                throw new Error(`User profile not found: ${userError.message} (${userError.code})`);
            }

            if (!userData?.organization_id) {
                console.error('[Settings] User profile found but no organization_id:', userData);
                throw new Error('No organization found for this user');
            }

            console.log('[Settings] Found organization_id:', userData.organization_id);

            // Get organization using organization_id from user profile
            console.log('[Settings] Querying organizations table for org:', userData.organization_id);
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', userData.organization_id)
                .single();

            console.log('[Settings] Organization query result:', { org, orgError });

            if (orgError) {
                console.error('[Settings] Error loading organization:', orgError);
                console.error('[Settings] Error details:', JSON.stringify(orgError, null, 2));
                throw new Error(`Organization not found: ${orgError.message} (${orgError.code})`);
            }
            
            console.log('[Settings] Successfully loaded organization:', org.name);
            setOrganization(org);

            // Load Discord config if exists
            await loadDiscordConfig(org.id);
            
        } catch (err: any) {
            console.error('[Settings] Error loading organization:', err);
            console.error('[Settings] Error stack:', err.stack);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadDiscordConfig = async (orgId?: string) => {
        try {
            const targetOrgId = orgId || organization?.id;
            console.log('[Settings] Loading Discord config for org:', targetOrgId);

            const { data: config, error } = await supabase
                .from('discord_configs')
                .select('*')
                .eq('organization_id', targetOrgId)
                .maybeSingle();

            console.log('[Settings] Discord config result:', { config, error });

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

        // Build Discord bot OAuth URL - using bot scope to add bot to server
        const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || process.env.NEXT_PUBLIC_DISCORD_BOT_CLIENT_ID;
        const redirectUri = `${window.location.origin}/api/discord/bot-callback`;
        const permissions = '268435456'; // MANAGE_ROLES permission (0x10000000 in hex)

        // Use state parameter to pass organization ID securely
        // This allows the callback to know which organization is connecting
        const state = btoa(JSON.stringify({ org_id: organization.id }));

        // Important: Use 'bot' scope to add the bot to a server
        // guild_id will be in the callback URL parameters
        const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=bot&state=${encodeURIComponent(state)}`;

        console.log('Redirecting to Discord:', discordAuthUrl);

        // Redirect to Discord
        window.location.href = discordAuthUrl;
    };

    const handleDisconnectBot = async () => {
        if (!discordConfig || !organization) return;

        const confirmed = confirm('Are you sure you want to disconnect the Discord bot? The bot will leave your Discord server and automatic role assignments will be disabled.');
        if (!confirmed) return;

        try {
            console.log('[Settings] Calling disconnect API...');
            // Call API to disconnect bot and make it leave the Discord server
            const response = await fetch('/api/discord/disconnect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    organizationId: organization.id,
                }),
            });

            const data = await response.json();
            console.log('[Settings] Disconnect API response:', data);

            if (!response.ok) {
                console.error('[Settings] Disconnect failed:', data);
                throw new Error(data.error || 'Failed to disconnect bot');
            }

            setDiscordConfig(null);
            alert('Discord bot disconnected and removed from your server successfully');
        } catch (err: any) {
            console.error('[Settings] Error disconnecting bot:', err);
            alert('Failed to disconnect bot: ' + err.message);
        }
    };

    if (loading) {
        console.log('[Settings] Rendering LOADING state');
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
        console.log('[Settings] Rendering NO ORGANIZATION state');
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                    <h2 className="text-red-400 font-bold text-lg mb-2">No Organization Found</h2>
                    <p className="text-red-300 mb-4">
                        {error || 'Unable to load your organization. Please check the console for details.'}
                    </p>
                    <div className="text-gray-400 text-sm mb-4">
                        <p>Possible causes:</p>
                        <ul className="list-disc ml-5 mt-2">
                            <li>Your user profile may not be linked to an organization</li>
                            <li>Database permissions (RLS policies) may be blocking access</li>
                            <li>The organization record may not exist in the database</li>
                        </ul>
                    </div>
                    <div className="flex gap-4">
                        <Button 
                            variant="primary"
                            onClick={() => window.location.reload()}
                        >
                            Retry Loading
                        </Button>
                        <Button 
                            variant="secondary"
                            onClick={() => router.push('/dashboard')}
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                    <div className="mt-4 p-4 bg-black/30 rounded border border-white/10">
                        <p className="text-gray-400 text-xs font-mono">
                            Check the browser console (F12) for detailed error logs.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    console.log('[Settings] Rendering MAIN CONTENT');
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-400">{error}</p>
                    <button 
                        onClick={() => setError(null)} 
                        className="text-red-300 text-sm underline mt-2"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Discord Integration */}
            <div className="bg-[#1E1E1E] p-8 rounded-lg shadow-sm border border-white/10">
                <h2 className="text-2xl font-bold mb-1 text-white">Discord Bot Integration</h2>
                <p className="text-gray-400 mb-6">
                    Connect the viewer.gg bot to your Discord server to automate role assignments for approved co-streamers.
                </p>

                {discordConfig && discordConfig.is_connected ? (
                    <div className="space-y-4">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-400 font-semibold mb-1">✓ Bot Connected</p>
                                    <p className="text-gray-400 text-sm">Server: {discordConfig.guild_name}</p>
                                    <p className="text-gray-400 text-sm font-mono text-xs">Guild ID: {discordConfig.guild_id}</p>
                                    {discordConfig.default_role_id && (
                                        <p className="text-gray-400 text-sm font-mono text-xs">Role ID: {discordConfig.default_role_id}</p>
                                    )}
                                    <p className="text-gray-400 text-xs mt-2">
                                        Connected: {new Date(discordConfig.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <Button variant="danger" onClick={handleDisconnectBot}>
                                    Disconnect
                                </Button>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-blue-400 text-sm">
                                <strong>ℹ️ How it works:</strong> When you approve a streamer application, 
                                the bot will automatically assign them the &quot;Approved Co-streamers&quot; role 
                                in your Discord server (if they provided their Discord User ID).
                            </p>
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
                                <li>The bot will create/find the &quot;Approved Co-streamers&quot; role</li>
                            </ul>
                        </div>

                        <Button 
                            onClick={handleConnectBot} 
                            variant="primary"
                            className="w-full"
                        >
                            Connect Discord Bot
                        </Button>

                        <p className="text-gray-400 text-sm text-center">
                            Required permissions: Manage Roles, View Channels
                        </p>
                    </div>
                )}
            </div>

            {/* Account Settings */}
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