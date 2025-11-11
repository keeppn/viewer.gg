# Discord Bot Architecture - Complete Flow Documentation

## 🎯 System Overview

The viewer.gg Discord bot system enables automatic role assignment for approved co-streamers using a **single bot, multiple servers** architecture. This document provides the complete technical flow from TO onboarding to automatic role assignment.

---

## 🏗️ Architecture Pattern

### Single Bot, Multi-Server Model

```
┌─────────────────────────────────────────┐
│     Viewer.gg Discord Bot (Single)      │
│  (One Bot Instance, Multiple Servers)   │
└─────────────────────────────────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Guild A  │ │ Guild B  │ │ Guild C  │
│ (TO #1)  │ │ (TO #2)  │ │ (TO #3)  │
└──────────┘ └──────────┘ └──────────┘
```

**Key Concept**: One bot application joins multiple Discord servers (guilds). Each tournament organization has their own server, and the bot operates across all of them using stored `guild_id` mappings.

---

## 📋 Database Schema

### discord_configs Table
```sql
CREATE TABLE discord_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  guild_id TEXT NOT NULL UNIQUE,          -- Discord server ID
  guild_name TEXT NOT NULL,                -- Discord server name
  approved_role_id TEXT,                   -- ID of "Approved Co-Streamer" role
  bot_added TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Key Relationships
- `organization_id` → Links to tournament organization
- `guild_id` → Discord server where bot operates
- `approved_role_id` → Role that gets assigned to approved streamers

---

## 🔄 Complete Flow Diagrams

### 1. TO Onboarding Flow (Connect Discord Bot)

```
┌──────────────────────────────────────────────────────────────┐
│ 1. TO Dashboard                                              │
│    ├─ Navigate to Settings > Discord                         │
│    └─ Click "Connect Discord Bot"                            │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. OAuth Authorization URL Generation                        │
│    Frontend constructs URL:                                  │
│    https://discord.com/oauth2/authorize?                     │
│      client_id={DISCORD_BOT_CLIENT_ID}                       │
│      permissions=268435456  (MANAGE_ROLES)                   │
│      redirect_uri={APP_URL}/api/discord/callback            │
│      response_type=code                                      │
│      scope=bot                                               │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Discord Authorization Page                                │
│    ├─ TO logs into Discord (if not logged in)               │
│    ├─ Selects server from dropdown                           │
│    ├─ Reviews permissions (MANAGE_ROLES)│    └─ Clicks "Authorize"                                     │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Discord Redirect to Callback                              │
│    Discord redirects to:                                     │
│    {APP_URL}/api/discord/callback?code=xyz&guild_id=123      │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Callback Handler Processing                               │
│    /web/src/app/api/discord/callback/route.ts               │
│    ├─ Extract code and guild_id from query params           │
│    ├─ Fetch guild info from Discord API                     │
│    ├─ Get organization_id from authenticated session        │
│    └─ Store in discord_configs table                        │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. Role Setup                                                │
│    ├─ Bot connects to guild using bot token                 │
│    ├─ Searches for "Approved Co-Streamer" role             │
│    ├─ Creates role if not found (color: #00D9FF)           │
│    └─ Stores approved_role_id in discord_configs           │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. Success Confirmation                                      │
│    ├─ Redirect TO back to dashboard                         │
│    └─ Show "Discord Bot Connected" success message          │
└──────────────────────────────────────────────────────────────┘
```

---

### 2. Role Assignment Flow (Application Approval)

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Streamer Application Submission                           │
│    ├─ Streamer fills application form                       │
│    ├─ Includes Discord username (optional)                  │
│    └─ Submitted, status = "Pending"                         │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. TO Reviews Application                                    │
│    ├─ TO logs into dashboard                                │
│    ├─ Reviews application details                           │
│    └─ Clicks "Approve" button                               │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Approval API Endpoint                                     │
│    /web/src/app/api/applications/[id]/approve/route.ts      │
│    ├─ Validates TO has permission to approve                │
│    ├─ Updates application status to "Approved"              │
│    └─ Triggers Discord role assignment                      │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Discord Role Assignment Service                           │
│    /web/src/app/api/discord/assign-role/route.ts            │
│    ├─ Extract discord_user_id from application              │
│    ├─ Fetch discord_config for organization                 │
│    ├─ Get guild_id and approved_role_id                     │
│    └─ Call role assignment function                         │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Bot Role Assignment Logic                                 │
│    /web/src/lib/discord/roles.ts                            │
│    ├─ Initialize Discord client with bot token              │
│    ├─ Fetch guild by guild_id                               │
│    ├─ Fetch member by discord_user_id                       │
│    └─ Add approved_role_id to member                        │
└──────────────────────────────────────────────────────────────┘                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. Success/Error Logging                                     │
│    ├─ Log to discord_messages table                         │
│    ├─ Record: application_id, discord_user_id, success     │
│    └─ If error, store error message                         │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. Confirmation                                              │
│    ├─ Show success notification to TO                       │
│    └─ Streamer receives role in Discord server              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Components

### 1. Discord Client Initialization
**File**: `/web/src/lib/discord/bot.ts`

```typescript
import { Client, GatewayIntentBits } from 'discord.js';

let client: Client | null = null;

export async function getDiscordClient(): Promise<Client> {
  if (!client) {
    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
      ]
    });
    await client.login(process.env.DISCORD_BOT_TOKEN);
  }
  return client;
}
```

**Purpose**: Singleton pattern to reuse Discord client connection across API calls. Prevents rate limiting and improves performance.

---

### 2. OAuth Authorization
**File**: `/web/src/lib/discord/oauth.ts`

```typescript
export function getDiscordBotAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_BOT_CLIENT_ID!,
    permissions: '268435456', // MANAGE_ROLES
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'bot'
  });
  
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
```

**Purpose**: Generate OAuth URL for TO to authorize bot addition to their server.

---

### 3. Role Management
**File**: `/web/src/lib/discord/roles.ts`

```typescript
export async function findOrCreateRole(guildId: string): Promise<string> {
  const client = await getDiscordClient();
  const guild = await client.guilds.fetch(guildId);
  
  let role = guild.roles.cache.find(r => r.name === 'Approved Co-Streamer');
  
  if (!role) {
    role = await guild.roles.create({
      name: 'Approved Co-Streamer',
      color: 0x00D9FF,
      permissions: []
    });
  }
  
  return role.id;
}

export async function assignRole(
  guildId: string,
  discordUserId: string,
  roleId: string
): Promise<void> {
  const client = await getDiscordClient();
  const guild = await client.guilds.fetch(guildId);
  const member = await guild.members.fetch(discordUserId);
  await member.roles.add(roleId);
}
```

**Purpose**: Core role management functions for finding/creating roles and assigning them to members.

---

### 4. OAuth Callback Handler
**File**: `/web/src/app/api/discord/callback/route.ts`

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const guildId = searchParams.get('guild_id');
  // Get authenticated user's organization
  const session = await getServerSession();
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', session.user.id)
    .single();
  
  // Fetch guild information from Discord
  const client = await getDiscordClient();
  const guild = await client.guilds.fetch(guildId);
  
  // Find or create role
  const roleId = await findOrCreateRole(guildId);
  
  // Store configuration
  await supabase
    .from('discord_configs')
    .upsert({
      organization_id: org.id,
      guild_id: guildId,
      guild_name: guild.name,
      approved_role_id: roleId
    });
  
  return redirect('/dashboard/settings/discord?success=true');
}
```

**Purpose**: Handle OAuth callback, store guild configuration, and set up role.

---

### 5. Role Assignment API Endpoint
**File**: `/web/src/app/api/discord/assign-role/route.ts`

```typescript
export async function POST(request: Request) {
  const { applicationId } = await request.json();
  
  // Fetch application with discord_user_id
  const { data: application } = await supabase
    .from('applications')
    .select('discord_user_id, tournament_id')
    .eq('id', applicationId)
    .single();
  
  if (!application.discord_user_id) {
    return json({ error: 'No Discord ID provided' }, { status: 400 });
  }
  
  // Fetch discord_config for tournament's organization
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('organization_id')
    .eq('id', application.tournament_id)
    .single();
  
  const { data: config } = await supabase
    .from('discord_configs')
    .select('*')
    .eq('organization_id', tournament.organization_id)
    .single();
  
  if (!config) {
    return json({ error: 'Discord not configured' }, { status: 400 });
  }
  
  try {
    // Assign role
    await assignRole(
      config.guild_id,
      application.discord_user_id,
      config.approved_role_id
    );
    
    // Log success
    await supabase
      .from('discord_messages')
      .insert({
        application_id: applicationId,
        discord_user_id: application.discord_user_id,
        message_type: 'approval',
        success: true
      });
    
    return json({ success: true });
  } catch (error) {
    // Log failure
    await supabase
      .from('discord_messages')
      .insert({
        application_id: applicationId,
        discord_user_id: application.discord_user_id,
        message_type: 'approval',
        success: false,
        error: error.message
      });
    
    return json({ error: error.message }, { status: 500 });
  }
}
```

**Purpose**: API endpoint that handles the actual role assignment when called.

---

## 🚨 Error Scenarios & Handling

### 1. Bot Removed from Server
**Detection**: Discord API returns 404 or "Unknown Guild" error
**Handling**:
- Log error to discord_messages
- Update discord_configs with `bot_removed = true`
- Show warning in TO dashboard: "Discord bot was removed. Reconnect to enable auto-role assignment."

### 2. Insufficient Permissions
**Detection**: Discord API returns 403 or "Missing Permissions" error
**Handling**:
- Log error with permission details
- Show TO: "Bot lacks MANAGE_ROLES permission. Please remove and re-add the bot."

### 3. Member Not in Server
**Detection**: Discord API returns "Unknown Member" error
**Handling**:
- Log warning (not error - this is expected)- Skip role assignment
- Show TO: "Streamer has not joined your Discord server yet. Role will be assigned when they join."

### 4. Role Hierarchy Issue
**Detection**: Discord API returns "Role Hierarchy" error
**Handling**:
- Log error
- Show TO: "Bot's role must be above 'Approved Co-Streamer' role in server settings. Please adjust role order."

### 5. Discord API Rate Limiting
**Detection**: HTTP 429 response with Retry-After header
**Handling**:
- Implement exponential backoff
- Queue failed assignments for retry
- Log rate limit hits

### 6. Discord API Downtime
**Detection**: Connection timeout or 5xx errors
**Handling**:
- Retry with exponential backoff (3 attempts)
- If all retries fail, queue for later processing
- Show TO: "Discord is temporarily unavailable. Role will be assigned automatically when service is restored."

---

## 🔐 Security Considerations

### Bot Token Security
- ✅ Bot token stored in environment variables (server-side only)
- ✅ Never exposed to client/browser
- ✅ Never committed to git repository
- ✅ Regenerate immediately if accidentally exposed

### Permission Scope
- ✅ Bot only requests MANAGE_ROLES permission (minimal scope)
- ✅ Cannot read messages, access channels, or perform other actions
- ✅ Role assignment is the ONLY action bot can perform

### Guild ID Validation
- ✅ Validate that organization owns the guild_id being accessed
- ✅ Prevent one TO from assigning roles in another TO's server
- ✅ Check organization_id matches authenticated user

### Rate Limiting
- ✅ Discord enforces 50 requests/second global limit
- ✅ Implement queue system for bulk approvals
- ✅ Add rate limit buffer to avoid hitting Discord limits

---

## 📊 Data Flow Summary

### Configuration Storage
```
discord_configs table:
{
  organization_id: "uuid-of-tournament-org",
  guild_id: "123456789012345678",           // Discord server ID
  guild_name: "Tournament Org Discord",
  approved_role_id: "987654321098765432",   // Role ID for "Approved Co-Streamer"
  bot_added: "2025-11-11T14:00:00Z"
}
```

### Application with Discord ID
```
applications table:
{
  id: "uuid",
  tournament_id: "uuid",
  streamer_id: "uuid",
  discord_user_id: "111222333444555666",    // Streamer's Discord user ID
  status: "Approved",
  ...
}
```

### Role Assignment Log
```
discord_messages table:
{
  application_id: "uuid",
  discord_user_id: "111222333444555666",
  message_type: "approval",
  success: true,
  error: null,
  created_at: "2025-11-11T14:05:00Z"
}
```

---

## 🎯 Implementation Checklist

### Setup Phase (Completed)
- [x] Discord Application created
- [x] Bot token obtained
- [x] Server Members Intent enabled
- [x] Redirect URIs configured
- [x] Environment variables set

### Integration Phase (Pending)
- [ ] Add Discord username field to application form
- [ ] Update approval API to trigger role assignment
- [ ] Build Discord settings UI in TO dashboard
- [ ] Test OAuth flow end-to-end
- [ ] Test role assignment with real Discord server

### Production Phase (Pending)
- [ ] Add production redirect URI to Discord portal
- [ ] Set production environment variables
- [ ] Deploy to production
- [ ] Monitor discord_messages for errors
- [ ] Set up alerts for high failure rates

---

## 📚 References

- **Discord Developer Portal**: https://discord.com/developers/applications
- **Discord Bot Guide**: https://discordjs.guide/
- **OAuth2 Docs**: https://discord.com/developers/docs/topics/oauth2
- **discord.js API**: https://discord.js.org/docs/packages/discord.js/14.16.3
- **Permissions Calculator**: https://discordapi.com/permissions.html

---

**Last Updated**: November 11, 2025
**Status**: Architecture Complete, Ready for Implementation