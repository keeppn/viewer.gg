---
status: pending
---

# Complete Discord Bot Workflow - DM Notifications Implementation

## 📊 Description

Implement the final missing piece of the Discord bot workflow: **Direct Message notifications** to approved streamers. The flow is mostly complete - TOs can create tournaments with custom forms, streamers can apply with Discord User IDs, and role assignment works automatically on approval. The only missing piece is sending a welcome DM to the approved streamer.

**Current State (✅ COMPLETE):**
1. ✅ TO creates tournament with custom application form builder (ManageTournamentForm.tsx)
2. ✅ Streamer fills application form with Discord User ID field (apply/[tournamentId]/page.tsx)
3. ✅ TO approves application from dashboard
4. ✅ System automatically assigns "Approved Co-streamers" role (roleAssignment.ts)

**Missing Feature (❌ TODO):**
5. ❌ System sends welcome DM notification to approved streamer

**Implementation Required:**
- Create Discord DM sending service with retry logic
- Integrate DM notification into approval flow after role assignment
- Store DM status in discord_messages table for audit trail
- Handle edge cases (DMs disabled, rate limits, user not found)
- Test end-to-end flow with real Discord server

**Success Criteria:**
- Approved streamers receive personalized DM with tournament details
- DM failures don't block approval process (non-blocking)
- All DM attempts logged to database with status
- Graceful handling when user has DMs disabled
- Comprehensive error handling and retry logic

---

## 🧠 Chain of Thought

### Why This Approach?

**DM vs Channel Notifications:**
Direct Messages are superior to channel notifications because:
- **Personal engagement**: DMs feel more personal and get higher attention
- **No server membership required**: Can DM users even before they join the Discord server
- **Privacy**: Approval details remain private, not broadcast to entire server
- **Discord User ID is sufficient**: Only need the 17-19 digit User ID, no guild membership check needed
- **Immediate delivery**: DMs arrive instantly without waiting for user to check channels

**Non-Blocking Architecture Critical:**
The approval flow MUST succeed even if Discord fails because:
- Network issues shouldn't prevent business operations
- Discord API can be temporarily unavailable
- User might have DMs disabled (privacy setting)
- Rate limits could prevent immediate sending
- Core business logic (approval) is more important than Discord notification

**Why Separate Service:**
Creating a dedicated `sendDiscordDM` service (similar to existing `assignDiscordRole`) because:
- **Single Responsibility**: One service = one job = easier testing
- **Reusability**: Can be called from rejection flow, reminder flows, etc.
- **Retry logic**: Centralized exponential backoff pattern
- **Audit trail**: Consistent logging structure
- **Error handling**: Unified approach to Discord API errors

### Key Logic & Patterns

**DM Message Template:**
```typescript
const welcomeMessage = `
🎉 **Congratulations!** Your application has been approved!

**Tournament:** ${tournament.title}
**Game:** ${tournament.game}  
**Dates:** ${formatDate(tournament.start_date)} - ${formatDate(tournament.end_date)}

**What's Next:**
✅ You've been assigned the "Approved Co-streamer" role
🎮 Join the tournament Discord server if you haven't already
📢 Check #announcements for stream schedules and guidelines
📋 Review co-streaming rules and requirements

**Questions?** 
Contact the tournament organizers directly in the Discord server.

Good luck with your streams! 🚀
`;
```

**Service Architecture:**
```typescript
// New file: /web/src/lib/discord/directMessage.ts
interface SendDMParams {
  userId: string;           // Discord User ID (snowflake)
  message: string;          // DM content
  applicationId: string;    // For audit logging
  tournamentId: string;     // For audit logging
}

interface DMResult {
  success: boolean;
  error?: string;
  attempt: number;          // Which retry attempt succeeded
  messageId?: string;       // Discord message ID if successful
}

async function sendDiscordDM(params: SendDMParams): Promise<DMResult>
```

**Retry Strategy (matching existing pattern):**
```
Attempt 1: Immediate (0ms delay)
Attempt 2: After 2s delay  
Attempt 3: After 4s delay (6s total)
Max total time: ~6-7 seconds before giving up
```

**Error Handling Categories:**
```typescript
if (error.code === 50007) {
  // Cannot send messages to this user (DMs disabled)
  return { success: false, skipped: true, skipReason: 'User has DMs disabled' };
} else if (error.code === 429) {
  // Rate limited - wait and retry
  await sleep(error.retry_after * 1000);
  return retry();
} else if (error.code === 10013) {
  // Unknown User (invalid User ID)
  return { success: false, error: 'Invalid Discord User ID' };
} else {
  // Unknown error - log and continue
  return { success: false, error: error.message };
}
```

**Database Logging:**
```sql
-- Extend discord_messages table (if needed)
INSERT INTO discord_messages (
  application_id,
  tournament_id,
  discord_user_id,
  message_type,  -- 'role_assignment' or 'dm_notification'
  status,        -- 'sent', 'failed', 'skipped'
  error_message,
  attempts,
  sent_at
) VALUES (...)
```

### Critical References

- **Existing Role Assignment**: `/web/src/lib/discord/roleAssignment.ts` — Pattern to replicate for DMs
- **Approval API**: `/web/src/app/api/applications/[id]/approve/route.ts` — Where to integrate DM sending
- **Discord REST API**: `/web/src/lib/discord/rest.ts` — Existing Discord API utilities
- **Discord Config Schema**: `/supabase/migration_discord_oauth_integration.sql` — discord_messages table structure
- **Application Types**: `/web/src/types/index.ts` — Application & Tournament interfaces
- **Discord Bot Token**: `/.env.local` — DISCORD_BOT_TOKEN environment variable
- **Discord API Docs**: https://discord.com/developers/docs/resources/user#create-dm — Official DM endpoint docs

### Expected Side Effects

**Performance Impact:**
- DM sending adds 200-500ms to approval flow (non-blocking, doesn't delay response)
- Database: +1 row to discord_messages per approval
- Discord API: +2 requests per approval (create DM channel + send message)
- Memory: Negligible (~5KB per DM in retry queue)

**No Breaking Changes:**
- All changes are additive
- Approval flow remains unchanged if DM fails
- Backwards compatible with existing approvals

**Security Considerations:**
- Bot token never exposed to frontend
- Message content sanitized (no markdown injection)
- Rate limiting: Respect Discord's 1 DM/second per user limit
- User IDs validated before API calls

**User Experience:**
- Streamers receive immediate notification of approval
- Clear next steps provided in message
- Failure messages logged but don't interrupt flow
- TO sees DM status in approval response

### Learning & Insights

- **Discovery**: Discord DMs require creating a DM channel first, then sending message (2-step process)
- **Gotcha**: Discord error code 50007 ("Cannot send messages to this user") happens when user has DMs from server members disabled
- **Pattern**: Always attempt role assignment BEFORE DM - role is more critical than notification
- **Optimization**: Could batch DMs with 1-second delays for bulk approvals to respect rate limits
- **Best Practice**: Include unsubscribe-like message footer for compliance: "To stop receiving tournament notifications, disable DMs from server members in your privacy settings"

---

## 📚 KNOWLEDGE BASE

### Core System Paths

| Path | Purpose | Dependencies |
|------|---------|--------------|
| `/web/src/lib/discord/directMessage.ts` | **NEW** - DM sending service | discord.js types |
| `/web/src/lib/discord/roleAssignment.ts` | Existing role assignment (pattern reference) | @discordjs/rest |
| `/web/src/app/api/applications/[id]/approve/route.ts` | Approval endpoint to extend | Next.js, Supabase |
| `/web/src/lib/discord/rest.ts` | Discord REST API utilities | @discordjs/rest |
| `/supabase/migration_discord_oauth_integration.sql` | Database schema with discord_messages | PostgreSQL |
| `/web/.env.local` | DISCORD_BOT_TOKEN configuration | - |
| `/web/src/types/index.ts` | TypeScript interfaces | - |

### Discord API Endpoints

| Endpoint | Purpose | Method | Rate Limit |
|----------|---------|--------|------------|
| `/users/@me/channels` | Create DM channel | POST | 10/10s |
| `/channels/{channel_id}/messages` | Send DM | POST | 5/5s (per channel) |
| `/guilds/{guild_id}/members/{user_id}/roles/{role_id}` | Assign role | PUT | 10/10s |

### Environment Variables

| Variable | Purpose | Location |
|----------|---------|----------|
| `DISCORD_BOT_TOKEN` | Bot authentication | `.env.local` |
| `NEXT_PUBLIC_APP_URL` | For URLs in messages | `.env.local` |

### Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `applications` | Store applications | id, tournament_id, streamer (JSONB), status |
| `discord_configs` | Guild configs | organization_id, guild_id, approved_role_id |
| `discord_messages` | Audit log | application_id, message_type, status, error_message |

---
## 🎯 Task Groups

### Group 1: DM Service Implementation
- [ ] **Create DM sending service** — Build `/web/src/lib/discord/directMessage.ts` with retry logic, error handling, and database logging. Pattern should match existing `roleAssignment.ts` structure with exponential backoff (2s, 4s delays). Include TypeScript interfaces for params and results.
- [ ] **Add DM helper functions** — Create helper to format welcome message template with tournament data. Include function to create DM channel first, then send message (Discord requires 2-step process). Add sanitization for message content to prevent injection.
- [ ] **Implement retry mechanism** — Exponential backoff matching role assignment: immediate, 2s, 4s delays. Handle Discord error codes: 50007 (DMs disabled), 429 (rate limit), 10013 (invalid user). Max 3 attempts before giving up gracefully.
- [ ] **Add database logging** — Insert records to `discord_messages` table with status ('sent', 'failed', 'skipped'), error messages, attempt count, and timestamps. Ensure logging happens even on failures for complete audit trail.

### Group 2: Integration with Approval Flow  
- [ ] **Import DM service in approval route** — Add import statement for `sendDiscordDM` function in `/web/src/app/api/applications/[id]/approve/route.ts`. Position after role assignment logic.
- [ ] **Call DM service after role assignment** — Execute DM sending after successful role assignment (or after role assignment attempt). Use try-catch to ensure DM failures don't break approval flow. Pass tournament and streamer data to format message.
- [ ] **Add DM status tracking** — Extend `discordStatus` object in approval response to include `dmAttempted`, `dmSuccess`, `dmError`, `dmSkipped` fields. Allows frontend to show complete Discord integration status.
- [ ] **Update response structure** — Ensure API response includes both role and DM status. Example: `{ discord: { role: {...}, dm: {...} } }`. Document in API comments.

### Group 3: Message Template & Formatting
- [ ] **Create message template** — Design welcome message with tournament details, next steps, and call-to-action. Include: tournament name, game, dates, role confirmation, server join link, guidelines link. Use Discord markdown for formatting (bold, emojis).
- [ ] **Add dynamic data injection** — Replace template variables with actual tournament data: `${tournament.title}`, `${tournament.game}`, `${formatDate(start_date)}`. Handle missing optional fields gracefully.
- [ ] **Add invite link helper** — If Discord config has `invite_link` field, include it in message. Otherwise, provide generic "Join the Discord server" text. Consider adding function to generate instant invite via API (future enhancement).
- [ ] **Test message formatting** — Send test DM to verify formatting renders correctly in Discord client. Check on mobile and desktop. Ensure emojis display properly, links are clickable, line breaks work.

### Group 4: Error Handling & Edge Cases
- [ ] **Handle DMs disabled** — When user has DMs disabled (error 50007), log as 'skipped' with clear reason. Don't retry. Set `dmSkipped: true, skipReason: 'User has DMs disabled'`.
- [ ] **Handle rate limiting** — When rate limited (error 429), wait for `retry_after` duration, then retry. Respect Discord's rate limits: 1 DM per second per user. Consider implementing queue for bulk approvals.
- [ ] **Handle invalid user ID** — When user ID is invalid (error 10013), log as failed with clear error. Don't retry. Set error message to "Invalid Discord User ID".
- [ ] **Add comprehensive logging** — Console.log all DM attempts with application_id, user_id, success/failure, error codes. Use `[Discord DM]` prefix for easy filtering. Include timing info for performance monitoring.

### Group 5: Database Schema Updates (if needed)
- [ ] **Verify discord_messages table** — Check if table supports `message_type` field to distinguish 'role_assignment' vs 'dm_notification'. If not, add column or create separate table.
- [ ] **Add indexes for queries** — Ensure indexes on `application_id` and `tournament_id` for fast lookups. Add index on `status` for filtering sent/failed messages.
- [ ] **Add constraints** — Ensure `discord_user_id` is required for DM messages. Add CHECK constraint on `message_type` enum values.
- [ ] **Migration script** — If schema changes needed, create `/supabase/migrations/YYYYMMDD_add_dm_message_type.sql` with ALTER TABLE statements. Test rollback.

### Group 6: Testing & Validation
- [ ] **Unit test DM service** — Test `sendDiscordDM` function in isolation with mocked Discord API. Verify retry logic, error handling, database logging. Test cases: success, DMs disabled, rate limit, invalid user.
- [ ] **Integration test approval flow** — Test full approval → role assignment → DM flow with real Discord bot token in development server. Use test Discord server and test user accounts.
- [ ] **Test edge cases** — Verify behavior when: Discord integration not configured, streamer has no User ID, Discord API is down, database write fails. Ensure approval always succeeds.
- [ ] **Test DM delivery** — Create test application, approve it, verify DM arrives in Discord. Check message formatting, links, emojis. Test on both mobile and desktop Discord clients.
- [ ] **Load testing** — Approve 10 applications rapidly to test rate limiting handling. Verify queue/delay mechanism works. Check database for all logged attempts.
- [ ] **Error recovery test** — Simulate Discord API failure mid-approval. Verify approval completes, error is logged, and system remains stable.

### Group 7: Documentation & Cleanup
- [ ] **Update API documentation** — Document new DM notification feature in approval endpoint. Include response structure with DM status fields. Add examples of success and failure responses.
- [ ] **Update Discord setup guide** — Add section in `/DISCORD_SETUP_GUIDE.md` explaining DM notifications, bot permissions required (no special permissions needed for DMs), troubleshooting common issues.
- [ ] **Add code comments** — Document DM service functions with JSDoc comments: parameters, return values, error codes. Explain 2-step DM process (create channel, send message).
- [ ] **Update environment example** — Ensure `.env.example` has `DISCORD_BOT_TOKEN` and usage comments. No new variables needed for DM feature.
- [ ] **Clean up console logs** — Remove debug console.logs, keep only important logging. Use consistent format: `[Discord DM] <action>: <details>`.

---

## 📂 FILES CHANGED
<!-- MANDATORY: Update IMMEDIATELY after EVERY file modification -->

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| *No changes yet* | - | Will be updated as implementation progresses |

---

## 🔗 Previously Related Tasks

- `/tasks/121125/2-discord-oauth-complete.md` — Discord OAuth integration foundation
- `/tasks/111125/3-integrate-discord-role-assignment.md` — Role assignment implementation (pattern to follow)
- `/tasks/111125/2-add-discord-field-to-application.md` — Discord User ID field in application form
- `/tasks/111125/1-finalize-discord-bot-setup.md` — Initial Discord bot configuration
- `/tasks/111125/DISCORD_ARCHITECTURE.md` — Complete system architecture and data flow

---

## ✨ Implementation Notes

**Implementation Order:**
1. Start with DM service (`directMessage.ts`) - foundation
2. Test service in isolation with console app
3. Integrate into approval route
4. Test end-to-end with real Discord server
5. Handle edge cases and error scenarios
6. Document and clean up

**Testing Strategy:**
- Use test Discord server with test accounts
- Create test tournament and application
- Approve application and verify DM delivery
- Test failure scenarios (DMs disabled, rate limits)
- Verify database audit logs

**Success Indicators:**
- Approved streamers receive DM within 5 seconds
- DM includes all tournament information
- Failures don't block approval process
- All attempts logged to database
- Error handling covers all Discord error codes
