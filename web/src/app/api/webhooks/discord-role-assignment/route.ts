// Webhook handler for automatic Discord role assignment
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import DiscordIntegrationService from '@/lib/services/discord-integration.service';

// This webhook is triggered when a tournament application is approved
export async function POST(request: NextRequest) {
  const headersList = headers();
  const webhookSecret = headersList.get('x-webhook-secret');

  // Verify webhook secret
  if (webhookSecret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const discordService = await new DiscordIntegrationService().init();

  try {
    const body = await request.json();
    const { 
      action, // 'approved' | 'rejected' | 'revoked'
      tournamentId,
      streamerId,
      organizerId,    } = body;

    // Get Discord integration settings for the organizer
    const { data: integration } = await supabase
      .from('discord_integrations')
      .select('*')
      .eq('organizer_id', organizerId)
      .single();

    if (!integration || !integration.selected_server_id || !integration.selected_role_id) {
      console.log('Discord integration not configured for organizer:', organizerId);
      return NextResponse.json({ success: false, message: 'Integration not configured' });
    }

    // Get streamer's Discord ID from their profile
    const { data: streamerProfile } = await supabase
      .from('streamer_profiles')
      .select('discord_id')
      .eq('user_id', streamerId)
      .single();

    if (!streamerProfile?.discord_id) {
      console.log('Streamer Discord ID not found:', streamerId);
      return NextResponse.json({ success: false, message: 'Streamer Discord ID not found' });
    }

    // Handle the action
    if (action === 'approved') {
      // Assign role to approved streamer
      await discordService.assignTournamentRole(
        integration.selected_server_id,
        streamerProfile.discord_id,
        integration.selected_role_id,
        organizerId
      );

      // Update application status
      await supabase
        .from('tournament_applications')
        .update({
          discord_role_assigned: true,
          discord_role_assigned_at: new Date().toISOString(),
        })
        .eq('tournament_id', tournamentId)
        .eq('streamer_id', streamerId);

      return NextResponse.json({ 
        success: true, 
        message: 'Role assigned successfully' 
      });

    } else if (action === 'rejected' || action === 'revoked') {
      // Remove role from rejected/revoked streamer
      try {
        await discordService.removeTournamentRole(
          integration.selected_server_id,
          streamerProfile.discord_id,
          integration.selected_role_id,
          organizerId
        );

        // Update application status
        await supabase
          .from('tournament_applications')
          .update({
            discord_role_assigned: false,
            discord_role_removed_at: new Date().toISOString(),
          })
          .eq('tournament_id', tournamentId)
          .eq('streamer_id', streamerId);

        return NextResponse.json({ 
          success: true, 
          message: 'Role removed successfully' 
        });
      } catch (error) {
        // Role might not exist, log but don't fail
        console.error('Error removing role:', error);
        return NextResponse.json({ 
          success: true, 
          message: 'Role removal attempted' 
        });
      }
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action' 
    });

  } catch (error) {
    console.error('Discord role webhook error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}