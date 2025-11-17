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

    // Check for DISCORD_BOT_TOKEN
    if (!process.env.DISCORD_BOT_TOKEN) {
      console.error('[Discord API] DISCORD_BOT_TOKEN environment variable not set!');
      return NextResponse.json(
        { error: 'Discord bot not configured - DISCORD_BOT_TOKEN missing' },
        { status: 500 }
      );
    }

    if (!guild_id || !discord_user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: guild_id, discord_user_id' },
        { status: 400 }
      );
    }

    const roleName = role_name || 'Approved Co-Streamer';

    console.log('[Discord API] Assigning role:', {
      guild_id,
      discord_user_id,
      role_name: roleName,
      application_id,
      tournament_id,
      bot_token_present: !!process.env.DISCORD_BOT_TOKEN,
    });

    // Find or create the role
    const role = await findOrCreateRole(guild_id, roleName, 0x00FF00);

    // Assign role to member
    await addMemberRole(guild_id, discord_user_id, role.id);

    console.log('[Discord API] Role assigned successfully:', {
      role_id: role.id,
      role_name: roleName,
      user_id: discord_user_id,
    });

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
