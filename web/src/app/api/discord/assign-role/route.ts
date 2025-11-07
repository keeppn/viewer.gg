/**
 * Discord Role Assignment API
 * 
 * Assigns the "Approved Co-Streamer" role to a Discord user
 * when their application is approved.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { assignRoleToMember } from '@/lib/discord/roles';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { application_id } = body;

    if (!application_id) {
      return NextResponse.json(
        { error: 'application_id is required' },
        { status: 400 }
      );
    }


    // Fetch application with tournament info
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        tournaments (
          organizer_id,
          discord_configs (
            guild_id,
            approved_role_id
          )
        )
      `)
      .eq('id', application_id)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify user is the tournament organizer
    if (application.tournaments.organizer_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Not tournament organizer' },
        { status: 403 }
      );
    }

    // Check if Discord is configured
    const discordConfig = application.tournaments.discord_configs?.[0];
    
    if (!discordConfig) {
      return NextResponse.json(
        { error: 'Discord not configured for this tournament' },
        { status: 400 }
      );
    }

    // Get Discord user ID from application
    const discordUserId = application.discord_user_id;
    
    if (!discordUserId) {
      return NextResponse.json(
        { error: 'No Discord ID found in application' },
        { status: 400 }
      );
    }


    // Assign the role
    const result = await assignRoleToMember(
      discordConfig.guild_id,
      discordUserId,
      discordConfig.approved_role_id
    );

    // Log the action to discord_messages table
    await supabase
      .from('discord_messages')
      .insert({
        application_id: application_id,
        discord_user_id: discordUserId,
        message_type: 'approval',
        success: result.success,
        error_message: result.success ? null : result.message,
      });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });

  } catch (error) {
    console.error('Role assignment error:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
