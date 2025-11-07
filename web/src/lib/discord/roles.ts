/**
 * Discord Role Management
 * 
 * Functions for finding, creating, and assigning roles to Discord members.
 * Handles the core auto-role assignment logic.
 */

import { getDiscordClient } from './bot';
import type { Guild, Role, GuildMember } from 'discord.js';

/**
 * Default role name for approved co-streamers
 */
export const APPROVED_ROLE_NAME = 'Approved Co-Streamer';

/**
 * viewer.gg brand color for the role (cyan)
 */
export const ROLE_COLOR = 0x00D9FF;

/**
 * Find or create the "Approved Co-Streamer" role in a guild
 * 
 * @param guildId - Discord guild/server ID
 * @returns Role object with role ID and name
 */
export async function findOrCreateRole(guildId: string): Promise<{
  id: string;
  name: string;
}> {
  const client = getDiscordClient();
  
  // Fetch guild
  const guild = await client.guilds.fetch(guildId);
  
  if (!guild) {
    throw new Error(`Guild ${guildId} not found or bot not in server`);
  }

  // Try to find existing role
  let role = guild.roles.cache.find(r => r.name === APPROVED_ROLE_NAME);

  
  // Create role if it doesn't exist
  if (!role) {
    console.log(`Creating "${APPROVED_ROLE_NAME}" role in guild ${guildId}`);
    
    role = await guild.roles.create({
      name: APPROVED_ROLE_NAME,
      color: ROLE_COLOR,
      reason: 'Auto-created by viewer.gg for approved co-streamers',
    });
    
    console.log(`✅ Created role: ${role.name} (${role.id})`);
  }

  return {
    id: role.id,
    name: role.name,
  };
}

/**
 * Assign role to a Discord member
 * 
 * @param guildId - Discord guild/server ID
 * @param userId - Discord user ID to assign role to
 * @param roleId - Role ID to assign
 * @returns Success status with message
 */
export async function assignRoleToMember(
  guildId: string,
  userId: string,
  roleId: string
): Promise<{ success: boolean; message: string }> {
  const client = getDiscordClient();
  
  try {
    // Fetch guild
    const guild = await client.guilds.fetch(guildId);
    
    if (!guild) {
      return {
        success: false,
        message: `Guild ${guildId} not found. Bot may have been removed from server.`,
      };
    }

    // Fetch member
    let member: GuildMember;
    try {
      member = await guild.members.fetch(userId);
    } catch (error) {
      return {
        success: false,
        message: `User ${userId} is not a member of this Discord server.`,
      };
    }


    // Check if member already has the role
    if (member.roles.cache.has(roleId)) {
      return {
        success: true,
        message: `User already has the role.`,
      };
    }

    // Assign the role
    await member.roles.add(roleId, 'Approved by tournament organizer via viewer.gg');

    return {
      success: true,
      message: `Successfully assigned role to ${member.user.tag}`,
    };

  } catch (error) {
    console.error('Error assigning role:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check if bot has permission to manage roles in a guild
 * 
 * @param guildId - Discord guild/server ID
 * @returns Boolean indicating if bot can manage roles
 */
export async function canManageRoles(guildId: string): Promise<boolean> {
  const client = getDiscordClient();
  
  try {
    const guild = await client.guilds.fetch(guildId);
    const botMember = await guild.members.fetchMe();
    
    return botMember.permissions.has('ManageRoles');
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}
