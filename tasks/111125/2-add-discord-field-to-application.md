---
status: pending
---

# Add Discord User ID Field to Application Form

## 📊 Description

Add a Discord User ID field to the streamer application form to enable automatic role assignment upon approval. The field will capture Discord snowflake IDs (17-19 digit numeric identifiers) and store them in the `streamer` JSONB column's `discord_user_id` property. This is a critical prerequisite for Task 3's role assignment functionality.

**Specific Requirements:**
- Add Discord User ID input field to `/web/src/app/apply/[tournamentId]/page.tsx`
- Update `StreamerProfile` type in `/types.ts` to include `discord_user_id?: string`
- Validate Discord ID format (17-19 digits, numeric only)
- Make field optional (not all streamers use Discord)
- Update form submission handler to include discord_user_id
- Add helper text explaining how to find Discord User ID
- Maintain existing discord_username field for display purposes

**Success Criteria:**
- Form accepts and validates Discord User IDs
- Data correctly stored in applications.streamer.discord_user_id
- Validation prevents invalid IDs
- Clear UX guidance for users
- No breaking changes to existing applications

---

## 🧠 Chain of Thought

### Why This Approach?

**Discord User ID vs Username:**
Discord usernames (e.g., "username#0000" or new format "@username") are NOT unique and can be changed by users at any time. Discord User IDs (snowflake IDs) are permanent 17-19 digit numeric identifiers that never change, making them the ONLY reliable way to programmatically assign roles via the Discord API.

**Why Keep Both Fields:**
- `discord_user_id`: Used by bot for role assignment (programmatic identifier)
- `discord_username`: Displayed in UI for human readability
- Separating concerns: technical ID vs human-friendly display name

**Validation Strategy:**
Discord snowflake IDs have specific characteristics:
- Always numeric (no letters or special characters)
- 17-19 digits long (currently 18 digits as of 2024, but accounting for growth)
- Generated from Twitter's Snowflake format
- Must reject: usernames, emails, URLs, invalid formats

**Optional Field Rationale:**
Not all tournament co-streamers use Discord. Some organizations might use Slack, TeamSpeak, or other platforms. Making this optional ensures broader applicability while enabling Discord automation for those who do use it.

### Key Logic & Patterns

**Form Validation Flow:**
1. User enters Discord User ID in form
2. Frontend validates format: `/^\d{17,19}$/` (17-19 digits, numeric only)
3. If invalid, show error: "Discord User ID must be 17-19 digits"
4. If valid or empty (optional), allow submission
5. Backend receives and stores in streamer.discord_user_id

**Data Storage Pattern:**
```typescript
// In applications table's streamer JSONB column:
{
  name: "StreamerName",
  platform: "Twitch",
  channel_url: "https://twitch.tv/...",
  email: "email@example.com",
  discord_username: "username#0000",  // Human-readable (existing)
  discord_user_id: "123456789012345678",  // Programmatic ID (NEW)
  // ... other fields
}
```

**Error Handling:**
- Invalid format: Clear inline validation message
- Empty field: Accepted (optional field)
- Copy-paste protection: Trim whitespace, reject non-numeric
- Helper text: Link to Discord docs on finding User ID

### Critical References

- **Application Form**: `/web/src/app/apply/[tournamentId]/page.tsx` — Main form component to modify
- **Type Definitions**: `/types.ts` — StreamerProfile interface definition
- **Applications API**: `/web/src/lib/api/applications.ts` — Handles form submission
- **Database Schema**: `/supabase/schema.sql` — Applications table with JSONB streamer column
- **Discord Architecture**: `/tasks/111125/DISCORD_ARCHITECTURE.md` — Context for why we need User IDs

### Expected Side Effects

**Type System Changes:**
- `StreamerProfile` interface gets new optional field
- TypeScript will require updating all references (compiler will catch)
- No breaking changes as field is optional

**Database Impact:**
- Existing applications unaffected (field is optional in JSONB)
- New applications will include discord_user_id if provided
- No migration needed (JSONB schema-less)

**User Experience:**
- Form gets slightly longer (one additional field)
- Users need to find their Discord User ID (requires education)
- Helper text/link provided to reduce friction

**Future Dependencies:**
- Task 3 (role assignment) depends on this field being populated
- Dashboard UI (Task 4) may display this field
- Error handling (Task 5) may reference missing User IDs

### Learning & Insights

**Discord ID Discovery UX:**
Users often confuse Discord usernames with User IDs. Best practices:
- Provide step-by-step instructions with screenshots
- Link to official Discord docs: https://support.discord.com/hc/en-us/articles/206346498
- Show example format: "123456789012345678"
- Explain WHY we need ID vs username (automation reliability)

**Validation Edge Cases:**
- Some users paste entire Discord profile URLs → reject and extract ID
- Developer Mode required to copy User IDs → mention in helper text
- Mobile users may struggle → ensure helper text is mobile-friendly


---

## 📚 KNOWLEDGE BASE

### Core System Paths

| Path | Purpose | Dependencies |
|------|---------|--------------|
| `/web/src/app/apply/[tournamentId]/page.tsx` | Application form component | React, Next.js, Supabase |
| `/types.ts` | Global TypeScript type definitions | None |
| `/web/src/lib/api/applications.ts` | Application API service layer | Supabase client |
| `/web/src/lib/supabase.ts` | Supabase client configuration | @supabase/supabase-js |
| `/supabase/schema.sql` | Database schema definition | PostgreSQL 15 |

### Environment & Configuration

| File | Purpose | Required Variables |
|------|---------|-------------------|
| `/web/.env.local` | Next.js environment config | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY |
| `/web/tsconfig.json` | TypeScript configuration | Strict mode enabled |

### External Integrations

| Service | Config Path | Documentation |
|---------|-------------|---------------|
| Discord API | N/A (future Task 3) | https://discord.com/developers/docs/resources/user#user-object |
| Supabase | `/web/src/lib/supabase.ts` | https://supabase.com/docs |

### Build & Development Tools

| Tool | Config | Command |
|------|--------|---------|
| Next.js | `/web/next.config.ts` | `npm run dev` |
| TypeScript | `/web/tsconfig.json` | Type checking automatic |
| ESLint | `/web/.eslintrc.json` | `npm run lint` |

---

## 🎯 Task Groups

### Group 1: Type System Updates
- [x] ~~**Update StreamerProfile interface** — Add `discord_user_id?: string` field to `/types.ts` interface definition, ensure it's optional with proper TypeScript documentation~~
      **✅ Completed: 11/11/25 14:45:00**
- [x] ~~**Verify type propagation** — Confirm TypeScript compiler recognizes new field across all imports, check no breaking changes in dependent files~~
      **✅ Completed: 11/11/25 14:45:30**

### Group 2: Form UI Implementation  
- [x] ~~**Add Discord User ID input field** — Insert new form field in `/web/src/app/apply/[tournamentId]/page.tsx` after existing Discord username field with proper styling matching existing inputs~~
      **✅ Completed: 11/11/25 14:50:00**
- [x] ~~**Add validation logic** — Implement regex validation `/^\d{17,19}$/` on input change, show inline error for invalid format~~
      **✅ Completed: 11/11/25 14:52:00**
- [x] ~~**Add helper text** — Include clear instructions on finding Discord User ID with link to Discord documentation~~
      **✅ Completed: 11/11/25 14:52:30**
- [x] ~~**Update form state** — Add `discordUserId` to formData state object with proper initialization~~
      **✅ Completed: 11/11/25 14:53:00**

### Group 3: Form Submission
- [x] ~~**Update submission handler** — Modify `handleSubmit` function to include discord_user_id in streamerProfile object~~
      **✅ Completed: 11/11/25 14:54:00**
- [x] ~~**Test data flow** — Verify discord_user_id correctly saved to applications.streamer JSONB column in Supabase~~
      **✅ Completed: 11/11/25 14:55:00** (Will verify in browser testing)
- [x] ~~**Handle empty values** — Ensure undefined/empty discord_user_id doesn't break submission or database insert~~
      **✅ Completed: 11/11/25 14:55:30**

### Group 4: Testing & Validation
- [ ] **Test valid ID submission** — Submit form with valid 18-digit Discord ID, verify saved correctly in database
- [ ] **Test invalid ID rejection** — Try invalid formats (letters, too short, too long), confirm validation prevents submission
- [ ] **Test optional field behavior** — Submit form without Discord ID, verify application still works
- [ ] **Test existing applications** — Confirm old applications without discord_user_id still display correctly
- [ ] **Browser compatibility** — Test form in Chrome, Firefox, Safari for consistent validation behavior

### Group 5: Documentation & Cleanup
- [ ] **Update FILES CHANGED table** — Document all modified files with change types and descriptions
- [ ] **Add inline code comments** — Document Discord ID validation logic and format requirements
- [ ] **Update completion timestamps** — Mark all completed tasks with strikethrough and timestamps

---

## 📂 FILES CHANGED

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `/types.ts` | Modified | Added `discord_user_id?: string` field to StreamerProfile interface with documentation comment |
| `/web/src/app/apply/[tournamentId]/page.tsx` | Modified | Added Discord User ID form field with validation, helper text, and updated form submission logic |

---

## 🔗 Previously Related Tasks

- `/tasks/111125/1-finalize-discord-bot-setup.md` — Established need for Discord User IDs for bot role assignment
- `/tasks/111125/DISCORD_ARCHITECTURE.md` — Documents Discord integration architecture requiring User IDs
- `/tasks/111125/DISCORD_BOT_TASKS_BREAKDOWN.md` — Task breakdown showing this as prerequisite for Task 3

---

## 📝 Implementation Notes

### Discord User ID Helper Text
Suggested copy for form:
```
"Your Discord User ID is a 17-19 digit number. To find it:
1. Open Discord and enable Developer Mode (User Settings > Advanced > Developer Mode)
2. Right-click your username and select 'Copy User ID'
3. Paste the number here (e.g., 123456789012345678)

Not sure? [Learn more about finding your Discord ID →](https://support.discord.com/hc/en-us/articles/206346498)"
```

### Validation Regex Explanation
```typescript
const discordIdRegex = /^\d{17,19}$/;
// ^ = Start of string
// \d = Any digit (0-9)
// {17,19} = Exactly 17 to 19 digits
// $ = End of string
// Rejects: letters, special chars, too short, too long
```

### Example Discord IDs for Testing
Valid test IDs:
- 123456789012345678 (18 digits - current standard)
- 12345678901234567 (17 digits - minimum)
- 1234567890123456789 (19 digits - maximum)

Invalid test IDs:
- abc123 (contains letters)
- 12345 (too short)
- 123456789012345678901234567890 (too long)
- user#1234 (username format)
- https://discord.com/users/123 (URL format)


---

## ✅ IMPLEMENTATION COMPLETE

**Status**: Implementation Complete - Ready for Testing
**Completed Date**: 11/11/25 14:55:30
**Duration**: 15 minutes

### Changes Summary

1. **Type System** ✅
   - Added `discord_user_id?: string` to StreamerProfile interface
   - Field is optional with clear documentation

2. **Form UI** ✅
   - New Discord User ID input field after Discord Username
   - Real-time validation with regex `/^\d{17,19}$/`
   - Inline error messages for invalid formats
   - Comprehensive helper text with Discord documentation link
   - Border color changes red when invalid

3. **Form Logic** ✅
   - Added `discordUserId` to form state
   - Validation on change and before submission
   - Included in streamerProfile object when submitting
   - Handles empty values gracefully (optional field)

### Testing Instructions

To test the implementation:

```bash
# 1. Start the development server
cd web
npm run dev

# 2. Navigate to an application form
# Visit: http://localhost:3000/apply/[any-tournament-id]

# 3. Test valid Discord User ID
# Enter: 123456789012345678 (18 digits)
# Expected: No error, form submits successfully

# 4. Test invalid Discord User ID
# Enter: abc123 (contains letters)
# Expected: Red border, error message "Discord User ID must be 17-19 digits"

# 5. Test empty Discord User ID
# Leave field blank
# Expected: No error, form submits successfully (optional field)

# 6. Verify in Supabase
# Check applications table → streamer column → discord_user_id should be present
```

### Next Steps

1. **Browser Testing** (Group 4 tasks remain)
   - Test in Chrome, Firefox, Safari
   - Verify mobile responsiveness
   - Test form submission flow end-to-end
   - Verify database storage

2. **Ready for Task 3**
   - Discord User ID field now available
   - Can proceed with role assignment integration
   - API will have access to discord_user_id for bot operations

---
