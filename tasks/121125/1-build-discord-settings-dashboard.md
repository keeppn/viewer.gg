---
status: pending
---

# Build Discord Settings Dashboard UI

## 📊 Description

Building a comprehensive Discord settings dashboard in the Tournament Organizer admin panel that enables:
- OAuth2 flow to connect Discord bot to servers
- Display of connected server information (name, member count, roles)
- Role selection for auto-assignment
- View history of role assignments
- Disconnect/reconnect functionality
- Visual feedback on bot connection status

The dashboard integrates with our existing Discord bot infrastructure (Tasks 1-3 completed) and provides TOs with full control over their Discord integration settings. This includes server selection, role management, and monitoring of automated role assignments for approved streamers.

---

## 🧠 Chain of Thought

### Why This Approach?

We're implementing a client-side OAuth flow because:
- **Security**: No server stores Discord tokens, reducing attack surface
- **UX**: Seamless redirect flow without manual token entry
- **Compliance**: Follows Discord's OAuth2 best practices
- **Scalability**: Each TO manages their own bot connection

Using Supabase as the backend for storing Discord configurations ensures:
- **Consistency**: All settings in one place with RLS protection
- **Audit trail**: Track who connected/disconnected and when
- **Multi-tenancy**: Each organization has isolated Discord settings
- **Reliability**: Leverages existing auth and database infrastructure

### Key Logic & Patterns

**OAuth Flow**:
1. TO clicks "Connect Discord Bot" button
2. Redirect to Discord OAuth2 authorize URL with bot scope
3. Discord redirects back with code parameter
4. Exchange code for guild information
5. Store guild_id and settings in discord_configs table
6. Display success with server information

**State Management**:
- Connection status: Derived from discord_configs presence
- Selected role: Stored in discord_configs.role_id
- Assignment history: Queried from discord_messages table
- Error states: Handled with toast notifications

**Component Architecture**:
- DiscordSettings: Main container component
- ConnectBotButton: OAuth initiation with loading states
- ServerInfo: Display connected guild details
- RoleSelector: Dropdown for available roles
- AssignmentHistory: Table of recent role assignments

### Critical References

- **Discord Config Schema**: /database/schema/discord_configs.sql — Storage structure for guild settings
- **OAuth Constants**: /web/src/lib/discord/constants.ts — Client ID, redirect URLs
- **Role Assignment Service**: /web/src/lib/discord/roleAssignment.ts — Existing backend integration
- **API Routes**: /web/src/app/api/discord/* — Backend endpoints for Discord operations
- **Supabase Types**: /web/src/types/supabase.ts — Generated database types

### Expected Side Effects

**UI Changes**:
- New menu item in TO dashboard sidebar
- Additional page load (~50KB JavaScript)
- Discord API calls on page mount

**Database Impact**:
- Reads from discord_configs on each page load
- Queries discord_messages for history (paginated)
- Updates to discord_configs on role selection

**External Dependencies**:
- Discord OAuth2 service availability
- Discord API for fetching guild/role data
- Browser must support JavaScript (no SSR fallback)

### Learning & Insights

- Discord OAuth2 requires explicit bot permissions in authorize URL
- Guild information comes from the OAuth callback, not API
- Role list must be fetched separately after bot joins server
- Rate limits: 1000 requests per 10 minutes per bot

---

## 📚 KNOWLEDGE BASE

### Core System Paths

| Path | Purpose | Dependencies |
|------|---------|--------------|
| `/web/src/app/(dashboard)/tournaments/[id]/settings/discord/page.tsx` | Discord settings page | Next.js 14, React 18 |
| `/web/src/components/discord/` | Discord UI components | Tailwind CSS, shadcn/ui |
| `/web/src/lib/discord/oauth.ts` | OAuth helper functions | Next.js, Discord API |
| `/web/src/app/api/discord/callback/route.ts` | OAuth callback handler | Supabase, Discord API |
| `/web/src/app/api/discord/roles/route.ts` | Fetch available roles | Discord.js |
| `/web/src/app/api/discord/disconnect/route.ts` | Remove bot connection | Supabase |
| `/database/schema/discord_configs.sql` | Discord settings storage | PostgreSQL |
| `/database/schema/discord_messages.sql` | Assignment history | PostgreSQL |

### Environment & Configuration

| File | Purpose | Required Variables |
|------|---------|-------------------|
| `/web/.env.local` | Local environment | NEXT_PUBLIC_DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET |
| `/web/src/lib/discord/constants.ts` | Discord configuration | Client ID, redirect URLs, scopes |
| `/database/migrations/` | Database schema | discord_configs, discord_messages tables |

### External Integrations

| Service | Config Path | Documentation |
|---------|-------------|---------------|
| Discord OAuth2 | `/web/src/lib/discord/oauth.ts` | https://discord.com/developers/docs/topics/oauth2 |
| Discord API | `/web/src/lib/discord/api.ts` | https://discord.com/developers/docs/reference |
| Supabase Auth | `/web/src/lib/supabase/client.ts` | https://supabase.com/docs/reference/javascript |

### Build & Development Tools

| Tool | Config | Command |
|------|--------|---------|
| Next.js Dev | `/web/next.config.js` | `npm run dev` |
| TypeScript | `/web/tsconfig.json` | `npm run type-check` |
| Tailwind | `/web/tailwind.config.js` | Built with Next.js |
| shadcn/ui | `/web/components.json` | `npx shadcn-ui add` |

---

## 🎯 Task Groups

### [Group 1: OAuth Flow Implementation]
- [ ] **Create OAuth initiation endpoint** — Generate Discord authorize URL with bot scope and permissions
- [ ] **Implement callback handler** — Exchange code for guild information, store in discord_configs
- [ ] **Add error handling** — Handle denied permissions, invalid codes, network failures
- [ ] **Create disconnect endpoint** — Remove bot from guild and clear discord_configs entry

### [Group 2: Dashboard UI Components]
- [ ] **Build settings page layout** — Create page.tsx with proper routing and authentication
- [ ] **Create ConnectBotButton component** — Button with loading states and OAuth redirect
- [ ] **Build ServerInfo component** — Display guild name, icon, member count when connected
- [ ] **Implement RoleSelector component** — Dropdown to choose role for auto-assignment
- [ ] **Add connection status indicator** — Visual feedback for bot online/offline status

### [Group 3: Role Management]
- [ ] **Fetch available roles API** — Get list of roles from connected Discord server
- [ ] **Role selection persistence** — Save selected role_id to discord_configs
- [ ] **Role permission validation** — Ensure bot has permission to assign selected role
- [ ] **Update role assignment service** — Use selected role from discord_configs

### [Group 4: Assignment History]
- [ ] **Create history table component** — Display recent role assignments with pagination
- [ ] **Add filtering options** — Filter by date, status, streamer name
- [ ] **Implement retry mechanism** — Allow manual retry for failed assignments
- [ ] **Add export functionality** — Export assignment history as CSV

### [Group 5: Testing & Polish]
- [ ] **Test OAuth flow end-to-end** — Connect, disconnect, reconnect scenarios
- [ ] **Add loading skeletons** — Better UX during data fetching
- [ ] **Implement error boundaries** — Graceful error handling for React components
- [ ] **Add success toast notifications** — User feedback for all actions
- [ ] **Write component documentation** — Usage examples and props documentation

---

## 📂 FILES CHANGED
<!-- MANDATORY: Update IMMEDIATELY after EVERY file modification -->

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| | | |

---

## 🔗 Previously Related Tasks
<!-- MANDATORY: Link all tasks that influenced this one -->

- /tasks/111125/1-finalize-discord-bot-setup.md — Discord bot configuration and setup
- /tasks/111125/2-add-discord-field-to-application.md — Added Discord User ID collection
- /tasks/111125/3-integrate-discord-role-assignment.md — Backend role assignment implementation
- /tasks/111125/DISCORD_ARCHITECTURE.md — Overall Discord integration architecture