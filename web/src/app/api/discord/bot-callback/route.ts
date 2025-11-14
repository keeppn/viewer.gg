import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Discord Bot OAuth Callback Handler
 * 
 * This endpoint handles the OAuth callback when a Tournament Organizer
 * adds the viewer.gg bot to their Discord server.
 * 
 * Flow:
 * 1. TO clicks "Connect Discord Bot" in Settings
 * 2. Redirects to Discord with bot scope and permissions
 * 3. TO selects which server to add bot to
 * 4. Discord redirects here with code and guild_id
 * 5. We save the guild configuration to database
 * 6. Bot finds/creates "Approved Co-streamers" role
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const guildId = searchParams.get('guild_id');
  const error = searchParams.get('error');
  const stateParam = searchParams.get('state');

  console.log('[Discord Bot Callback] Received:', { code: !!code, guildId, error, state: !!stateParam });

  // Handle OAuth errors
  if (error) {
    console.error('[Discord Bot Callback] OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=oauth_${error}`, request.url)
    );
  }

  // Validate required parameters
  if (!code) {
    console.error('[Discord Bot Callback] Missing code parameter');
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=missing_code', request.url)
    );
  }

  if (!guildId) {
    console.error('[Discord Bot Callback] Missing guild_id parameter');
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=missing_guild_id', request.url)
    );
  }

  if (!stateParam) {
    console.error('[Discord Bot Callback] Missing state parameter');
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=missing_state', request.url)
    );
  }

  // Decode state parameter to get organization ID
  let organizationId: string;
  try {
    const stateData = JSON.parse(atob(stateParam));
    organizationId = stateData.org_id;
    console.log('[Discord Bot Callback] Decoded organization ID from state:', organizationId);
  } catch (err) {
    console.error('[Discord Bot Callback] Failed to decode state parameter:', err);
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=invalid_state', request.url)
    );
  }

  const supabase = await createClient();

  try {
    // Verify the organization exists (using organization ID from state parameter)
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', organizationId)
      .single();

    if (orgError || !organization) {
      console.error('[Discord Bot Callback] Organization not found:', orgError);
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=no_organization', request.url)
      );
    }

    console.log('[Discord Bot Callback] Organization found:', organization.id);

    // Fetch guild information from Discord API using bot token
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      console.error('[Discord Bot Callback] DISCORD_BOT_TOKEN not configured');
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=bot_token_missing', request.url)
      );
    }

    const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
      },
    });

    if (!guildResponse.ok) {
      const errorText = await guildResponse.text();
      console.error('[Discord Bot Callback] Failed to fetch guild:', errorText);
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=guild_fetch_failed', request.url)
      );
    }

    const guild = await guildResponse.json();
    console.log('[Discord Bot Callback] Guild fetched:', guild.name);

    // Find or create "Approved Co-streamers" role
    const rolesResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
      },
    });

    if (!rolesResponse.ok) {
      console.error('[Discord Bot Callback] Failed to fetch roles');
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=roles_fetch_failed', request.url)
      );
    }

    const roles = await rolesResponse.json();
    let approvedRole = roles.find((role: any) => 
      role.name.toLowerCase() === 'approved co-streamers' ||
      role.name.toLowerCase() === 'approved co-streamer'
    );

    // Create role if it doesn't exist
    if (!approvedRole) {
      console.log('[Discord Bot Callback] Creating "Approved Co-streamers" role');
      
      const createRoleResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Approved Co-streamers',
          color: 0x00D9FF, // Cyan color
          hoist: true, // Display separately in member list
          mentionable: true,
        }),
      });

      if (!createRoleResponse.ok) {
        const errorText = await createRoleResponse.text();
        console.error('[Discord Bot Callback] Failed to create role:', errorText);
        // Continue anyway - role can be set up manually later
      } else {
        approvedRole = await createRoleResponse.json();
        console.log('[Discord Bot Callback] Role created:', approvedRole.id);
      }
    } else {
      console.log('[Discord Bot Callback] Role already exists:', approvedRole.id);
    }

    // Save Discord configuration to database
    // Using existing schema: discord_configs table
    const { data: config, error: configError } = await supabase
      .from('discord_configs')
      .upsert({
        organization_id: organization.id,
        guild_id: guildId,
        guild_name: guild.name,
        bot_token: 'GLOBAL_BOT_TOKEN', // Placeholder - actual token is in env vars
        default_role_id: approvedRole?.id || null, // Role to assign to approved streamers
        announcement_channel_id: null, // Can be configured later
        is_connected: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'organization_id', // Only one config per organization
      })
      .select()
      .single();

    if (configError) {
      console.error('[Discord Bot Callback] Failed to save config:', configError);
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=save_failed', request.url)
      );
    }

    console.log('[Discord Bot Callback] Config saved successfully:', config.id);

    // Success! Redirect back to settings
    return NextResponse.redirect(
      new URL('/dashboard/settings?success=bot_connected', request.url)
    );

  } catch (error) {
    console.error('[Discord Bot Callback] Unexpected error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=unexpected', request.url)
    );
  }
}