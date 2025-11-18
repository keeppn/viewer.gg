/**
 * Discord Role Assignment API
 * POST /api/discord/assign-role
 * Assigns role to Discord user using REST API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findOrCreateRole, addMemberRole } from '@/lib/discord/rest';
import { isValidDiscordUserId, isValidDiscordGuildId } from '@/lib/validators/discord';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { guild_id, discord_user_id, role_name, application_id, tournament_id } = body;

    if (!guild_id || !discord_user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: guild_id, discord_user_id' },
        { status: 400 }
      );
    }

    // SECURITY FIX: Validate Discord ID formats to prevent injection attacks
    if (!isValidDiscordGuildId(guild_id)) {
      console.error('[Discord API] Invalid guild_id format:', guild_id);
      return NextResponse.json(
        { error: 'Invalid guild_id format. Must be a 17-19 digit Discord ID.' },
        { status: 400 }
      );
    }

    if (!isValidDiscordUserId(discord_user_id)) {
      console.error('[Discord API] Invalid discord_user_id format:', discord_user_id);
      return NextResponse.json(
        { error: 'Invalid discord_user_id format. Must be a 17-19 digit Discord ID.' },
        { status: 400 }
      );
    }

    const roleName = role_name || 'Approved Co-Streamer';

    console.log('[Discord API] Assigning role:', {
      guild_id,
      discord_user_id,
      role_name: roleName,
    });

    // Find or create the role
    const role = await findOrCreateRole(guild_id, roleName, 0x00FF00);
    
    // Assign role to member
    await addMemberRole(guild_id, discord_user_id, role.id);

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
