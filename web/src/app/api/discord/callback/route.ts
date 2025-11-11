/**
 * Discord OAuth2 Callback Handler
 * 
 * Handles the redirect from Discord after TO authorizes the bot.
 * Exchanges code for token, fetches guild info, and stores configuration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangeCodeForToken, fetchGuilds } from '@/lib/discord/oauth';
import { findOrCreateRole } from '@/lib/discord/rest';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // Can be used for CSRF protection
  const error = searchParams.get('error');

  // Handle Discord authorization errors
  if (error) {
    console.error('Discord OAuth error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=discord_auth_failed', request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=missing_code', request.url)
    );
  }

  try {
    const supabase = await createClient();

    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.redirect(
        new URL('/auth/login?error=unauthorized', request.url)
      );
    }

    // Exchange authorization code for access token
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/discord/callback`;
    const tokenData = await exchangeCodeForToken(code, redirectUri);

    // Fetch guilds where bot was added
    const guilds = await fetchGuilds(tokenData.access_token);
    
    if (!guilds || guilds.length === 0) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=no_guilds_found', request.url)
      );
    }

    // Get the first guild (user should only add bot to one server in this flow)
    const guild = guilds[0];

    // Find or create the "Approved Co-Streamer" role
    const role = await findOrCreateRole(guild.id, 'Approved Co-Streamer', 0x00FF00);

    // Store Discord configuration in database
    const { error: configError } = await supabase
      .from('discord_configs')
      .upsert({
        tournament_organizer_id: user.id,
        guild_id: guild.id,
        guild_name: guild.name,
        approved_role_id: role.id,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'tournament_organizer_id',
      });

    if (configError) {
      console.error('Failed to save Discord config:', configError);
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=config_save_failed', request.url)
      );
    }

    // Success! Redirect to settings page
    return NextResponse.redirect(
      new URL('/dashboard/settings?success=discord_connected', request.url)
    );

  } catch (error) {
    console.error('Discord callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=unknown', request.url)
    );
  }
}
