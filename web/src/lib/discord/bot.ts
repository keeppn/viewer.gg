/**
 * Discord Bot Client Initialization
 * 
 * This module manages the Discord bot client instance with proper
 * singleton pattern to avoid multiple client connections.
 */

import { Client, GatewayIntentBits } from 'discord.js';

let client: Client | null = null;

/**
 * Initialize or get existing Discord bot client
 * Uses singleton pattern to prevent multiple instances
 */
export function getDiscordClient(): Client {
  if (client) {
    return client;
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  
  if (!botToken) {
    throw new Error('DISCORD_BOT_TOKEN environment variable is not set');
  }

  // Create new client with required intents
  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,           // Access to guild/server info
      GatewayIntentBits.GuildMembers,     // Access to member info (required for role assignment)
    ],
  });

  // Login to Discord
  client.login(botToken).catch((error) => {
    console.error('Failed to login Discord bot:', error);
    client = null; // Reset on failure
    throw error;
  });

  // Event handlers
  client.once('ready', () => {
    console.log(`✅ Discord bot logged in as ${client?.user?.tag}`);
  });

  client.on('error', (error) => {
    console.error('Discord bot error:', error);
  });

  return client;
}

/**
 * Check if bot is ready and connected
 */
export function isBotReady(): boolean {
  return client !== null && client.isReady();
}

/**
 * Get bot client ID from environment
 */
export function getBotClientId(): string {
  const clientId = process.env.DISCORD_BOT_CLIENT_ID;
  
  if (!clientId) {
    throw new Error('DISCORD_BOT_CLIENT_ID environment variable is not set');
  }
  
  return clientId;
}

/**
 * Get bot client secret from environment
 */
export function getBotClientSecret(): string {
  const clientSecret = process.env.DISCORD_BOT_CLIENT_SECRET;
  
  if (!clientSecret) {
    throw new Error('DISCORD_BOT_CLIENT_SECRET environment variable is not set');
  }
  
  return clientSecret;
}
