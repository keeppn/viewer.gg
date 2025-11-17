import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { assignDiscordRole } from '@/lib/discord/roleAssignment';

/**
 * POST /api/applications/[id]/approve
 * Approve a streamer application and automatically assign Discord role
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15+ compatibility
    const { id } = await params;
    
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get application with all related data
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        tournament:tournament_id(
          *,
          organization:organization_id(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Verify user is the tournament organizer
    if (application.tournament.organization.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Only tournament organizer can approve applications' },
        { status: 403 }
      );
    }
    
    // Update application status to Approved
    const { data: updatedApp, error: updateError } = await supabase
      .from('applications')
      .update({ status: 'Approved' })
      .eq('id', id)
      .select(`
        *,
        tournament:tournament_id(
          *,
          organization:organization_id(*)
        )
      `)
      .single();
    
    if (updateError || !updatedApp) {
      return NextResponse.json(
        { error: 'Failed to approve application' },
        { status: 500 }
      );
    }
    
    // Track Discord role assignment status
    let discordStatus = {
      attempted: false,
      success: false,
      error: null as string | null,
      skipped: false,
      skipReason: null as string | null,
    };
    
    // Check if Discord integration is configured
    const { data: discordConfig } = await supabase
      .from('discord_configs')
      .select('guild_id, default_role_id, is_connected, role_name')
      .eq('organization_id', updatedApp.tournament.organization.id)
      .eq('is_connected', true)
      .maybeSingle();
    
    // Determine if we should attempt Discord role assignment
    if (!discordConfig) {
      discordStatus.skipped = true;
      discordStatus.skipReason = 'Discord integration not configured';
      console.log('[Discord] Skipping:', discordStatus.skipReason);
    } else if (!updatedApp.streamer.discord_user_id) {
      discordStatus.skipped = true;
      discordStatus.skipReason = 'Streamer has not provided Discord User ID';
      console.log('[Discord] Skipping:', discordStatus.skipReason);
    } else {
      // Attempt Discord role assignment
      discordStatus.attempted = true;
      
      console.log('[Discord] Attempting role assignment:', {
        applicationId: updatedApp.id,
        tournamentId: updatedApp.tournament_id,
        discordUserId: updatedApp.streamer.discord_user_id,
        guildId: discordConfig.guild_id,
      });
      
      try {
        const result = await assignDiscordRole({
          guildId: discordConfig.guild_id,
          userId: updatedApp.streamer.discord_user_id,
          roleName: discordConfig.role_name,
          applicationId: updatedApp.id,
          tournamentId: updatedApp.tournament_id,
        });
        
        discordStatus.success = result.success;
        if (!result.success) {
          discordStatus.error = result.error || 'Unknown error';
        }
        
        console.log('[Discord] Result:', {
          success: result.success,
          attempts: result.attempt,
          error: result.error,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        discordStatus.error = errorMessage;
        console.error('[Discord] Unexpected error:', error);
      }
    }
    
    // Return success response with Discord status
    return NextResponse.json({
      success: true,
      message: 'Application approved successfully',
      application: updatedApp,
      discord: discordStatus,
    });
    
  } catch (error) {
    console.error('[Approval] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
