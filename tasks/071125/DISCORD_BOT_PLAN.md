# Discord Bot Auto-Role Assignment - Implementation Plan

## 🎯 Overview

Implement a Discord bot that automatically assigns the "Approved Co-Streamer" role to streamers when TOs approve their applications. The system must be **zero-maintenance** for TOs after initial setup.

---

## 📋 High-Level Plan

### Phase 1: Discord Bot Setup (30 minutes)
1. **Create Discord Application** on Discord Developer Portal
2. **Get credentials**: client_id, client_secret, bot_token
3. **Configure OAuth2** redirect URI: `{APP_URL}/api/discord/callback`
4. **Calculate permission integer** for MANAGE_ROLES: `268435456`
5. **Add to environment variables** in `.env.local` and `.env.production`

### Phase 2: Database Schema (20 minutes)
```sql
-- Add Discord ID storage to applications
ALTER TABLE applications ADD COLUMN discord_user_id TEXT;

-- Add role tracking to discord_configs
ALTER TABLE discord_configs ADD COLUMN approved_role_id TEXT;

-- Create database trigger for auto-assignment
CREATE OR REPLACE FUNCTION notify_application_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Approved' AND OLD.status != 'Approved' THEN
    -- Call role assignment function
    PERFORM assign_discord_role(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_application_approved
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_approval();
```

### Phase 3: Core Bot Implementation (2-3 hours)

**Architecture**:
```
TO clicks "Connect Discord Bot"
  ↓
OAuth2 Flow → Discord Authorization Page
  ↓
TO selects server + authorizes
  ↓
Discord redirects to /api/discord/callback
  ↓
Exchange code for guild info
  ↓
Store in discord_configs table
  ↓
Bot finds/creates "Approved Co-Streamer" role
  ↓
Store role_id in discord_configs
```

**Files to Create**:
```
/web/src/lib/discord/
├── bot.ts              # Discord client initialization
├── oauth.ts            # OAuth2 authorization flow
└── roles.ts            # Role management (find/create/assign)

/web/src/app/api/discord/
├── callback/route.ts   # Handle OAuth redirect
└── assign-role/route.ts # Manual/triggered role assignment

/web/src/app/dashboard/settings/
└── discord/page.tsx    # Discord settings UI
```

### Phase 4: Role Assignment Logic (1-2 hours)

**Flow When Application Approved**:
```
1. Database trigger fires on applications.status = 'Approved'
2. Extract discord_user_id from application.streamer JSONB
3. Fetch discord_config for tournament's organization
4. Initialize Discord client with bot_token
5. Call guild.members.fetch(discord_user_id)
6. Find or create "Approved Co-Streamer" role
7. Assign role: member.roles.add(role_id)
8. Log to discord_messages table (success/failure)
```

**Error Handling**:
- ✅ Member not in Discord server → Log warning, skip
- ✅ Bot lacks permissions → Show error to TO in UI
- ✅ Discord API down → Retry with exponential backoff
- ✅ Bot kicked from server → Detect and notify TO

### Phase 5: Dashboard UI (1-2 hours)

**Settings Page** (`/dashboard/settings/discord`):
- "Connect Discord Bot" button → Triggers OAuth2 flow
- Display connected server: guild_name, guild_id
- Show role status: "Approved Co-Streamer" role_id
- Recent role assignments table (from discord_messages)
- "Disconnect" button
- Manual role assignment button (for retroactive approval)

### Phase 6: Application Form Update (30 minutes)
- Add "Discord Username" field to application form
- Store as `discord_user_id` in applications table
- Make field **optional** (some streamers may not have Discord)
- Add validation: Discord ID format (e.g., `username#1234` or user ID `123456789012345678`)

---

## 🔧 Technical Implementation Details

### Discord OAuth2 Authorization URL
```typescript
const DISCORD_OAUTH_URL = `https://discord.com/oauth2/authorize?` +
  `client_id=${DISCORD_BOT_CLIENT_ID}` +
  `&permissions=268435456` + // MANAGE_ROLES
  `&redirect_uri=${encodeURIComponent(redirectUri)}` +
  `&response_type=code` +
  `&scope=bot%20applications.commands`;
```

### Token Exchange
```typescript
const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: DISCORD_BOT_CLIENT_ID,
    client_secret: DISCORD_BOT_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: redirectUri
  })
});
```

### Role Assignment with Error Handling
```typescript
import { Client, GatewayIntentBits } from 'discord.js';

async function assignApprovedRole(
  guildId: string,
  discordUserId: string,
  applicationId: string
) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
  });

  await client.login(process.env.DISCORD_BOT_TOKEN);

  try {
    const guild = await client.guilds.fetch(guildId);
    
    // Find or create role
    let role = guild.roles.cache.find(r => r.name === 'Approved Co-Streamer');
    if (!role) {
      role = await guild.roles.create({
        name: 'Approved Co-Streamer',
        color: 0x00D9FF, // viewer.gg brand color
        permissions: []
      });
    }

    // Assign to member
    const member = await guild.members.fetch(discordUserId);
    await member.roles.add(role.id);

    // Log success
    await logDiscordMessage({
      application_id: applicationId,
      discord_user_id: discordUserId,
      message_type: 'approval',
      success: true
    });

    return { success: true };
  } catch (error) {
    // Log failure
    await logDiscordMessage({
      application_id: applicationId,
      discord_user_id: discordUserId,
      message_type: 'approval',
      success: false,
      error: error.message
    });

    return { success: false, error: error.message };
  } finally {
    await client.destroy();
  }
}
```

---

## ✅ Success Criteria

1. ✅ TO can connect Discord bot with 2 clicks (button + Discord authorization)
2. ✅ Bot automatically creates "Approved Co-Streamer" role if not present
3. ✅ When TO approves application, role is assigned within 2 seconds
4. ✅ System handles errors gracefully (member not in server, bot kicked, etc.)
5. ✅ Dashboard shows connection status and recent role assignments
6. ✅ Zero manual work required from TO after initial setup

---

## 🚀 Deployment Checklist

- [ ] Create Discord Application on Discord Developer Portal
- [ ] Add production redirect URI to Discord OAuth2 settings
- [ ] Add environment variables to production environment
- [ ] Test OAuth flow in production
- [ ] Test role assignment with real Discord server
- [ ] Monitor discord_messages table for errors
- [ ] Document TO setup process in help docs

---

## 📚 References

- **Discord Developer Portal**: https://discord.com/developers/applications
- **Discord OAuth2 Docs**: https://discord.com/developers/docs/topics/oauth2
- **discord.js Documentation**: https://discord.js.org/
- **Permissions Calculator**: https://discordapi.com/permissions.html
- **Bot Best Practices**: https://discord.com/developers/docs/topics/community-resources#bots-and-apps

---

## 📝 Notes

- **Permission Integer**: `268435456` = MANAGE_ROLES only
- **Bot Role Hierarchy**: Bot's role must be **above** "Approved Co-Streamer" role in server settings
- **Rate Limits**: Discord API allows 50 requests/second; implement queue for bulk approvals
- **Alternative**: If database trigger doesn't work, use API endpoint called from application approval logic
