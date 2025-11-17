/**
 * Discord Configuration Test Endpoint
 * GET /api/discord/test-config
 * Tests Discord bot configuration and permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGuildRoles } from '@/lib/discord/rest';

export async function GET(request: NextRequest) {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // Get guild_id from query params for testing
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guild_id');

    const config = {
      bot_token_configured: !!botToken,
      bot_token_length: botToken ? botToken.length : 0,
      bot_token_starts_with_bot: botToken ? botToken.startsWith('Bot ') : false,
      app_url_configured: !!appUrl,
      app_url: appUrl || 'NOT SET',
    };

    console.log('[Discord Test] Configuration:', config);

    // If guild_id provided, test fetching roles
    let guildTest = null;
    if (guildId && botToken) {
      try {
        const roles = await getGuildRoles(guildId);
        guildTest = {
          guild_id: guildId,
          success: true,
          roles_count: roles.length,
          roles: roles.map(r => ({
            id: r.id,
            name: r.name,
            position: r.position,
          })),
        };
      } catch (error) {
        guildTest = {
          guild_id: guildId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return NextResponse.json({
      success: true,
      configuration: config,
      guild_test: guildTest,
      help: {
        message: 'To test with a guild, add ?guild_id=YOUR_GUILD_ID to the URL',
        common_issues: [
          'Bot token not configured: Set DISCORD_BOT_TOKEN in environment variables',
          'Bot not in server: Invite bot to Discord server with proper OAuth2 URL',
          'Missing permissions: Bot needs "Manage Roles" permission',
          'Role hierarchy: Bot\'s role must be higher than roles it manages',
          'User not in server: User must be a member of the Discord server',
        ],
      },
    });

  } catch (error) {
    console.error('[Discord Test] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
