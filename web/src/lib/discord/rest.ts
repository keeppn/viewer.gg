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

  console.log('[Discord REST] Fetching guild roles for guild:', guildId);

  const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/roles`, {
    headers: {
      'Authorization': `Bot ${botToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = response.statusText;

    try {
      const error = JSON.parse(errorText);
      errorMessage = error.message || errorMessage;
      console.error('[Discord REST] Failed to fetch guild roles:', {
        status: response.status,
        error,
      });
    } catch {
      console.error('[Discord REST] Failed to fetch guild roles (non-JSON):', {
        status: response.status,
        text: errorText,
      });
    }

    if (response.status === 403) {
      throw new Error(`Discord API error (403): Bot doesn't have permission to view roles. ${errorMessage}`);
    } else if (response.status === 404) {
      throw new Error(`Discord API error (404): Guild not found or bot not in guild. ${errorMessage}`);
    } else {
      throw new Error(`Discord API error (${response.status}): ${errorMessage}`);
    }
  }

  const roles = await response.json();
  console.log(`[Discord REST] Found ${roles.length} roles in guild`);
  return roles;
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

  console.log('[Discord REST] Adding member role:', {
    guildId,
    userId,
    roleId,
    endpoint: `${DISCORD_API_BASE}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
  });

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
    let errorCode = null;

    try {
      const error = JSON.parse(errorText);
      errorMessage = error.message || errorMessage;
      errorCode = error.code;

      console.error('[Discord REST] API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        code: errorCode,
        message: errorMessage,
        fullError: error,
      });
    } catch {
      console.error('[Discord REST] API Error (non-JSON):', {
        status: response.status,
        statusText: response.statusText,
        text: errorText,
      });
    }

    // Provide helpful error messages based on common issues
    if (response.status === 403) {
      throw new Error(`Discord API error (403 Forbidden): Bot lacks permissions to manage roles or role hierarchy issue. ${errorMessage}`);
    } else if (response.status === 404) {
      throw new Error(`Discord API error (404 Not Found): User not in server or invalid guild/user/role ID. ${errorMessage}`);
    } else if (response.status === 401) {
      throw new Error(`Discord API error (401 Unauthorized): Invalid bot token. ${errorMessage}`);
    } else {
      throw new Error(`Discord API error (${response.status}): ${errorMessage}`);
    }
  }

  console.log('[Discord REST] Role added successfully');
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
  console.log('[Discord REST] Finding or creating role:', { guildId, roleName });

  // Get all roles
  const roles = await getGuildRoles(guildId);

  // Find existing role
  const existingRole = roles.find(r => r.name === roleName);
  if (existingRole) {
    console.log('[Discord REST] Found existing role:', {
      id: existingRole.id,
      name: existingRole.name,
      position: existingRole.position,
    });
    return existingRole;
  }

  // Create new role
  console.log('[Discord REST] Role not found, creating new role:', roleName);
  const newRole = await createGuildRole(guildId, roleName, color);
  console.log('[Discord REST] Created new role:', {
    id: newRole.id,
    name: newRole.name,
  });
  return newRole;
}
