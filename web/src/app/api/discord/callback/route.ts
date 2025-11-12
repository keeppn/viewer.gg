// Discord OAuth callback handler route
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error('Discord OAuth error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/settings/discord?error=oauth_failed', request.url)
    );
  }

  // Validate required parameters
  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/dashboard/settings/discord?error=missing_params', request.url)
    );
  }

  const supabase = await createClient();

  try {
    // Verify state parameter to prevent CSRF attacks    // Get stored state from session or database
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.redirect(
        new URL('/dashboard/settings/discord?error=no_session', request.url)
      );
    }

    // Exchange code for Discord access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/discord/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange Discord code for token');
      return NextResponse.redirect(        new URL('/dashboard/settings/discord?error=token_exchange_failed', request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Fetch Discord user information
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch Discord user information');
      return NextResponse.redirect(
        new URL('/dashboard/settings/discord?error=user_fetch_failed', request.url)
      );
    }

    const discordUser = await userResponse.json();

    // Fetch user's guilds to get servers where they have admin permissions
    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${access_token}`,      },
    });

    if (!guildsResponse.ok) {
      console.error('Failed to fetch Discord guilds');
      return NextResponse.redirect(
        new URL('/dashboard/settings/discord?error=guilds_fetch_failed', request.url)
      );
    }

    const guilds = await guildsResponse.json();
    
    // Filter guilds where user has admin permissions (0x8 = Administrator)
    const adminGuilds = guilds.filter((guild: any) => 
      (BigInt(guild.permissions) & BigInt(0x8)) === BigInt(0x8)
    );

    // Store Discord integration in database
    const { error: dbError } = await supabase
      .from('discord_integrations')
      .upsert({
        organizer_id: session.user.id,
        discord_user_id: discordUser.id,
        discord_username: discordUser.username,
        discord_discriminator: discordUser.discriminator,
        access_token: access_token,
        refresh_token: refresh_token,        expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        servers: adminGuilds,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to save Discord integration:', dbError);
      return NextResponse.redirect(
        new URL('/dashboard/settings/discord?error=save_failed', request.url)
      );
    }

    // Success! Redirect back to Discord settings page
    return NextResponse.redirect(
      new URL('/dashboard/settings/discord?success=connected', request.url)
    );

  } catch (error) {
    console.error('Discord OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/settings/discord?error=unexpected', request.url)
    );
  }
}