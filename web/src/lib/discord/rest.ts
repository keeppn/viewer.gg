/**
 * Discord REST API Client for Next.js
 * Uses fetch API instead of discord.js to avoid native dependencies
 */

const DISCORD_API_BASE = 'https://discord.com/api/v10';

interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
}

interface DiscordMember {
  user: {
    id: string;
    username: string;
  };
  roles: string[];
}

/**
 * Get all roles in a guild
 */
export async function getGuildRoles(guildId: string): Promise<DiscordRole[]> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  
  if (!botToken) {
    throw new Error('DISCORD_BOT_TOKEN not configured');
  }

  const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/roles`, {
    headers: {
      'Authorization': `Bot ${botToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Discord API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Create a role in a guild
 */
export async function createGuildRole(
  guildId: string,
  name: string,
  color: number = 0x00FF00
): Promise<DiscordRole> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  
  if (!botToken) {
    throw new Error('DISCORD_BOT_TOKEN not configured');
  }

  const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/roles`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      color,
      permissions: '0', // No special permissions
      mentionable: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Discord API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Assign a role to a guild member
 */
export async function addMemberRole(
  guildId: string,
  userId: string,
  roleId: string
): Promise<void> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  
  if (!botToken) {
    throw new Error('DISCORD_BOT_TOKEN not configured');
  }

  const response = await fetch(
    `${DISCORD_API_BASE}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = response.statusText;
    
    try {
      const error = JSON.parse(errorText);
      errorMessage = error.message || errorMessage;
    } catch {}
    
    throw new Error(`Discord API error: ${errorMessage}`);
  }
}

/**
 * Get a guild member
 */
export async function getGuildMember(
  guildId: string,
  userId: string
): Promise<DiscordMember> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  
  if (!botToken) {
    throw new Error('DISCORD_BOT_TOKEN not configured');
  }

  const response = await fetch(
    `${DISCORD_API_BASE}/guilds/${guildId}/members/${userId}`,
    {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Discord API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Find or create a role by name
 */
export async function findOrCreateRole(
  guildId: string,
  roleName: string,
  color: number = 0x00FF00
): Promise<DiscordRole> {
  // Get all roles
  const roles = await getGuildRoles(guildId);

  // Find existing role
  const existingRole = roles.find(r => r.name === roleName);
  if (existingRole) {
    return existingRole;
  }

  // Create new role
  return createGuildRole(guildId, roleName, color);
}

/**
 * Position a role below the bot's role in the hierarchy
 * This ensures the bot can always assign this role
 */
export async function positionRoleBelowBot(
  guildId: string,
  roleId: string
): Promise<void> {
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    throw new Error('DISCORD_BOT_TOKEN not configured');
  }

  // Get all roles to find bot's role
  const roles = await getGuildRoles(guildId);

  // Find bot's role (it's marked with 'managed: true' and 'tags.bot_id')
  const botRole = roles.find(r => (r as any).tags?.bot_id);

  if (!botRole) {
    console.warn('[Discord] Could not find bot role, skipping position adjustment');
    return;
  }

  // Find the target role
  const targetRole = roles.find(r => r.id === roleId);
  if (!targetRole) {
    throw new Error('Target role not found');
  }

  // If target role is already below bot role, no need to change
  // Higher position number = lower in hierarchy
  if (targetRole.position > botRole.position) {
    console.log('[Discord] Role already positioned correctly below bot');
    return;
  }

  // Position the target role just below the bot's role
  // We set it to bot.position (Discord will place it right below)
  const response = await fetch(
    `${DISCORD_API_BASE}/guilds/${guildId}/roles`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          id: roleId,
          position: botRole.position, // Discord automatically places it below
        },
      ]),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = response.statusText;

    try {
      const error = JSON.parse(errorText);
      errorMessage = error.message || errorMessage;
    } catch {}

    throw new Error(`Discord API error: ${errorMessage}`);
  }

  console.log('[Discord] Successfully positioned role below bot');
}
