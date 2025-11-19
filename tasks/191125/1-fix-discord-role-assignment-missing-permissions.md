---
status: pending
---

# Fix Discord Role Assignment - Missing Permissions Error

## 📊 Description

The Discord role assignment feature is failing with "Discord API error: Missing Permissions" (500 error) when approving applications. This feature was working before the design revamp but is now broken. The issue is **NOT** in the code - the error is coming from Discord's API, indicating a **role hierarchy or bot permissions problem** in the Discord server itself.

**Error Details:**
- Error: "Failed to assign role"
- Message: "Discord API error: Missing Permissions"
- Status: 500 from `/api/discord/assign-role`
- Occurs when: TO approves an application with Discord username

**Key Finding:** Environment variables are unchanged, code has been reverted to working state, so this is a **Discord server configuration issue**.

---

## 🧠 Chain of Thought

### Why This Approach?

The error "Missing Permissions" from Discord API means:
1. ✅ Bot token is valid (otherwise 401 Unauthorized)
2. ✅ Bot is in the server (otherwise "Unknown Guild")
3. ❌ Bot lacks permission to assign THIS SPECIFIC ROLE

According to `/tasks/111125/DISCORD_ARCHITECTURE.md`, there are specific Discord server requirements:

**Role Hierarchy Rule** (Discord Platform Limitation):
- A bot can ONLY assign roles that are positioned LOWER than its own role
- If bot role = position 5, it can only assign roles at position 6, 7, 8...
- If target role is at position 4 or higher, assignment fails with "Missing Permissions"

**Most Likely Cause:**
- Someone moved the "Approved Co-Streamer" role ABOVE the bot's role in Discord server settings
- OR the bot's role was moved DOWN below the target role
- OR bot wasn't invited with MANAGE_ROLES permission

### Key Logic & Patterns

**Discord Role Assignment Flow:**
1. Client calls `/api/discord/assign-role` with `guild_id`, `discord_user_id`, `role_name`
2. API calls `findOrCreateRole(guild_id, roleName)` - finds or creates "Approved Co-Streamer"
3. API calls `addMemberRole(guild_id, userId, roleId)` - assigns role to user
4. Discord validates: Does bot have MANAGE_ROLES + is bot role higher than target role?
5. If NO → Returns "Missing Permissions" error
6. If YES → Role assigned successfully

**Current Code Path:**
- `/web/src/lib/api/applications.ts` - Triggers role assignment on approval
- `/web/src/app/api/discord/assign-role/route.ts` - API endpoint (recently restored)
- `/web/src/lib/discord/rest.ts` - Discord REST API calls

### Critical References

- **Discord Architecture**: `/tasks/111125/DISCORD_ARCHITECTURE.md` — Complete flow and error handling
- **Discord Setup Guide**: `/DISCORD_SETUP_GUIDE.md` — Bot configuration steps
- **Role Assignment API**: `/web/src/app/api/discord/assign-role/route.ts` — Main endpoint
- **Discord REST Client**: `/web/src/lib/discord/rest.ts` — Discord API wrapper
- **Applications API**: `/web/src/lib/api/applications.ts` — Triggers assignment on approval

### Expected Side Effects

**If Fixed:**
- Role assignment works immediately for new approvals
- No code changes needed (this is server config)
- Existing approved applications need manual role assignment or re-approval

**If Role Hierarchy is Wrong:**
- EVERY approval will fail until fixed in Discord
- No error visibility to TO (just console error)
- Streamers won't get roles automatically

### Learning & Insights

- **Key Discovery**: "Missing Permissions" doesn't always mean missing MANAGE_ROLES - it can also mean role hierarchy violation
- **Discord Limitation**: Role hierarchy is STRICT - no exceptions even for admin bots
- **Debugging Insight**: When Discord API errors occur, check Discord server config FIRST before changing code
- **Pattern**: Discord role assignment requires: Token + Permission + Hierarchy + Member exists in server

---

## 📚 KNOWLEDGE BASE

### Core System Paths

| Path | Purpose | Dependencies |
|------|---------|--------------|
| `/web/src/lib/discord/rest.ts` | Discord REST API client | None (pure fetch) |
| `/web/src/app/api/discord/assign-role/route.ts` | Role assignment endpoint | discord/rest.ts |
| `/web/src/lib/api/applications.ts` | Application management | Supabase client |
| `/tasks/111125/DISCORD_ARCHITECTURE.md` | Complete Discord integration docs | N/A |
| `/DISCORD_SETUP_GUIDE.md` | Bot setup instructions | N/A |

### Environment & Configuration

| File | Purpose | Required Variables |
|------|---------|-------------------|
| `/web/.env.local` | Next.js environment config | DISCORD_BOT_TOKEN, NEXT_PUBLIC_DISCORD_CLIENT_ID |
| `/web/.env.example` | Environment template | All Discord vars |

### External Integrations

| Service | Config Path | Documentation |
|---------|-------------|---------------|
| Discord API | `/web/src/lib/discord/rest.ts` | https://discord.com/developers/docs/resources/guild#add-guild-member-role |
| Discord Developer Portal | N/A | https://discord.com/developers/applications |

### Build & Development Tools

| Tool | Config | Command |
|------|--------|---------|
| Next.js | `/web/next.config.js` | `npm run dev` |
| TypeScript | `/web/tsconfig.json` | `npm run build` |

---

## 🎯 Task Groups

### Diagnosis & Investigation
- [ ] **Verify Discord bot is in server** — Check Discord server member list for bot
- [ ] **Check bot permissions** — Server Settings → Roles → Find bot role → Verify MANAGE_ROLES is checked
- [ ] **Check role hierarchy** — Server Settings → Roles → Verify bot role is ABOVE "Approved Co-Streamer" role
- [ ] **Test with Discord API directly** — Use curl/Postman to test role assignment with same credentials
- [ ] **Check Discord bot token validity** — Verify token in Discord Developer Portal hasn't expired

### Discord Server Configuration Fix
- [ ] **Access Discord server** — Log into Discord, navigate to tournament organization's server
- [ ] **Open Server Settings** — Click server name → Server Settings → Roles
- [ ] **Locate bot role** — Find "Viewer.gg Bot" or similar role (created when bot was invited)
- [ ] **Locate target role** — Find "Approved Co-Streamer" role
- [ ] **Check hierarchy** — Bot role MUST be positioned HIGHER (closer to top) than "Approved Co-Streamer"
- [ ] **Drag bot role up** — If bot role is lower, drag it ABOVE the "Approved Co-Streamer" role
- [ ] **Verify MANAGE_ROLES permission** — Click bot role → Permissions → Ensure "Manage Roles" is enabled
- [ ] **Save changes** — Discord saves automatically, but verify no errors appear

### Code Verification
- [ ] **Verify code matches working version** — Compare with commit 819555a (before design revamp)
- [ ] **Check applications.ts** — Ensure it queries discord_configs and passes guild_id, role_name
- [ ] **Check assign-role route** — Ensure it doesn't require service role key (removed my bad changes)
- [ ] **Verify error logging** — Ensure errors are being logged to console for debugging

### Testing & Validation
- [ ] **Test role assignment** — Create test application with Discord username
- [ ] **Approve test application** — Click Approve button in dashboard
- [ ] **Check browser console** — Look for success/error messages
- [ ] **Verify role in Discord** — Check if test user received role in Discord server
- [ ] **Check edge cases** — Test with user not in server, invalid Discord ID, etc.

### Documentation
- [ ] **Document solution** — Add to task file exactly what was wrong and how it was fixed
- [ ] **Update Discord setup guide** — Add troubleshooting section for role hierarchy
- [ ] **Add error handling** — Consider adding better error message when hierarchy is wrong
- [ ] **Create deployment checklist** — Ensure this is checked during bot setup

---

## 📂 FILES CHANGED

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| /web/src/app/api/discord/assign-role/route.ts | Modified (Reverted) | Removed service role client, restored original working code |
| /web/src/lib/api/applications.ts | Modified (Reverted) | Restored original discord_configs query logic |

---

## 🔗 Previously Related Tasks

- /tasks/111125/DISCORD_ARCHITECTURE.md — Original Discord integration architecture
- /tasks/111125/1-finalize-discord-bot-setup.md — Initial bot setup task
- /tasks/111125/3-integrate-discord-role-assignment.md — Role assignment implementation
- /tasks/141125/1-complete-discord-bot-workflow.md — Discord workflow completion
