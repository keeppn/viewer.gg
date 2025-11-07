/**
 * Discord OAuth2 Authorization Flow
 * 
 * Handles the OAuth2 flow for adding the bot to Discord servers.
 * TOs use this to authorize the bot with required permissions.
 */

import { getBotClientId } from './bot';

/**
 * Required permissions for the bot
 * MANAGE_ROLES (268435456) - Assign roles to members
 */
const REQUIRED_PERMISSIONS = 268435456;

/**
 * OAuth2 scopes
 */
const SCOPES = ['bot', 'applications.commands'];

/**
 * Generate Discord OAuth2 authorization URL
 * 
 * @param redirectUri - The callback URL after authorization
 * @param state - Optional state parameter for CSRF protection
 * @returns Complete authorization URL
 */
export function getAuthorizationUrl(
  redirectUri: string,
  state?: string
): string {
  const clientId = getBotClientId();
  
  const params = new URLSearchParams({
    client_id: clientId,
    permissions: REQUIRED_PERMISSIONS.toString(),
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
  });

  
  if (state) {
    params.append('state', state);
  }

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * 
 * @param code - Authorization code from Discord callback
 * @param redirectUri - Same redirect URI used in authorization
 * @returns Access token response
 */
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
) {
  const clientId = getBotClientId();
  const clientSecret = process.env.DISCORD_BOT_CLIENT_SECRET;

  if (!clientSecret) {
    throw new Error('DISCORD_BOT_CLIENT_SECRET is not configured');
  }

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange code: ${errorText}`);
  }

  return response.json();
}

/**
 * Fetch guild information using access token
 * 
 * @param accessToken - OAuth2 access token
 * @returns User's guilds where bot was added
 */
export async function fetchGuilds(accessToken: string) {
  const response = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch guilds: ${errorText}`);
  }

  return response.json();
}
