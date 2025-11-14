---
status: pending
---

# Fix Settings Page "No Organization Found" Error

## 📊 Description

Users are experiencing "No organization found" error on the Settings page despite having valid user and organization data in Supabase. The database shows:
- User records exist with organization_id populated
- Organization records exist matching the user's organization_id
- User is successfully authenticated (can access dashboard)

However, when navigating to /dashboard/settings:
1. Page briefly loads
2. Shows "No organization found" message
3. May redirect to login page

The issue is likely caused by one of:
- RLS policies blocking the organization query
- Session not being properly established when Settings page loads
- Timing issue where page queries before auth is fully ready
- Missing or incorrect data in user/organization tables

**Expected Outcome**:
- Settings page loads successfully showing organization details
- Discord bot configuration section is visible and functional
- Users can connect/disconnect Discord bot without errors
- No unnecessary redirects to login page

---

## 🧠 Chain of Thought

### Why This Approach?

**Root Cause Analysis Strategy**:
1. Add comprehensive logging to Settings component to capture exact error
2. Verify RLS policies allow proper data access
3. Check session establishment timing
4. Validate database records match expected structure
5. Test with both existing and new users

**Why Enhanced Logging First**:
- Current Settings component only logs generic errors to console
- Need to capture: exact error messages, RLS policy failures, timing issues
- Without detailed logs, we're guessing at the problem
- Logs will definitively show if it's RLS, session, or data issue

**Why Check RLS Policies**:
The current RLS setup uses subqueries which can fail:
```sql
-- Organizations policy uses subquery
CREATE POLICY "Organization members can view their org" ON organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM users WHERE id = auth.uid()));
```

If the session auth.uid() isn't properly set when this query runs, it will fail silently and return no rows.

### Key Logic & Patterns

**Current Settings Flow**:
```typescript
1. Page mounts
2. useEffect runs immediately
3. Calls loadOrganizationData()
4. Gets user from auth.getUser()
5. Queries users table for organization_id  // ← May fail here
6. Queries organizations table             // ← Or may fail here
7. Sets state or throws error
```

**Potential Failures**:
- **Timing Issue**: `auth.getUser()` returns cached data before session is fully established
- **RLS Failure**: Policies block queries even though user is authenticated
- **Null Data**: organization_id is null in database (shouldn't be based on user report)

### Critical References

- **Settings Component**: `/web/src/components/pages/Settings.tsx` — Component experiencing the issue
- **Auth Store**: `/web/src/store/authStore.ts` — Handles user/org initialization with proper pattern
- **RLS Policies**: `/supabase/schema.sql` (lines 200-267) — May need service role for Settings queries
- **Supabase Client**: `/web/src/lib/supabase/client.ts` — Browser client used by Settings
- **Database Schema**: `/supabase/schema.sql` (lines 1-100) — users.organization_id → organizations.id

### Expected Side Effects

**After Fix**:
- Settings page will load reliably for all users
- Clear error messages if actual data issues exist
- No false "No organization found" errors
- Better debugging capability for future issues

**No Breaking Changes**:
- Fix is defensive - adds logging and better error handling
- Doesn't change API contracts or database schema
- Won't affect other components using similar patterns

---

## 📚 KNOWLEDGE BASE

### Core System Paths

| Path | Purpose | Usage |
|------|---------|-------|
| `/web/src/components/pages/Settings.tsx` | Discord settings UI | **FIXING** - Add logging, improve error handling |
| `/web/src/store/authStore.ts` | Auth state management | Reference for correct org loading pattern |
| `/web/src/lib/supabase/client.ts` | Browser Supabase client | Used by Settings component |
| `/web/src/lib/supabase/server.ts` | Server Supabase client | May need for RLS bypass |
| `/supabase/schema.sql` | Database schema + RLS | Check/modify policies if needed |

### Database Tables

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `users` | id, email, organization_id, role | User profiles with org link |
| `organizations` | id, name, logo_url | Tournament organizer orgs |
| `discord_configs` | organization_id, guild_id, bot_token | Discord bot settings |

### RLS Policies to Review

| Table | Policy Name | Current Logic |
|-------|-------------|---------------|
| users | "Users can view own data" | `auth.uid() = id` |
| organizations | "Organization members can view their org" | `id IN (SELECT organization_id FROM users WHERE id = auth.uid())` |

---

## 🎯 Task Groups

### Investigation & Debugging
- [ ] **Add comprehensive logging** — Capture exact error messages, query results, session state
- [ ] **Test with real user data** — Log into app, navigate to Settings, check browser console
- [ ] **Verify database records** — Confirm user has valid organization_id, org exists
- [ ] **Check RLS policies** — Test queries manually in Supabase SQL editor
- [ ] **Monitor network tab** — Check if queries are being sent, what responses return

### Root Cause Identification
- [ ] **Analyze error logs** — Determine if it's RLS, timing, or data issue
- [ ] **Test session establishment** — Add delays/waits if timing issue
- [ ] **Verify auth.uid()** — Confirm session is properly set when queries run
- [ ] **Check policy evaluation** — See if RLS policies are evaluated correctly

### Fix Implementation
- [ ] **Implement fix** — Based on root cause (RLS adjustment, timing fix, or error handling)
- [ ] **Add fallback behavior** — Graceful error messages if data truly missing
- [ ] **Improve loading states** — Better UX during auth establishment
- [ ] **Add retry logic** — Retry queries if they fail initially

### Testing & Validation
- [ ] **Test existing users** — Verify Settings loads for users with data
- [ ] **Test new users** — Ensure org creation flow works
- [ ] **Test error cases** — Verify proper error messages for actual issues
- [ ] **Test Discord bot flow** — Full workflow: connect bot → approve application → role assigned

### Documentation
- [ ] **Document fix** — Explain what the issue was and how it's resolved
- [ ] **Update task file** — Mark completed with timestamps
- [ ] **Add completion summary** — Key findings and solution

---

## 📂 FILES CHANGED

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| (pending investigation) | - | Will update as files are modified |

---

## 🔗 Previously Related Tasks

- `/tasks/141125/2-fix-vercel-deployment-supabase-client.md` — Previous fix for Settings page query pattern
- `/tasks/121125/2-discord-oauth-complete.md` — Discord OAuth implementation that created Settings
- `/tasks/141125/1-complete-discord-bot-workflow.md` — Discord bot workflow that depends on Settings
