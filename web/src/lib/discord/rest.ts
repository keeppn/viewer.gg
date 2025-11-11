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
