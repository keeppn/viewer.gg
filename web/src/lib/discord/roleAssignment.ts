import { createClient } from '@/lib/supabase/server';

interface RoleAssignmentResult {
  success: boolean;
  error?: string;
  attempt?: number;
}

interface RoleAssignmentParams {
  guildId: string;
  userId: string;
  roleName?: string;
  applicationId: string;
  tournamentId: string;
}

/**
 * Assign Discord role with exponential backoff retry logic
 */
export async function assignDiscordRole(
  params: RoleAssignmentParams
): Promise<RoleAssignmentResult> {
  const { guildId, userId, roleName = 'Approved Co-Streamer', applicationId, tournamentId } = params;
  
  const MAX_RETRIES = 3;
  const INITIAL_DELAY = 2000; // 2 seconds
  
  // Validate inputs
  if (!guildId || !userId) {
    const error = 'Missing required parameters: guildId and userId';
    await logDiscordMessage({
      guild_id: guildId || 'unknown',
      user_id: userId || 'unknown',
      message_type: 'role_assignment_failed',
      content: error,
      application_id: applicationId,
      tournament_id: tournamentId,
      success: false,
      error_message: error,
    });
    return { success: false, error, attempt: 0 };
  }
  
  // Attempt role assignment with retries
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Discord] Attempting role assignment (${attempt}/${MAX_RETRIES})`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/discord/assign-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guild_id: guildId,
          discord_user_id: userId,
          role_name: roleName,
          application_id: applicationId,
          tournament_id: tournamentId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || `Discord API error: ${response.status}`);
      }
      
      // Success!
      console.log(`[Discord] Role assignment successful on attempt ${attempt}`);
      await logDiscordMessage({
        guild_id: guildId,
        user_id: userId,
        message_type: 'role_assigned',
        content: `Successfully assigned role "${roleName}" to user ${userId}`,
        application_id: applicationId,
        tournament_id: tournamentId,
        success: true,
      });
      
      return { success: true, attempt };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Discord] Attempt ${attempt} failed:`, errorMessage);
      
      if (attempt === MAX_RETRIES) {
        await logDiscordMessage({
          guild_id: guildId,
          user_id: userId,
          message_type: 'role_assignment_failed',
          content: `Failed after ${MAX_RETRIES} attempts: ${errorMessage}`,
          application_id: applicationId,
          tournament_id: tournamentId,
          success: false,
          error_message: errorMessage,
        });
        return { success: false, error: errorMessage, attempt };
      }
      
      // Exponential backoff: 2s, 4s, 8s
      const delay = INITIAL_DELAY * Math.pow(2, attempt - 1);
      console.log(`[Discord] Retrying after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { success: false, error: 'Max retries exceeded', attempt: MAX_RETRIES };
}

async function logDiscordMessage(params: {
  guild_id: string;
  user_id: string;
  message_type: string;
  content: string;
  application_id: string;
  tournament_id: string;
  success: boolean;
  error_message?: string;
}): Promise<void> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('discord_messages')
      .insert({
        guild_id: params.guild_id,
        user_id: params.user_id,
        message_type: params.message_type,
        content: params.content,
        metadata: {
          application_id: params.application_id,
          tournament_id: params.tournament_id,
          success: params.success,
          error_message: params.error_message,
          timestamp: new Date().toISOString(),
        },
      });
    
    if (error) {
      console.error('[Discord] Failed to log message:', error);
    }
  } catch (error) {
    console.error('[Discord] Error logging message:', error);
  }
}
