/**
 * Discord Role Assignment API
 * POST /api/discord/assign-role
 * Assigns role to Discord user using REST API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findOrCreateRole, addMemberRole } from '@/lib/discord/rest';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { guild_id, discord_user_id, role_name, application_id, tournament_id } = body;

    if (!discord_user_id) {
      return NextResponse.json(
        { error: 'Missing required field: discord_user_id' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let guildId = guild_id;
    let roleName = role_name || 'Approved Co-Streamer';

    // If guild_id is not provided, try to look it up from tournament
    if (!guildId && tournament_id) {
      console.log('[Discord API] Looking up Discord config for tournament:', tournament_id);

      // Get tournament to find organization_id
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('organization_id')
        .eq('id', tournament_id)
        .single();

      if (tournamentError) {
        console.error('[Discord API] Error fetching tournament:', tournamentError);
        return NextResponse.json(
          { error: 'Tournament not found' },
          { status: 404 }
        );
      }

      // Get Discord config for organization
      const { data: discordConfig, error: configError } = await supabase
        .from('discord_configs')
        .select('*')
        .eq('organization_id', tournament.organization_id)
        .single();

      if (configError || !discordConfig) {
        console.error('[Discord API] No Discord config found for organization:', configError);
        return NextResponse.json(
          { error: 'Discord not configured for this organization' },
          { status: 400 }
        );
      }

      guildId = discordConfig.guild_id;
      roleName = discordConfig.role_name || roleName;
    }

    if (!guildId) {
      return NextResponse.json(
        { error: 'Missing required field: guild_id or tournament_id' },
        { status: 400 }
      );
    }

    console.log('[Discord API] Assigning role:', {
      guild_id: guildId,
      discord_user_id,
      role_name: roleName,
    });

    // Find or create the role
    const role = await findOrCreateRole(guildId, roleName, 0x00FF00);

    // Assign role to member
    await addMemberRole(guildId, discord_user_id, role.id);

    return NextResponse.json({
      success: true,
      message: `Role "${roleName}" assigned successfully`,
      role_id: role.id,
    });

  } catch (error) {
    console.error('[Discord API] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to assign role',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
