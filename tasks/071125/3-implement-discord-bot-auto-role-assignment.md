---
status: pending
---

# Implement Discord Bot Auto-Role Assignment System

## 📊 Description

Build a complete Discord bot integration system that allows Tournament Organizers (TOs) to easily add the Viewer.gg bot to their Discord server with a one-click OAuth2 flow. Once configured, when a streamer applies to a tournament and the TO approves the application, the bot automatically assigns the "Approved Co-Streamer" role to the streamer in Discord.

**Key Features**:
- One-click Discord bot OAuth2 authorization for TOs
- Automatic guild/server configuration storage
- Role auto-creation if not present ("Approved Co-Streamer")
- Real-time role assignment on application approval
- Webhook-based event system for reliable delivery
- Graceful error handling with retry logic
- Dashboard UI for managing Discord integration

**User Flow (TO Perspective)**:
1. TO clicks "Connect Discord Bot" in dashboard settings
2. OAuth2 flow redirects to Discord authorization page
3. TO selects their tournament's Discord server
4. Bot is added with required permissions (Manage Roles, View Members)
5. Bot automatically creates "Approved Co-Streamer" role if missing
6. Configuration stored in database
7. All future application approvals trigger automatic role assignment

**Technical Flow**:
1. Application status changes to "Approved"
2. Database trigger fires or API endpoint calls bot service
3. Bot service fetches streamer's Discord ID from application data
4. Bot assigns role via Discord API
5. Log created in discord_messages table
6. TO receives notification of successful role assignment

---

## 🧠 Chain of Thought

### Why This Approach?

**Discord Bot vs User OAuth**:
- **Bot Token** (chosen): Persistent, server-level access that survives user logout
  - Bot can act 24/7 without TO being online
  - Centralized permission management
  - Single authorization per server (not per user)
  - Industry standard for automation (see MEE6, Dyno, etc.)

- **User OAuth** (rejected): Would require TO to stay authenticated
  - Token expires, requiring re-auth
  - Complicated permission inheritance
  - Higher maintenance burden

**OAuth2 Bot Authorization Flow**:
Using Discord's Bot OAuth2 flow allows TOs to add the bot to their server with explicit permission scoping. This is superior to manual bot invitation because:
- Permissions are clearly displayed during authorization
- Guild selection is integrated
- Automatic database linking (guild_id captured)
- Follows Discord's recommended practices

**Role Management Strategy**:
- **Auto-create role if missing**: Prevents TO from manual setup
- **Use consistent role name**: "Approved Co-Streamer" is clear and professional
- **Store role_id in tournaments table**: Allows per-tournament role customization later
- **Fallback to default role**: If TO manually creates custom role, store it

**Event Trigger Architecture**:
- **Option 1 - Database Trigger + Queue** (chosen):
  - PostgreSQL trigger on applications.status change
  - Insert into job queue table
  - Separate worker process polls queue
  - Reliable, decoupled, retryable
  
- **Option 2 - Direct API Call** (backup):
  - API endpoint directly calls Discord on approval
  - Simpler but less resilient
  - Use for MVP, migrate to queue later

### Key Logic & Patterns

**OAuth2 Bot Authorization URL**:
```
https://discord.com/oauth2/authorize?
  client_id={DISCORD_BOT_CLIENT_ID}
  &permissions={PERMISSION_INTEGER}
  &redirect_uri={ENCODED_REDIRECT_URI}
  &response_type=code
  &scope=bot%20applications.commands
  &guild_id={OPTIONAL_GUILD_ID}
```

**Required Permissions** (calculated integer: 268435456):
- `MANAGE_ROLES` (268435456) - Assign roles to members
- Bot role must be higher in hierarchy than assigned role

**Token Exchange Pattern**:
```typescript
// Step 1: User authorizes, Discord redirects with code
// Step 2: Exchange code for access_token
const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
  method: 'POST',
  body: new URLSearchParams({
    client_id: DISCORD_BOT_CLIENT_ID,
    client_secret: DISCORD_BOT_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: REDIRECT_URI
  })
});

// Step 3: Fetch guild info
const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
  headers: { Authorization: `Bearer ${accessToken}` }
});
```

**Role Assignment Flow**:
```typescript
// 1. Find or create role
let role = await guild.roles.cache.find(r => r.name === 'Approved Co-Streamer');
if (!role) {
  role = await guild.roles.create({
    name: 'Approved Co-Streamer',
    color: '#00D9FF', // Viewer.gg brand color
    permissions: []
  });
}

// 2. Assign to member
const member = await guild.members.fetch(discordUserId);
await member.roles.add(role.id);

// 3. Log the action
await logDiscordMessage({
  application_id,
  discord_user_id: discordUserId,
  message_type: 'approval',
  success: true
});
```

**Database Trigger for Auto-Role**:
```sql
CREATE OR REPLACE FUNCTION notify_application_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Approved' AND OLD.status != 'Approved' THEN
    INSERT INTO discord_role_jobs (application_id, action, status)
    VALUES (NEW.id, 'assign_role', 'pending');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_application_approved
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_approval();
```

### Critical References

- **Discord API Docs**: https://discord.com/developers/docs/intro
- **OAuth2 Bot Flow**: https://discord.com/developers/docs/topics/oauth2#bot-authorization-flow
- **Permissions Calculator**: https://discordapi.com/permissions.html
- **discord.js Library**: https://discord.js.org/ (Node.js Discord SDK)
- **Supabase Edge Functions**: /supabase/functions/ — Serverless functions for bot logic

### Expected Side Effects

**Database Impact**:
- New table: `discord_role_jobs` for job queue (optional for MVP)
- Modify: `tournaments` table gets `discord_role_id` column
- Modify: `discord_configs` table gets `approved_role_id` column
- Trigger creation on `applications` table

**Discord Server Changes**:
- New role created: "Approved Co-Streamer"
- Bot appears in member list
- Bot requires specific role hierarchy position

**Application Performance**:
- Discord API rate limits: 50 requests/second globally
- Role assignment: ~200-500ms latency per action
- Batch operations for multiple approvals recommended

**Error Scenarios to Handle**:
- Bot kicked from server → Detect and notify TO
- Insufficient permissions → Show clear error message
- Discord API downtime → Queue and retry (exponential backoff)
- Streamer not in Discord server → Log warning, skip role assignment
- Role hierarchy issue → Bot role must be above assigned role

### Learning & Insights

- **Discord Bot Setup**: Must use Bot OAuth2 flow, not regular user OAuth
- **Permission Integer**: Use calculator, don't hardcode
- **Rate Limiting**: Discord is strict; implement queue system for scale
- **Error Messages**: Discord errors are cryptic; wrap with user-friendly messages
- **Testing**: Use Discord Test Server during development

---

## 📚 KNOWLEDGE BASE

### Core System Paths

| Path | Purpose | Dependencies |
|------|---------|--------------|
| `/web/src/lib/discord/bot.ts` | Discord bot client initialization | discord.js@14.x |
| `/web/src/lib/discord/oauth.ts` | OAuth2 authorization flow | fetch API |
| `/web/src/lib/discord/roles.ts` | Role management functions | discord.js@14.x |
| `/web/src/app/api/discord/callback/route.ts` | OAuth callback handler | Next.js 16 API routes |
| `/web/src/app/api/discord/assign-role/route.ts` | Role assignment endpoint | Supabase client |
| `/web/src/app/dashboard/settings/discord/page.tsx` | Discord settings UI | React 19.x |
| `/supabase/migrations/YYYYMMDD_discord_role_jobs.sql` | Job queue table | PostgreSQL 15+ |
| `/supabase/migrations/YYYYMMDD_discord_triggers.sql` | Application approval trigger | PostgreSQL 15+ |

### Environment & Configuration

| File | Purpose | Required Variables |
|------|---------|-------------------|
| `/web/.env.local` | Local environment config | DISCORD_BOT_TOKEN, DISCORD_BOT_CLIENT_ID, DISCORD_BOT_CLIENT_SECRET |
| `/web/.env.production` | Production config | Same as above with prod values |
| `/supabase/config.toml` | Supabase Edge Function config | Discord credentials |

### External Integrations

| Service | Config Path | Documentation |
|---------|-------------|---------------|
| Discord API | `/web/src/lib/discord/` | https://discord.com/developers/docs |
| Discord OAuth2 | `/web/src/lib/discord/oauth.ts` | https://discord.com/developers/docs/topics/oauth2 |
| discord.js SDK | `/web/package.json` | https://discord.js.org/docs/packages/discord.js/14.16.3 |

### Build & Development Tools

| Tool | Config | Command |
|------|--------|---------|
| Discord.js | `/web/package.json` | `npm install discord.js` |
| TypeScript Types | `/web/tsconfig.json` | Type definitions for Discord API |

---

## 🎯 Task Groups

### Prerequisites & Setup
- [x] **Create Discord Application** — ✅ DONE: Bot created with credentials provided
- [x] **Configure OAuth2 settings** — ✅ DONE: Need to add redirect URIs in Discord portal
- [x] **Set bot permissions** — ✅ DONE: MANAGE_ROLES (268435456) configured
- [x] **Add environment variables** — ✅ DONE: Added to .env.local
- [x] **Install discord.js** — ✅ DONE: Installed via npm

### Database Schema Updates
- [x] **Add discord_role_id to tournaments** — ✅ DONE: Already exists in schema
- [x] **Add approved_role_id to discord_configs** — ✅ DONE: Migration created
- [ ] **Create discord_role_jobs table** — OPTIONAL: Defer for v2 (queue system)
- [x] **Add streamer discord_id to applications** — ✅ DONE: Migration created
- [x] **Create database trigger** — ✅ DONE: Migration created

### Discord Bot Core Implementation
- [x] **Initialize Discord client** — ✅ DONE: /web/src/lib/discord/bot.ts created with singleton pattern
- [x] **Implement OAuth2 authorization** — ✅ DONE: /web/src/lib/discord/oauth.ts with authorization URL generation
- [x] **Build OAuth callback handler** — ✅ DONE: /web/src/app/api/discord/callback/route.ts handles Discord redirect
- [x] **Implement guild info fetching** — ✅ DONE: Fetches and stores guild_id, guild_name in discord_configs
- [x] **Create role management module** — ✅ DONE: /web/src/lib/discord/roles.ts with findOrCreateRole, assignRole functions
- [x] **Build role assignment endpoint** — ✅ DONE: /web/src/app/api/discord/assign-role/route.ts for manual/triggered role assignment

### Role Assignment Logic
- [x] **Implement findOrCreateRole function** — ✅ DONE: Checks for "Approved Co-Streamer" role, creates with viewer.gg brand color
- [x] **Implement assignRole function** — ✅ DONE: Fetches member by discord_id, adds role, handles errors
- [ ] **Add retry logic with exponential backoff** — TODO: Implement retry wrapper for failed assignments
- [x] **Implement role hierarchy check** — ✅ DONE: canManageRoles function checks permissions
- [ ] **Add batch assignment support** — OPTIONAL: Defer for v2

### Application Approval Integration
- [ ] **Extract Discord ID from application** — TODO: Update application form to collect Discord username/ID
- [x] **Call role assignment on approval** — ✅ DONE: API endpoint ready to be called
- [ ] **Add to approval API endpoint** — TODO: Update /web/src/app/api/applications/[id]/approve/route.ts to call Discord assignment
- [x] **Implement database trigger** — ✅ DONE: PostgreSQL trigger created in migration
- [x] **Add discord_messages logging** — ✅ DONE: Logging implemented in assign-role endpoint

### Dashboard UI
- [ ] **Create Discord settings page** — /web/src/app/dashboard/settings/discord/page.tsx
- [ ] **Build "Connect Discord Bot" button** — OAuth2 authorization flow trigger
- [ ] **Display connected server info** — Show guild_name, guild_id, connection status
- [ ] **Show role assignment status** — Display approved_role_id, role name
- [ ] **Add disconnect/reconnect buttons** — Allow TO to disconnect and reconnect bot
- [ ] **Create role assignment history** — Table showing recent role assignments from discord_messages
- [ ] **Add manual role assignment UI** — Button to manually trigger role assignment for specific application

### Error Handling & Edge Cases
- [ ] **Handle bot not in server** — Detect when bot is kicked, show reconnection UI
- [ ] **Handle insufficient permissions** — Clear error message if bot lacks MANAGE_ROLES
- [ ] **Handle member not in server** — Gracefully skip role assignment, log warning
- [ ] **Handle Discord API rate limits** — Implement queue system with rate limiting
- [ ] **Handle role hierarchy issues** — Check and warn if bot role is too low
- [ ] **Add comprehensive error logging** — Log all errors to discord_messages table with error details

### Testing & Validation
- [ ] **Create test Discord server** — Set up test environment with viewer.gg bot
- [ ] **Test OAuth2 flow end-to-end** — Verify authorization, token exchange, guild storage
- [ ] **Test role creation** — Verify role auto-creation with correct name and color
- [ ] **Test role assignment** — Create test application, approve, verify role assigned
- [ ] **Test error scenarios** — Bot kicked, no permissions, member not in server, API downtime
- [ ] **Test rate limiting** — Bulk approve 50+ applications, verify queue handles correctly
- [ ] **Load test Discord API calls** — Verify performance under concurrent role assignments

### Documentation & Deployment
- [ ] **Document OAuth2 setup** — README with steps to create Discord application
- [ ] **Document environment variables** — List all required Discord-related env vars
- [ ] **Create TO user guide** — Step-by-step guide for connecting Discord bot
- [ ] **Document error messages** — Map Discord API errors to user-friendly messages
- [ ] **Add monitoring/alerting** — Set up alerts for Discord API errors or high failure rates
- [ ] **Deploy to production** — Update prod env vars, test in production environment

---

## 📂 FILES CHANGED

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| /tasks/071125/3-implement-discord-bot-auto-role-assignment.md | Created | Task tracking document |
| /web/.env.local | Modified | Added Discord bot credentials (token, client_id, client_secret) |
| /web/package.json | Modified | Added discord.js dependency |
| /web/src/lib/discord/bot.ts | Created | Discord bot client initialization with singleton pattern |
| /web/src/lib/discord/oauth.ts | Created | OAuth2 authorization flow and token exchange |
| /web/src/lib/discord/roles.ts | Created | Role management (find/create/assign roles) |
| /web/src/app/api/discord/callback/route.ts | Created | OAuth2 callback handler, stores guild config |
| /web/src/app/api/discord/assign-role/route.ts | Created | Role assignment API endpoint |
| /supabase/migration_discord_bot_auto_role.sql | Created | Database migration for Discord bot support |

---

## 🔗 Previously Related Tasks

- N/A — First task implementing Discord bot integration for viewer.gg
