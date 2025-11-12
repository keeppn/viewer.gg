# Discord OAuth Integration Implementation

## Overview
Successfully implemented Discord OAuth callback handler and bot integration system for viewer.gg, enabling automatic role assignment for approved tournament streamers.

## Files Added/Modified

### API Routes
1. **`web/src/app/api/discord/callback/route.ts`**
   - OAuth2 callback handler
   - Exchanges authorization code for access token
   - Fetches user information and admin guilds
   - Stores integration data in database

2. **`web/src/app/api/webhooks/discord-role-assignment/route.ts`**
   - Webhook handler for automatic role assignment
   - Triggered when tournament applications are approved/rejected
   - Manages role assignment/removal via Discord Bot API

### Services
3. **`web/src/lib/services/discord-integration.service.ts`**
   - Token refresh management (5-minute buffer)
   - Role assignment/removal methods
   - Complete audit trail logging
   - History retrieval functionality
### Database
4. **`supabase/migration_discord_oauth_integration.sql`**
   - Creates `discord_integrations` table for OAuth tokens
   - Creates `discord_role_history` table for audit trail
   - Adds Discord fields to existing tables
   - Implements RLS policies for security
   - Includes automatic timestamp triggers

### Configuration
5. **`web/.env.local`** (Updated)
   - Added `NEXT_PUBLIC_DISCORD_CLIENT_ID`
   - Added `WEBHOOK_SECRET`
   - Discord Bot Token placeholder

## Features Implemented

✅ **OAuth Flow**
- User initiates connection from Discord settings page
- Redirects to Discord authorization
- Callback exchanges code for tokens
- Fetches user info and admin guilds
- Stores integration in database

✅ **Automatic Role Assignment**
- Tournament application approved → Webhook triggered
- Service checks Discord integration settings
- Bot assigns role to streamer in Discord server- Action logged in history table

✅ **Token Management**
- Automatic refresh when tokens expire
- Secure storage with encryption
- Graceful fallback on refresh failure

✅ **Security Features**
- CSRF protection via state parameter
- Webhook secret verification
- RLS policies for data isolation
- Admin permission verification

## Setup Instructions

### 1. Database Setup
```bash
# Apply the migration to your Supabase instance
supabase db push
```

### 2. Discord Application Configuration
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application (or create one)
3. In OAuth2 → General:
   - Add redirect URI: `https://app.viewer.gg/api/discord/callback` (production)
   - Add redirect URI: `http://localhost:3000/api/discord/callback` (development)
4. In Bot section:   - Enable bot
   - Copy the bot token
   - Under Privileged Gateway Intents, enable:
     - SERVER MEMBERS INTENT (required for role management)
   - Generate invite link with permissions:
     - Manage Roles
     - Read Messages/View Channels

### 3. Environment Variables
Update your `.env.local` file:
```env
# Discord OAuth
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_BOT_TOKEN=Bot_your_bot_token_here
WEBHOOK_SECRET=generate_a_secure_random_string
NEXT_PUBLIC_APP_URL=https://app.viewer.gg
```

### 4. Supabase Webhook Configuration
1. Go to Supabase Dashboard → Database → Webhooks
2. Create new webhook:
   - Name: `discord-role-assignment`
   - Table: `tournament_applications`
   - Events: `UPDATE`
   - URL: `https://app.viewer.gg/api/webhooks/discord-role-assignment`
   - Headers: Add `x-webhook-secret: your_webhook_secret`
## Testing Checklist

- [ ] OAuth flow connects successfully
- [ ] Admin guilds are properly filtered
- [ ] Tokens refresh before expiration
- [ ] Role assignment works on approval
- [ ] Role removal works on rejection
- [ ] History is properly logged
- [ ] RLS policies enforce proper access
- [ ] Webhook triggers on application status change

## API Endpoints

- **OAuth Callback**: `GET /api/discord/callback`
- **Role Assignment Webhook**: `POST /api/webhooks/discord-role-assignment`

## Error Handling

The implementation includes comprehensive error handling for:
- OAuth failures (network, invalid tokens)
- Database operation failures
- Discord API rate limits
- Missing user permissions
- Invalid server/role configurations

## Security Considerations

- All tokens encrypted at rest
- HTTPS-only in production- Rate limiting on public endpoints
- Audit trail for all role changes
- Regular token rotation

## Next Steps

1. Deploy to production environment
2. Test OAuth flow end-to-end
3. Configure Discord bot permissions
4. Set up monitoring for webhook failures
5. Implement UI for Discord settings page (already started in previous tasks)

## Deployment Date
December 11, 2025

## Status
✅ Implementation Complete
✅ Ready for Testing
⏳ Awaiting Production Deployment