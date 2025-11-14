import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Get the Discord config to find the guild_id
    const supabase = await createClient();
    const { data: discordConfig, error: configError } = await supabase
      .from('discord_configs')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (configError || !discordConfig) {
      return NextResponse.json(
        { error: 'Discord configuration not found' },
        { status: 404 }
      );
    }

    // Make the bot leave the Discord server using Discord API
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      console.error('DISCORD_BOT_TOKEN not configured');
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      );
    }

    const guildId = discordConfig.guild_id;
    console.log(`[Disconnect] Making bot leave guild: ${guildId}`);

    // Discord API: Leave guild
    const discordApiUrl = `https://discord.com/api/v10/users/@me/guilds/${guildId}`;
    console.log(`[Disconnect] Discord API URL: ${discordApiUrl}`);

    const discordResponse = await fetch(discordApiUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });

    console.log(`[Disconnect] Discord API response status: ${discordResponse.status}`);

    if (!discordResponse.ok && discordResponse.status !== 404) {
      // 404 means bot was already removed, which is fine
      const errorText = await discordResponse.text();
      console.error('[Disconnect] Discord API error:', discordResponse.status, errorText);
      return NextResponse.json(
        { error: `Failed to remove bot from Discord server: ${errorText}`, details: errorText },
        { status: discordResponse.status }
      );
    }

    console.log('[Disconnect] Bot successfully left guild (or was already gone)');

    // Delete the Discord config from database
    const { error: deleteError } = await supabase
      .from('discord_configs')
      .delete()
      .eq('organization_id', organizationId);

    if (deleteError) {
      console.error('Error deleting discord config:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bot disconnected and removed from Discord server'
    });

  } catch (error: any) {
    console.error('Error in disconnect endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
