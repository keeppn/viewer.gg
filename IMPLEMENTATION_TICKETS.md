# Discord Bot Integration - Implementation Tickets

This document contains detailed implementation tickets for all 23 issues identified in the comprehensive code review.

**Quick Reference:**
- 🔴 CRITICAL: Must fix before production
- 🟡 HIGH: Fix in next sprint
- 🟢 MEDIUM/LOW: Plan for future sprints

---

## PHASE 1: SECURITY FIXES (URGENT)

### 🎫 TICKET #1: Fix State Parameter Tampering Vulnerability
**Priority:** 🔴 CRITICAL
**Severity:** CRITICAL
**Component:** OAuth Flow (`app/(authenticated)/dashboard/settings/Settings.tsx`, `app/api/discord/bot-callback/route.ts`)
**Estimated Effort:** 2 hours

#### Description
The OAuth state parameter is only Base64-encoded, not cryptographically signed. Attackers can decode, modify the `org_id`, and re-encode to hijack any organization's Discord bot connection.

#### Current Vulnerable Code
```typescript
// Settings.tsx:196
const state = btoa(JSON.stringify({ org_id: organization.id }));

// bot-callback/route.ts:60-61
const stateData = JSON.parse(atob(stateParam));
organizationId = stateData.org_id;
```

#### Attack Vector
1. Attacker intercepts OAuth flow
2. Decodes state: `atob("eyJvcmdfaWQiOiIxMjMifQ==")` → `{"org_id":"123"}`
3. Changes to: `{"org_id":"VICTIM_ORG_ID"}`
4. Re-encodes and completes OAuth
5. Bot gets added to victim's organization

#### Required Changes

**File:** `lib/security/state-token.ts` (new file)
```typescript
import { SignJWT, jwtVerify } from 'jose';

const STATE_SECRET = new TextEncoder().encode(
  process.env.STATE_SIGNING_SECRET || 'your-secret-key-min-32-chars'
);

export async function signStateToken(data: { org_id: string }): Promise<string> {
  return await new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m') // 5 minute expiry
    .sign(STATE_SECRET);
}

export async function verifyStateToken(token: string): Promise<{ org_id: string }> {
  try {
    const { payload } = await jwtVerify(token, STATE_SECRET);
    return payload as { org_id: string };
  } catch (error) {
    throw new Error('Invalid or expired state token');
  }
}
```

**File:** `app/(authenticated)/dashboard/settings/Settings.tsx`
```typescript
// Line 196: Replace
const state = await signStateToken({ org_id: organization.id });
```

**File:** `app/api/discord/bot-callback/route.ts`
```typescript
// Lines 57-68: Replace
try {
  const stateData = await verifyStateToken(stateParam);
  organizationId = stateData.org_id;
} catch (error) {
  console.error('[Discord Bot Callback] State verification failed:', error);
  return NextResponse.redirect(
    `${baseUrl}/dashboard/settings?error=invalid_state`
  );
}
```

#### Environment Variables Required
```bash
STATE_SIGNING_SECRET=<generate-with-openssl-rand-base64-32>
```

#### Acceptance Criteria
- [ ] State tokens are cryptographically signed using HMAC-SHA256
- [ ] Tokens expire after 5 minutes
- [ ] Tampered tokens are rejected with error redirect
- [ ] `STATE_SIGNING_SECRET` environment variable is documented
- [ ] Old unsigned state parameters are rejected

#### Testing Steps
1. **Valid Flow Test:**
   - Start Discord bot connection
   - Complete OAuth flow
   - Verify bot connects successfully

2. **Tampering Test:**
   - Intercept state parameter
   - Modify `org_id` in payload
   - Attempt to complete OAuth
   - Verify: Redirects with `error=invalid_state`

3. **Expiry Test:**
   - Generate state token
   - Wait 6 minutes
   - Attempt to use token
   - Verify: Rejects with expiration error

4. **Signature Test:**
   - Generate valid token
   - Change one character in signature
   - Attempt to use token
   - Verify: Rejects with invalid signature error

#### Dependencies
- `jose` package (JWT library): `npm install jose`

#### Security Notes
- Use `crypto.randomBytes(32).toString('base64')` to generate `STATE_SIGNING_SECRET`
- Never log the state token payload in production
- Rotate secret every 90 days

---

### 🎫 TICKET #2: Add Authorization Checks for Service Role Operations
**Priority:** 🔴 CRITICAL
**Severity:** CRITICAL
**Component:** Bot Callback (`app/api/discord/bot-callback/route.ts`)
**Estimated Effort:** 1 hour

#### Description
The bot callback uses service role client to bypass RLS, but doesn't verify that the authenticated user owns the organization they're connecting a bot to. Combined with state tampering, this allows complete account takeover.

#### Current Vulnerable Code
```typescript
// Line 71: Bypasses RLS completely
const supabase = createServiceRoleClient();

// Lines 75-79: Only checks if org EXISTS, not if requester OWNS it
const { data: organization, error: orgError } = await supabase
  .from('organizations')
  .select('id, name')
  .eq('id', organizationId) // ⚠️ No ownership check!
  .single();
```

#### Required Changes

**File:** `app/api/discord/bot-callback/route.ts`

```typescript
// After line 68 (after state verification), add:

// Step 1: Get authenticated session using regular client
const sessionClient = createClient();
const { data: { session }, error: sessionError } = await sessionClient.auth.getSession();

if (!session || sessionError) {
  console.error('[Discord Bot Callback] No valid session:', sessionError);
  return NextResponse.redirect(
    `${baseUrl}/dashboard/settings?error=unauthorized`
  );
}

const userId = session.user.id;

// Step 2: Use service role client for verification
const supabase = createServiceRoleClient();

// Step 3: Verify user owns this organization
const { data: userRecord, error: userError } = await supabase
  .from('users')
  .select('organization_id')
  .eq('id', userId)
  .single();

if (userError || !userRecord) {
  console.error('[Discord Bot Callback] Failed to load user:', userError);
  return NextResponse.redirect(
    `${baseUrl}/dashboard/settings?error=user_not_found`
  );
}

if (userRecord.organization_id !== organizationId) {
  console.error('[Discord Bot Callback] Authorization failed:', {
    userId,
    requestedOrgId: organizationId,
    userOrgId: userRecord.organization_id
  });
  return NextResponse.redirect(
    `${baseUrl}/dashboard/settings?error=forbidden`
  );
}

// Step 4: Proceed with existing organization query
const { data: organization, error: orgError } = await supabase
  .from('organizations')
  .select('id, name')
  .eq('id', organizationId)
  .single();
```

#### Acceptance Criteria
- [ ] User session is verified before any database operations
- [ ] User's `organization_id` is checked against requested `organizationId`
- [ ] Unauthorized attempts redirect with `error=unauthorized`
- [ ] Forbidden attempts (wrong org) redirect with `error=forbidden`
- [ ] All authorization checks happen before Discord API calls
- [ ] Error messages don't leak sensitive information

#### Testing Steps
1. **Valid User Test:**
   - Login as user belonging to Org A
   - Connect Discord bot to Org A
   - Verify: Succeeds

2. **Unauthorized User Test:**
   - Logout
   - Obtain OAuth callback URL for Org A
   - Visit URL without session
   - Verify: Redirects with `error=unauthorized`

3. **Wrong Organization Test:**
   - Login as user belonging to Org A
   - Manually craft state token for Org B (requires Ticket #1 to be fixed first)
   - Attempt to complete OAuth
   - Verify: Redirects with `error=forbidden`

4. **Edge Cases:**
   - User has no organization assigned: Should reject
   - Organization doesn't exist: Should reject
   - User is deleted mid-OAuth: Should reject

#### Security Notes
- Log all authorization failures for security monitoring
- Consider rate limiting failed authorization attempts
- Add audit log entry for successful bot connections

---

### 🎫 TICKET #3: Validate Discord User ID Format
**Priority:** 🟡 HIGH
**Severity:** HIGH
**Component:** Application Status Update (`lib/applications.ts`)
**Estimated Effort:** 30 minutes

#### Description
User-supplied Discord User IDs from application custom data are passed directly to Discord API without validation. This could lead to injection attempts, API errors, or DoS.

#### Current Vulnerable Code
```typescript
// Line 102
const discordUserId = application.custom_data.discord_user_id ||
                      application.custom_data.discordUserId;

// Line 120: Used directly without validation
const response = await fetch('/api/discord/assign-role', {
  method: 'POST',
  body: JSON.stringify({
    guild_id: discordConfig.guild_id,
    user_id: discordUserId, // ⚠️ Unvalidated
    role_id: discordConfig.approved_role_id,
  }),
});
```

#### Required Changes

**File:** `lib/validators/discord.ts` (new file)
```typescript
/**
 * Validates Discord User ID format
 * Discord IDs are 64-bit integers (17-19 digits as strings)
 */
export function isValidDiscordUserId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  return /^\d{17,19}$/.test(id);
}

/**
 * Validates Discord Guild ID format
 */
export function isValidDiscordGuildId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  return /^\d{17,19}$/.test(id);
}

/**
 * Validates Discord Role ID format
 */
export function isValidDiscordRoleId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  return /^\d{17,19}$/.test(id);
}
```

**File:** `lib/applications.ts`
```typescript
import { isValidDiscordUserId } from './validators/discord';

// After line 101, add validation:
const discordUserId = application.custom_data.discord_user_id ||
                      application.custom_data.discordUserId;

if (!isValidDiscordUserId(discordUserId)) {
  console.error('[Applications] Invalid Discord User ID format:', {
    applicationId: application.id,
    providedId: discordUserId,
    type: typeof discordUserId
  });

  // Update application with error status
  await supabase
    .from('applications')
    .update({
      status: 'approved_role_failed',
      notes: 'Invalid Discord User ID format. Please ensure the user provided a valid Discord ID.'
    })
    .eq('id', application.id);

  return data;
}

// Continue with role assignment...
```

**File:** `app/api/discord/assign-role/route.ts`
```typescript
import { isValidDiscordUserId, isValidDiscordGuildId, isValidDiscordRoleId } from '@/lib/validators/discord';

// Add validation at the start of POST handler:
const { guild_id, user_id, role_id } = await request.json();

if (!isValidDiscordGuildId(guild_id)) {
  return NextResponse.json(
    { error: 'Invalid guild_id format' },
    { status: 400 }
  );
}

if (!isValidDiscordUserId(user_id)) {
  return NextResponse.json(
    { error: 'Invalid user_id format' },
    { status: 400 }
  );
}

if (!isValidDiscordRoleId(role_id)) {
  return NextResponse.json(
    { error: 'Invalid role_id format' },
    { status: 400 }
  );
}
```

#### Acceptance Criteria
- [ ] All Discord IDs are validated before use
- [ ] Invalid IDs are rejected with descriptive errors
- [ ] Applications with invalid Discord IDs are marked as `approved_role_failed`
- [ ] API endpoints return 400 status for invalid ID formats
- [ ] Validation function has comprehensive unit tests

#### Testing Steps
1. **Valid ID Test:**
   - Submit application with valid Discord ID: `"123456789012345678"`
   - Approve application
   - Verify: Role assignment succeeds

2. **Invalid Format Tests:**
   - Test empty string: `""`
   - Test too short: `"12345"`
   - Test too long: `"12345678901234567890"`
   - Test non-numeric: `"abc123"`
   - Test SQL injection attempt: `"123'; DROP TABLE users--"`
   - Test XSS attempt: `"<script>alert(1)</script>"`
   - Verify all: Rejected with appropriate error

3. **Type Confusion Tests:**
   - Test number instead of string: `123456789012345678`
   - Test null: `null`
   - Test undefined: `undefined`
   - Test object: `{id: "123"}`
   - Verify all: Rejected

4. **Edge Case Tests:**
   - 17-digit ID (minimum valid): `"12345678901234567"`
   - 19-digit ID (maximum valid): `"1234567890123456789"`
   - Verify both: Accepted

#### Unit Tests
```typescript
// __tests__/validators/discord.test.ts
import { isValidDiscordUserId } from '@/lib/validators/discord';

describe('isValidDiscordUserId', () => {
  it('accepts valid 17-digit IDs', () => {
    expect(isValidDiscordUserId('12345678901234567')).toBe(true);
  });

  it('accepts valid 18-digit IDs', () => {
    expect(isValidDiscordUserId('123456789012345678')).toBe(true);
  });

  it('accepts valid 19-digit IDs', () => {
    expect(isValidDiscordUserId('1234567890123456789')).toBe(true);
  });

  it('rejects too short IDs', () => {
    expect(isValidDiscordUserId('123456')).toBe(false);
  });

  it('rejects too long IDs', () => {
    expect(isValidDiscordUserId('12345678901234567890')).toBe(false);
  });

  it('rejects non-numeric IDs', () => {
    expect(isValidDiscordUserId('abc123def456')).toBe(false);
  });

  it('rejects number types', () => {
    expect(isValidDiscordUserId(123456789012345678 as any)).toBe(false);
  });

  it('rejects null and undefined', () => {
    expect(isValidDiscordUserId(null)).toBe(false);
    expect(isValidDiscordUserId(undefined)).toBe(false);
  });
});
```

#### Dependencies
None (uses built-in regex)

---

## PHASE 2: CRITICAL BUGS

### 🎫 TICKET #4: Fix Race Condition in Role Assignment
**Priority:** 🔴 CRITICAL
**Severity:** CRITICAL
**Component:** Application Status Update (`lib/applications.ts`)
**Estimated Effort:** 3 hours

#### Description
Role assignment happens in fire-and-forget fashion after the database update completes. If Discord API call fails, the application shows "Approved" but the user never receives the role. There's no way to detect or retry this failure.

#### Current Problematic Code
```typescript
// Line 84-96: Update DB (COMPLETES IMMEDIATELY)
const { data, error } = await supabase
  .from('applications')
  .update({ status, reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() })
  .eq('id', id)
  .select()
  .single();

// Line 99-146: Role assignment happens AFTER
// ⚠️ If this fails, DB says "Approved" but user has NO role
if (status === 'Approved') {
  const response = await fetch('/api/discord/assign-role', ...);
  // Errors are only logged, not handled
}

return data; // ⚠️ Returns success even if role assignment fails
```

#### Data Inconsistency Scenarios
1. Discord API is down → DB says "Approved", role not assigned
2. Network timeout → DB says "Approved", unknown role state
3. Rate limit hit → DB says "Approved", role assignment queued but never processed
4. Invalid Discord ID → DB says "Approved", role assignment impossible

#### Required Changes

**Step 1: Add new status values to database**

```sql
-- Migration: Add new status values
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'approved_pending_role';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'approved_role_assigned';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'approved_role_failed';

-- Add new columns for tracking role assignment
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS discord_role_assignment_status TEXT CHECK (discord_role_assignment_status IN ('pending', 'success', 'failed', 'not_applicable')),
ADD COLUMN IF NOT EXISTS discord_role_assignment_error TEXT,
ADD COLUMN IF NOT EXISTS discord_role_assignment_attempted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS discord_role_assignment_retry_count INTEGER DEFAULT 0;

-- Index for finding failed assignments that need retry
CREATE INDEX IF NOT EXISTS idx_applications_role_assignment_failed
ON applications(discord_role_assignment_status, discord_role_assignment_attempted_at)
WHERE discord_role_assignment_status = 'failed';
```

**Step 2: Update `lib/applications.ts`**

```typescript
export const updateApplicationStatus = async (
  id: string,
  status: string,
  reviewedBy: string
) => {
  const supabase = createClient();

  // Step 1: Check if Discord integration is required
  const { data: application } = await supabase
    .from('applications')
    .select('custom_data, organization_id')
    .eq('id', id)
    .single();

  const needsDiscordRole = status === 'Approved' &&
                          (application?.custom_data?.discord_user_id ||
                           application?.custom_data?.discordUserId);

  // Step 2: Set initial status
  const initialStatus = needsDiscordRole ? 'approved_pending_role' : status;

  const { data, error } = await supabase
    .from('applications')
    .update({
      status: initialStatus,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      discord_role_assignment_status: needsDiscordRole ? 'pending' : 'not_applicable'
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Applications] Error updating application status:', error);
    throw error;
  }

  // Step 3: If Discord role needed, attempt assignment
  if (needsDiscordRole) {
    try {
      const roleResult = await assignDiscordRole(application, data);

      if (roleResult.success) {
        // Success: Update to final approved state
        const { data: updatedData } = await supabase
          .from('applications')
          .update({
            status: 'approved_role_assigned',
            discord_role_assignment_status: 'success',
            discord_role_assignment_attempted_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        return updatedData || data;
      } else {
        // Failed: Update with error details
        await supabase
          .from('applications')
          .update({
            status: 'approved_role_failed',
            discord_role_assignment_status: 'failed',
            discord_role_assignment_error: roleResult.error,
            discord_role_assignment_attempted_at: new Date().toISOString(),
            discord_role_assignment_retry_count: (data.discord_role_assignment_retry_count || 0) + 1
          })
          .eq('id', id);

        // Return data with error flag so UI can show retry option
        return {
          ...data,
          status: 'approved_role_failed',
          discord_role_assignment_status: 'failed',
          discord_role_assignment_error: roleResult.error
        };
      }
    } catch (error) {
      // Unexpected error: Update with error details
      console.error('[Applications] Unexpected error during role assignment:', error);

      await supabase
        .from('applications')
        .update({
          status: 'approved_role_failed',
          discord_role_assignment_status: 'failed',
          discord_role_assignment_error: error instanceof Error ? error.message : 'Unknown error',
          discord_role_assignment_attempted_at: new Date().toISOString(),
          discord_role_assignment_retry_count: (data.discord_role_assignment_retry_count || 0) + 1
        })
        .eq('id', id);

      throw error;
    }
  }

  return data;
};

// New helper function
async function assignDiscordRole(application: any, applicationData: any) {
  const discordUserId = application.custom_data.discord_user_id ||
                        application.custom_data.discordUserId;

  // Validate Discord User ID (requires Ticket #3)
  if (!isValidDiscordUserId(discordUserId)) {
    return {
      success: false,
      error: 'Invalid Discord User ID format'
    };
  }

  // Get Discord config
  const supabase = createClient();
  const { data: discordConfig } = await supabase
    .from('discord_configs')
    .select('guild_id, approved_role_id, approved_role_name')
    .eq('organization_id', application.organization_id)
    .single();

  if (!discordConfig?.guild_id || !discordConfig?.approved_role_id) {
    return {
      success: false,
      error: 'Discord integration not configured for this organization'
    };
  }

  // Attempt role assignment with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch('/api/discord/assign-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guild_id: discordConfig.guild_id,
        user_id: discordUserId,
        role_id: discordConfig.approved_role_id,
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || `Discord API returned ${response.status}`
      };
    }

    return { success: true };
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Discord API request timed out after 10 seconds'
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

**Step 3: Add retry functionality**

```typescript
// lib/applications.ts - Add new export
export const retryRoleAssignment = async (applicationId: string) => {
  const supabase = createClient();

  // Get application details
  const { data: application, error } = await supabase
    .from('applications')
    .select('*, organization_id, custom_data')
    .eq('id', applicationId)
    .single();

  if (error || !application) {
    throw new Error('Application not found');
  }

  // Check if retry is allowed
  if (application.discord_role_assignment_retry_count >= 5) {
    throw new Error('Maximum retry attempts (5) exceeded. Please contact support.');
  }

  // Check if status is appropriate for retry
  if (application.status !== 'approved_role_failed' &&
      application.status !== 'approved_pending_role') {
    throw new Error('Application is not in a retryable state');
  }

  // Update status to pending
  await supabase
    .from('applications')
    .update({
      status: 'approved_pending_role',
      discord_role_assignment_status: 'pending'
    })
    .eq('id', applicationId);

  // Attempt role assignment
  const roleResult = await assignDiscordRole(application, application);

  if (roleResult.success) {
    await supabase
      .from('applications')
      .update({
        status: 'approved_role_assigned',
        discord_role_assignment_status: 'success',
        discord_role_assignment_attempted_at: new Date().toISOString(),
        discord_role_assignment_error: null
      })
      .eq('id', applicationId);

    return { success: true };
  } else {
    await supabase
      .from('applications')
      .update({
        status: 'approved_role_failed',
        discord_role_assignment_status: 'failed',
        discord_role_assignment_error: roleResult.error,
        discord_role_assignment_attempted_at: new Date().toISOString(),
        discord_role_assignment_retry_count: application.discord_role_assignment_retry_count + 1
      })
      .eq('id', applicationId);

    return { success: false, error: roleResult.error };
  }
};
```

**Step 4: Update UI to show role assignment status**

```typescript
// components/ApplicationRow.tsx or wherever applications are displayed
<div className="status-column">
  {application.status === 'approved_role_assigned' && (
    <Badge variant="success">Approved - Role Assigned</Badge>
  )}

  {application.status === 'approved_pending_role' && (
    <Badge variant="warning">
      Approved - Assigning Role...
      <Spinner size="sm" />
    </Badge>
  )}

  {application.status === 'approved_role_failed' && (
    <div>
      <Badge variant="danger">Approved - Role Assignment Failed</Badge>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleRetryRoleAssignment(application.id)}
      >
        Retry ({application.discord_role_assignment_retry_count}/5)
      </Button>
      {application.discord_role_assignment_error && (
        <Tooltip content={application.discord_role_assignment_error}>
          <InfoIcon />
        </Tooltip>
      )}
    </div>
  )}
</div>
```

#### Acceptance Criteria
- [ ] Database migration adds new status values and columns
- [ ] Application status updates to `approved_pending_role` before role assignment
- [ ] Successful role assignment updates status to `approved_role_assigned`
- [ ] Failed role assignment updates status to `approved_role_failed` with error message
- [ ] UI displays different badges for each status state
- [ ] Retry button appears for failed role assignments
- [ ] Retry attempts are limited to 5 per application
- [ ] All state transitions are atomic (no partial updates)
- [ ] Error messages are stored and displayed to admins

#### Testing Steps
1. **Success Path:**
   - Approve application with valid Discord user
   - Verify: Status changes to `approved_pending_role`
   - Verify: Role gets assigned
   - Verify: Status changes to `approved_role_assigned`

2. **Discord API Failure:**
   - Mock Discord API to return 500 error
   - Approve application
   - Verify: Status changes to `approved_role_failed`
   - Verify: Error message is stored in `discord_role_assignment_error`
   - Verify: Retry button appears

3. **Network Timeout:**
   - Mock fetch to delay 15 seconds
   - Approve application
   - Verify: Times out after 10 seconds
   - Verify: Status is `approved_role_failed` with timeout error

4. **Retry Success:**
   - Create application in `approved_role_failed` state
   - Fix underlying issue
   - Click retry button
   - Verify: Transitions to `approved_pending_role` → `approved_role_assigned`

5. **Retry Limit:**
   - Create application with `retry_count = 5`
   - Click retry button
   - Verify: Shows "Maximum retry attempts exceeded" error

6. **No Discord Integration:**
   - Approve application without Discord user ID
   - Verify: Status goes directly to `Approved` (not pending)
   - Verify: `discord_role_assignment_status` is `not_applicable`

#### Database Migration File
```typescript
// supabase/migrations/20250117_add_role_assignment_tracking.sql
-- Add new status enum values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
    CREATE TYPE application_status AS ENUM ('Pending', 'Approved', 'Rejected');
  END IF;

  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'approved_pending_role';
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'approved_role_assigned';
  ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'approved_role_failed';
END $$;

-- Add role assignment tracking columns
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS discord_role_assignment_status TEXT
  CHECK (discord_role_assignment_status IN ('pending', 'success', 'failed', 'not_applicable'))
  DEFAULT 'not_applicable',
ADD COLUMN IF NOT EXISTS discord_role_assignment_error TEXT,
ADD COLUMN IF NOT EXISTS discord_role_assignment_attempted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS discord_role_assignment_retry_count INTEGER DEFAULT 0;

-- Create index for finding failed assignments
CREATE INDEX IF NOT EXISTS idx_applications_role_assignment_failed
ON applications(discord_role_assignment_status, discord_role_assignment_attempted_at)
WHERE discord_role_assignment_status = 'failed';

-- Create index for finding pending assignments (for monitoring)
CREATE INDEX IF NOT EXISTS idx_applications_role_assignment_pending
ON applications(discord_role_assignment_status, reviewed_at)
WHERE discord_role_assignment_status = 'pending';

-- Backfill existing approved applications
UPDATE applications
SET
  discord_role_assignment_status = 'success',
  discord_role_assignment_attempted_at = reviewed_at
WHERE status = 'Approved'
  AND discord_role_assignment_status = 'not_applicable'
  AND custom_data ? 'discord_user_id';
```

#### Monitoring & Alerts
Add monitoring for stuck assignments:
```sql
-- Find applications stuck in pending state for > 5 minutes
SELECT
  id,
  status,
  reviewed_at,
  discord_role_assignment_attempted_at,
  discord_role_assignment_retry_count
FROM applications
WHERE discord_role_assignment_status = 'pending'
  AND reviewed_at < NOW() - INTERVAL '5 minutes';
```

---

### 🎫 TICKET #5: Enforce Unique Constraint on discord_configs.organization_id
**Priority:** 🟡 HIGH
**Severity:** HIGH
**Component:** Database Schema (`discord_configs` table)
**Estimated Effort:** 30 minutes

#### Description
The code uses `upsert` with `onConflict: 'organization_id'`, assuming a unique constraint exists. However, if this constraint wasn't created in the initial migration, multiple Discord configs can exist per organization, causing unpredictable behavior.

#### Current Issue
```typescript
// bot-callback/route.ts:168-183
await supabase
  .from('discord_configs')
  .upsert({
    organization_id: organizationId,
    guild_id: guildId,
    // ...
  }, {
    onConflict: 'organization_id' // ⚠️ Only works if unique constraint exists!
  });
```

**User Report:** "I see 2 duplicate records in discord_configs table"

#### Problems Without Unique Constraint
1. Multiple configs created per organization
2. `upsert` fails silently or creates duplicates
3. Queries return wrong config (first match)
4. Disconnect doesn't remove all configs
5. Settings page shows wrong/outdated config

#### Required Changes

**Step 1: Check if constraint exists**
```sql
-- Run this query to check
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'discord_configs'
  AND constraint_type = 'UNIQUE'
  AND constraint_name LIKE '%organization_id%';
```

**Step 2: Migration to add unique constraint**
```sql
-- supabase/migrations/20250117_add_discord_configs_unique_constraint.sql

-- Step 1: Find and log duplicate records
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT organization_id, COUNT(*) as cnt
    FROM discord_configs
    GROUP BY organization_id
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE NOTICE 'Found % organizations with duplicate discord_configs', duplicate_count;

    -- Log the duplicates
    RAISE NOTICE 'Duplicate organizations: %', (
      SELECT string_agg(organization_id::text, ', ')
      FROM (
        SELECT organization_id
        FROM discord_configs
        GROUP BY organization_id
        HAVING COUNT(*) > 1
      ) dups
    );
  END IF;
END $$;

-- Step 2: Create backup table
CREATE TABLE IF NOT EXISTS discord_configs_backup_20250117 AS
SELECT * FROM discord_configs;

-- Step 3: Remove duplicates (keep most recent)
WITH ranked_configs AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY organization_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
    ) as rn
  FROM discord_configs
)
DELETE FROM discord_configs
WHERE id IN (
  SELECT id FROM ranked_configs WHERE rn > 1
);

-- Step 4: Add unique constraint
ALTER TABLE discord_configs
ADD CONSTRAINT discord_configs_organization_id_key
UNIQUE (organization_id);

-- Step 5: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_discord_configs_org_id
ON discord_configs(organization_id);

-- Step 6: Log results
DO $$
DECLARE
  remaining_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_count FROM discord_configs;
  RAISE NOTICE 'Cleanup complete. Remaining discord_configs: %', remaining_count;
END $$;
```

**Step 3: Update code to handle constraint properly**
```typescript
// app/api/discord/bot-callback/route.ts
// The upsert will now work correctly, but add error handling:

try {
  const { data: config, error: upsertError } = await supabase
    .from('discord_configs')
    .upsert({
      organization_id: organizationId,
      guild_id: guildId,
      guild_name: guildName,
      bot_added_at: new Date().toISOString(),
      approved_role_id: approvedRole.id,
      approved_role_name: approvedRole.name,
    }, {
      onConflict: 'organization_id'
    })
    .select()
    .single();

  if (upsertError) {
    console.error('[Discord Bot Callback] Failed to save config:', upsertError);

    // Check if it's a constraint violation (shouldn't happen, but defensive)
    if (upsertError.code === '23505') { // unique_violation
      console.error('[Discord Bot Callback] Unique constraint violation - this should not happen!');
      // Try to delete existing and insert new
      await supabase
        .from('discord_configs')
        .delete()
        .eq('organization_id', organizationId);

      // Retry insert
      await supabase
        .from('discord_configs')
        .insert({...});
    } else {
      throw upsertError;
    }
  }
} catch (error) {
  // Handle error...
}
```

**Step 4: Add validation test**
```typescript
// __tests__/api/discord-config.test.ts
describe('discord_configs unique constraint', () => {
  it('should prevent duplicate configs per organization', async () => {
    const orgId = 'test-org-123';

    // First insert should succeed
    const { error: error1 } = await supabase
      .from('discord_configs')
      .insert({
        organization_id: orgId,
        guild_id: 'guild1',
        // ...
      });
    expect(error1).toBeNull();

    // Second insert with same org_id should fail
    const { error: error2 } = await supabase
      .from('discord_configs')
      .insert({
        organization_id: orgId,
        guild_id: 'guild2', // Different guild
        // ...
      });
    expect(error2).not.toBeNull();
    expect(error2.code).toBe('23505'); // unique_violation
  });

  it('should allow upsert to update existing config', async () => {
    const orgId = 'test-org-456';

    // First upsert
    await supabase
      .from('discord_configs')
      .upsert({
        organization_id: orgId,
        guild_id: 'guild1',
        guild_name: 'Old Name',
      }, { onConflict: 'organization_id' });

    // Second upsert should UPDATE, not create duplicate
    const { data } = await supabase
      .from('discord_configs')
      .upsert({
        organization_id: orgId,
        guild_id: 'guild2',
        guild_name: 'New Name',
      }, { onConflict: 'organization_id' })
      .select();

    // Verify only one record exists
    const { data: allConfigs } = await supabase
      .from('discord_configs')
      .select('*')
      .eq('organization_id', orgId);

    expect(allConfigs).toHaveLength(1);
    expect(allConfigs[0].guild_name).toBe('New Name');
  });
});
```

#### Acceptance Criteria
- [ ] Unique constraint exists on `discord_configs.organization_id`
- [ ] Migration successfully removes duplicate records
- [ ] Duplicate records are backed up before deletion
- [ ] Most recent config is kept when duplicates exist
- [ ] upsert operations work correctly
- [ ] New duplicate inserts are prevented (constraint violation error)
- [ ] Tests verify constraint enforcement

#### Testing Steps
1. **Pre-Migration Test (if duplicates exist):**
   ```sql
   -- Check for duplicates
   SELECT organization_id, COUNT(*) as count
   FROM discord_configs
   GROUP BY organization_id
   HAVING COUNT(*) > 1;
   ```

2. **Run Migration:**
   ```bash
   supabase migration up
   ```

3. **Post-Migration Validation:**
   ```sql
   -- Verify constraint exists
   SELECT constraint_name
   FROM information_schema.table_constraints
   WHERE table_name = 'discord_configs'
     AND constraint_type = 'UNIQUE';

   -- Verify no duplicates remain
   SELECT organization_id, COUNT(*)
   FROM discord_configs
   GROUP BY organization_id
   HAVING COUNT(*) > 1;
   -- Should return 0 rows
   ```

4. **Test Constraint Enforcement:**
   ```sql
   -- Try to insert duplicate (should fail)
   INSERT INTO discord_configs (organization_id, guild_id)
   VALUES ('existing-org-id', 'new-guild-id');
   -- Expected: ERROR: duplicate key value violates unique constraint
   ```

5. **Test Upsert Behavior:**
   - Connect Discord bot to organization A
   - Verify 1 config record created
   - Disconnect bot
   - Reconnect bot to different server
   - Verify: Still 1 config record (updated, not duplicated)

#### Rollback Plan
If issues arise:
```sql
-- Restore from backup
DELETE FROM discord_configs;
INSERT INTO discord_configs SELECT * FROM discord_configs_backup_20250117;

-- Remove constraint
ALTER TABLE discord_configs DROP CONSTRAINT IF EXISTS discord_configs_organization_id_key;
```

#### Documentation Update
Update schema documentation:
```markdown
## discord_configs Table

Stores Discord bot integration configuration per organization.

**Constraints:**
- `organization_id` must be unique (one Discord integration per organization)
- `guild_id` should be unique (one bot per Discord server) - TODO: Add in future migration

**Upsert Usage:**
```typescript
// Always use onConflict when upserting
await supabase.from('discord_configs').upsert(
  { organization_id, ...data },
  { onConflict: 'organization_id' }
);
```
```

---

## PHASE 3: RACE CONDITIONS & DATA CONSISTENCY

### 🎫 TICKET #6: Add Concurrency Control for Bot Connections
**Priority:** 🟡 HIGH
**Severity:** HIGH
**Component:** Bot Callback (`app/api/discord/bot-callback/route.ts`)
**Estimated Effort:** 2 hours

#### Description
No locking mechanism prevents simultaneous bot connection attempts. If a user clicks "Connect Bot" multiple times (in different tabs or during slow network), race conditions can occur where:
- Roles get created multiple times with different IDs
- Wrong role_id gets saved to database
- Guild state becomes inconsistent

#### Race Condition Scenario
```
Time  Tab A                           Tab B                        Discord Server
------|------------------------------|----------------------------|------------------
T0    User clicks "Connect"          -                           -
T1    OAuth redirect initiated       -                           -
T2    -                              User clicks "Connect"       -
T3    -                              OAuth redirect initiated    -
T4    Callback: Create role "Approved" -                         Role 123 created
T5    -                              Callback: Create role "Approved" Role 456 created
T6    Save role_id: 123              -                           -
T7    -                              Save role_id: 456           -
T8    CONFLICT: Two roles exist, wrong ID saved!
```

#### Required Changes

**Step 1: Add connection state tracking to database**

```sql
-- supabase/migrations/20250117_add_discord_connection_state.sql

ALTER TABLE discord_configs
ADD COLUMN IF NOT EXISTS connection_state TEXT
  CHECK (connection_state IN ('disconnected', 'connecting', 'connected', 'error'))
  DEFAULT 'disconnected',
ADD COLUMN IF NOT EXISTS connection_state_updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS connection_lock_token TEXT,
ADD COLUMN IF NOT EXISTS connection_error TEXT;

-- Index for finding stale locks
CREATE INDEX IF NOT EXISTS idx_discord_configs_connection_state
ON discord_configs(connection_state, connection_state_updated_at);

-- Function to clean up stale locks (older than 2 minutes)
CREATE OR REPLACE FUNCTION cleanup_stale_discord_connection_locks()
RETURNS INTEGER AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  UPDATE discord_configs
  SET
    connection_state = 'error',
    connection_error = 'Connection timed out',
    connection_lock_token = NULL
  WHERE connection_state = 'connecting'
    AND connection_state_updated_at < NOW() - INTERVAL '2 minutes'
  RETURNING * INTO cleaned_count;

  RETURN COALESCE(cleaned_count, 0);
END;
$$ LANGUAGE plpgsql;
```

**Step 2: Create connection lock helper functions**

```typescript
// lib/discord/connection-lock.ts

import { createClient } from '@/utils/supabase/server';
import { randomBytes } from 'crypto';

export class DiscordConnectionLock {
  private organizationId: string;
  private lockToken: string;
  private acquired: boolean = false;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
    this.lockToken = randomBytes(16).toString('hex');
  }

  /**
   * Attempts to acquire a connection lock for the organization
   * Returns true if lock acquired, false if another connection is in progress
   */
  async acquire(): Promise<{ success: boolean; reason?: string }> {
    const supabase = createClient();

    // First, clean up any stale locks
    await supabase.rpc('cleanup_stale_discord_connection_locks');

    // Check current connection state
    const { data: currentConfig } = await supabase
      .from('discord_configs')
      .select('connection_state, connection_state_updated_at, connection_lock_token')
      .eq('organization_id', this.organizationId)
      .single();

    if (currentConfig) {
      // If already connecting, check if it's stale
      if (currentConfig.connection_state === 'connecting') {
        const staleTime = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
        const updatedAt = new Date(currentConfig.connection_state_updated_at);

        if (updatedAt > staleTime) {
          return {
            success: false,
            reason: 'Another connection attempt is already in progress. Please wait.'
          };
        }
      }

      // If already connected, don't allow new connection
      if (currentConfig.connection_state === 'connected') {
        return {
          success: false,
          reason: 'Discord bot is already connected. Disconnect first to reconnect.'
        };
      }
    }

    // Try to acquire lock by setting connection state to 'connecting'
    const { error } = await supabase
      .from('discord_configs')
      .upsert({
        organization_id: this.organizationId,
        connection_state: 'connecting',
        connection_state_updated_at: new Date().toISOString(),
        connection_lock_token: this.lockToken,
        connection_error: null
      }, {
        onConflict: 'organization_id'
      });

    if (error) {
      console.error('[ConnectionLock] Failed to acquire lock:', error);
      return { success: false, reason: 'Failed to acquire connection lock' };
    }

    // Verify we actually got the lock (handle race condition)
    const { data: verifyConfig } = await supabase
      .from('discord_configs')
      .select('connection_lock_token')
      .eq('organization_id', this.organizationId)
      .single();

    if (verifyConfig?.connection_lock_token !== this.lockToken) {
      return {
        success: false,
        reason: 'Another connection attempt won the race. Please retry.'
      };
    }

    this.acquired = true;
    return { success: true };
  }

  /**
   * Releases the lock and sets final connection state
   */
  async release(success: boolean, error?: string): Promise<void> {
    if (!this.acquired) {
      console.warn('[ConnectionLock] Attempted to release lock that was not acquired');
      return;
    }

    const supabase = createClient();

    await supabase
      .from('discord_configs')
      .update({
        connection_state: success ? 'connected' : 'error',
        connection_state_updated_at: new Date().toISOString(),
        connection_lock_token: null,
        connection_error: error || null
      })
      .eq('organization_id', this.organizationId)
      .eq('connection_lock_token', this.lockToken); // Only update if we still own the lock

    this.acquired = false;
  }

  /**
   * Heartbeat to keep lock alive during long operations
   */
  async heartbeat(): Promise<void> {
    if (!this.acquired) return;

    const supabase = createClient();

    await supabase
      .from('discord_configs')
      .update({
        connection_state_updated_at: new Date().toISOString()
      })
      .eq('organization_id', this.organizationId)
      .eq('connection_lock_token', this.lockToken);
  }
}
```

**Step 3: Update bot-callback route to use locking**

```typescript
// app/api/discord/bot-callback/route.ts

import { DiscordConnectionLock } from '@/lib/discord/connection-lock';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');

  // ... existing validation code ...

  let lock: DiscordConnectionLock | null = null;

  try {
    // STEP 1: Acquire connection lock
    lock = new DiscordConnectionLock(organizationId);
    const lockResult = await lock.acquire();

    if (!lockResult.success) {
      console.log('[Discord Bot Callback] Could not acquire lock:', lockResult.reason);
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings?error=connection_in_progress&message=${encodeURIComponent(lockResult.reason)}`
      );
    }

    console.log('[Discord Bot Callback] Connection lock acquired');

    // STEP 2: Exchange code for token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      await lock.release(false, 'Failed to exchange OAuth code for token');
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Heartbeat to keep lock alive
    await lock.heartbeat();

    // STEP 3: Get guild information
    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!guildsResponse.ok) {
      await lock.release(false, 'Failed to fetch Discord guilds');
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=guilds_fetch_failed`);
    }

    const guilds = await guildsResponse.json();
    const guild = guilds[0];

    if (!guild) {
      await lock.release(false, 'No guilds found for bot');
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=no_guilds`);
    }

    // Heartbeat again
    await lock.heartbeat();

    // STEP 4: Check/create role
    const rolesResponse = await fetch(
      `https://discord.com/api/guilds/${guild.id}/roles`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
    );

    let approvedRole;
    const roleName = process.env.DISCORD_APPROVED_ROLE_NAME || 'Approved';

    if (rolesResponse.ok) {
      const roles = await rolesResponse.json();
      approvedRole = roles.find((role: any) => role.name === roleName);

      if (!approvedRole) {
        // Create role
        const createRoleResponse = await fetch(
          `https://discord.com/api/guilds/${guild.id}/roles`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: roleName,
              color: 0x00D9FF,
              hoist: false,
              mentionable: false,
            }),
          }
        );

        if (!createRoleResponse.ok) {
          await lock.release(false, 'Failed to create Discord role');
          return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=role_creation_failed`);
        }

        approvedRole = await createRoleResponse.json();
      }
    }

    // STEP 5: Save configuration
    const { error: upsertError } = await supabase
      .from('discord_configs')
      .upsert({
        organization_id: organizationId,
        guild_id: guild.id,
        guild_name: guild.name,
        bot_added_at: new Date().toISOString(),
        approved_role_id: approvedRole.id,
        approved_role_name: approvedRole.name,
      }, {
        onConflict: 'organization_id'
      });

    if (upsertError) {
      console.error('[Discord Bot Callback] Failed to save config:', upsertError);
      await lock.release(false, 'Failed to save Discord configuration');
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=save_config_failed`);
    }

    // STEP 6: Release lock with success
    await lock.release(true);

    console.log('[Discord Bot Callback] Connection completed successfully');
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?success=bot_connected`);

  } catch (error) {
    console.error('[Discord Bot Callback] Unexpected error:', error);

    if (lock) {
      await lock.release(false, error instanceof Error ? error.message : 'Unknown error');
    }

    return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=unexpected_error`);
  }
}
```

**Step 4: Update Settings UI to show connection state**

```typescript
// app/(authenticated)/dashboard/settings/Settings.tsx

const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
const [connectionError, setConnectionError] = useState<string | null>(null);

useEffect(() => {
  const loadDiscordConfig = async () => {
    // ... existing code ...

    if (config) {
      setConnectionState(config.connection_state || 'connected');
      setConnectionError(config.connection_error);
    }
  };

  // Poll connection state while connecting
  let pollInterval: NodeJS.Timeout;
  if (connectionState === 'connecting') {
    pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from('discord_configs')
        .select('connection_state, connection_error')
        .eq('organization_id', organization.id)
        .single();

      if (data) {
        setConnectionState(data.connection_state);
        setConnectionError(data.connection_error);

        if (data.connection_state !== 'connecting') {
          clearInterval(pollInterval);
        }
      }
    }, 2000); // Poll every 2 seconds
  }

  return () => {
    if (pollInterval) clearInterval(pollInterval);
  };
}, [connectionState]);

// Update connect button
<Button
  onClick={handleConnectBot}
  disabled={connectionState === 'connecting' || connectionState === 'connected'}
>
  {connectionState === 'connecting' && (
    <>
      <Spinner size="sm" /> Connecting...
    </>
  )}
  {connectionState === 'connected' && 'Connected'}
  {connectionState === 'disconnected' && 'Connect Discord Bot'}
  {connectionState === 'error' && 'Retry Connection'}
</Button>

{connectionState === 'error' && connectionError && (
  <Alert variant="error">
    <AlertTitle>Connection Failed</AlertTitle>
    <AlertDescription>{connectionError}</AlertDescription>
  </Alert>
)}
```

#### Acceptance Criteria
- [ ] Database schema includes connection state tracking
- [ ] Connection lock prevents concurrent connection attempts
- [ ] Stale locks (>2 minutes old) are automatically cleaned up
- [ ] Lock is released on both success and failure
- [ ] UI shows "Connecting..." state during OAuth flow
- [ ] UI shows error message if connection fails
- [ ] Multiple simultaneous clicks show "connection in progress" message
- [ ] Lock heartbeat prevents timeout during long operations

#### Testing Steps
1. **Normal Flow:**
   - Click "Connect Bot"
   - Complete OAuth
   - Verify: Connection succeeds, state is 'connected'

2. **Concurrent Connection Test:**
   - Open settings in Tab A
   - Open settings in Tab B
   - Click "Connect Bot" in Tab A
   - Immediately click "Connect Bot" in Tab B
   - Verify: Tab B shows "Another connection attempt is in progress"
   - Verify: Only one role created in Discord
   - Verify: Only one config record in database

3. **Stale Lock Cleanup:**
   - Manually set connection_state to 'connecting' with old timestamp:
     ```sql
     UPDATE discord_configs
     SET connection_state = 'connecting',
         connection_state_updated_at = NOW() - INTERVAL '5 minutes'
     WHERE organization_id = 'test-org';
     ```
   - Click "Connect Bot"
   - Verify: Stale lock is cleaned up
   - Verify: New connection attempt succeeds

4. **Lock Release on Error:**
   - Mock Discord API to return 500 error
   - Click "Connect Bot"
   - Verify: Error state is set
   - Verify: Lock is released (connection_lock_token is NULL)
   - Verify: Can retry immediately

5. **Heartbeat Test:**
   - Add artificial delay to OAuth callback (10 seconds)
   - Click "Connect Bot"
   - Verify: Lock remains active during delay
   - Verify: connection_state_updated_at is updated by heartbeats

#### Monitoring Query
```sql
-- Find organizations with stuck connections
SELECT
  organization_id,
  connection_state,
  connection_state_updated_at,
  EXTRACT(EPOCH FROM (NOW() - connection_state_updated_at)) as seconds_in_state,
  connection_error
FROM discord_configs
WHERE connection_state = 'connecting'
  AND connection_state_updated_at < NOW() - INTERVAL '2 minutes'
ORDER BY connection_state_updated_at;
```

---

### 🎫 TICKET #7: Fix AuthStore Initialization Race Condition
**Priority:** 🟡 MEDIUM
**Severity:** MEDIUM
**Component:** AuthStore (`lib/auth/authStore.ts`)
**Estimated Effort:** 1 hour

#### Description
Multiple components can trigger `AuthStore.initialize()` simultaneously. The early-return pattern doesn't wait for in-progress initialization, causing components to read `null` user/organization data.

#### Current Problematic Code
```typescript
// authStore.ts:31-37
initialize: async () => {
  if (state.initialized || state.isInitializing) {
    console.log('AuthStore: Already initialized or initializing, skipping...');
    return; // ⚠️ Returns immediately without waiting
  }

  set({ isInitializing: true });
  // ... async initialization ...
}
```

#### Race Condition Scenario
```
Time  Component A              Component B              AuthStore State
------|------------------------|------------------------|------------------
T0    useEffect runs          -                       initialized=false
T1    Calls initialize()      -                       isInitializing=true
T2    Fetching user data...   useEffect runs          isInitializing=true
T3    -                       Calls initialize()      isInitializing=true
T4    -                       Early return!           isInitializing=true
T5    -                       Reads user: NULL ❌     user=null
T6    Data loaded             -                       user={...}
```

**Component B gets null data even though initialization is happening!**

#### Required Changes

```typescript
// lib/auth/authStore.ts

interface AuthState {
  user: User | null;
  organization: Organization | null;
  initialized: boolean;
  isInitializing: boolean;
  error: Error | null;
  // Add promise tracking
  _initPromise: Promise<void> | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organization: null,
  initialized: false,
  isInitializing: false,
  error: null,
  _initPromise: null,

  /**
   * Initialize auth store
   * Can be called multiple times safely - subsequent calls wait for first initialization
   */
  initialize: async () => {
    const state = get();

    // If already initialized, return immediately
    if (state.initialized) {
      console.log('[AuthStore] Already initialized');
      return;
    }

    // If initialization is in progress, wait for it
    if (state._initPromise) {
      console.log('[AuthStore] Initialization already in progress, waiting...');
      await state._initPromise;
      return;
    }

    // Create new initialization promise
    const initPromise = (async () => {
      try {
        console.log('[AuthStore] Starting initialization...');
        set({ isInitializing: true, error: null });

        // Get current user session
        const supabase = createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(`Failed to get session: ${sessionError.message}`);
        }

        if (!session) {
          console.log('[AuthStore] No active session');
          set({
            user: null,
            organization: null,
            initialized: true,
            isInitializing: false,
            _initPromise: null
          });
          return;
        }

        // Load user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, organization_id, role')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          throw new Error(`Failed to load user: ${userError.message}`);
        }

        // Load organization data if user has one
        let organizationData = null;
        if (userData.organization_id) {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', userData.organization_id)
            .single();

          if (orgError) {
            console.warn('[AuthStore] Failed to load organization:', orgError);
            // Don't throw - user can exist without organization
          } else {
            organizationData = orgData;
          }
        }

        console.log('[AuthStore] Initialization complete', {
          userId: userData.id,
          orgId: organizationData?.id
        });

        set({
          user: userData,
          organization: organizationData,
          initialized: true,
          isInitializing: false,
          error: null,
          _initPromise: null
        });

      } catch (error) {
        console.error('[AuthStore] Initialization failed:', error);
        set({
          user: null,
          organization: null,
          initialized: false,
          isInitializing: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
          _initPromise: null
        });
        throw error;
      }
    })();

    // Store promise so concurrent calls can wait for it
    set({ _initPromise: initPromise });

    // Wait for initialization to complete
    await initPromise;
  },

  /**
   * Reset auth store (useful for logout)
   */
  reset: () => {
    set({
      user: null,
      organization: null,
      initialized: false,
      isInitializing: false,
      error: null,
      _initPromise: null
    });
  },

  /**
   * Force refresh of user and organization data
   */
  refresh: async () => {
    const state = get();

    // Reset initialized flag to force re-fetch
    set({ initialized: false, _initPromise: null });

    // Re-initialize
    await get().initialize();
  }
}));

// Helper hook that ensures initialization
export function useAuthStoreInitialized() {
  const store = useAuthStore();

  useEffect(() => {
    if (!store.initialized && !store.isInitializing) {
      store.initialize();
    }
  }, [store.initialized, store.isInitializing]);

  return store;
}
```

#### Usage in Components

**Before (problematic):**
```typescript
const Settings = () => {
  const { user, organization, initialize } = useAuthStore();

  useEffect(() => {
    initialize(); // May return before data is loaded
  }, []);

  if (!user) {
    return <Loading />; // May show loading forever
  }

  return <div>{organization?.name}</div>;
};
```

**After (fixed):**
```typescript
const Settings = () => {
  const { user, organization, initialized, isInitializing, error } = useAuthStoreInitialized();

  if (isInitializing) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error.message} />;
  }

  if (initialized && !user) {
    return <div>Not logged in</div>;
  }

  if (!organization) {
    return <div>No organization configured</div>;
  }

  return <div>{organization.name}</div>;
};
```

#### Acceptance Criteria
- [ ] `initialize()` can be called multiple times safely
- [ ] Concurrent calls wait for first initialization to complete
- [ ] Second call returns actual data, not null
- [ ] Promise is cleared after initialization completes
- [ ] Error state is properly tracked and exposed
- [ ] `useAuthStoreInitialized` hook automatically calls initialize
- [ ] Components using the hook get consistent data

#### Testing Steps
1. **Single Initialization:**
   - Call `initialize()` once
   - Verify: User and organization data loaded
   - Verify: `initialized = true`

2. **Concurrent Initialization:**
   ```typescript
   const store = useAuthStore.getState();

   const promise1 = store.initialize();
   const promise2 = store.initialize();
   const promise3 = store.initialize();

   await Promise.all([promise1, promise2, promise3]);

   // All should complete successfully
   // Only one database query should be made
   ```

3. **Sequential Initialization:**
   ```typescript
   await store.initialize();
   await store.initialize(); // Should return immediately
   await store.initialize(); // Should return immediately
   ```

4. **Component Mount Race:**
   - Create 3 components that all use `useAuthStoreInitialized`
   - Mount all 3 simultaneously
   - Verify: All receive the same user/org data
   - Verify: No component sees null after initialization

5. **Error Handling:**
   - Mock Supabase to return error
   - Call `initialize()`
   - Verify: Error state is set
   - Verify: Can retry by calling `initialize()` again

6. **Refresh Functionality:**
   - Initialize store
   - Update user data in database
   - Call `refresh()`
   - Verify: New data is loaded

#### Unit Tests
```typescript
// __tests__/lib/auth/authStore.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthStore } from '@/lib/auth/authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.reset();
    });
  });

  it('initializes only once for concurrent calls', async () => {
    const { result } = renderHook(() => useAuthStore());

    let queryCount = 0;
    jest.spyOn(supabase, 'from').mockImplementation(() => {
      queryCount++;
      return mockSupabaseQuery();
    });

    await act(async () => {
      await Promise.all([
        result.current.initialize(),
        result.current.initialize(),
        result.current.initialize()
      ]);
    });

    expect(queryCount).toBe(2); // Only session + user query, not 3x
    expect(result.current.initialized).toBe(true);
    expect(result.current.user).not.toBeNull();
  });

  it('subsequent calls wait for first initialization', async () => {
    const { result } = renderHook(() => useAuthStore());

    let resolveInit: () => void;
    const slowInit = new Promise<void>(resolve => {
      resolveInit = resolve;
    });

    jest.spyOn(supabase.auth, 'getSession').mockImplementation(async () => {
      await slowInit;
      return { data: { session: mockSession }, error: null };
    });

    // Start first init (will be slow)
    const promise1 = act(() => result.current.initialize());

    // Second init should wait
    const promise2Started = Date.now();
    const promise2 = act(() => result.current.initialize());

    // Let first init complete
    await act(async () => {
      resolveInit!();
      await promise1;
    });

    await promise2;
    const promise2Duration = Date.now() - promise2Started;

    // Second call should have waited
    expect(promise2Duration).toBeGreaterThan(0);
    expect(result.current.initialized).toBe(true);
  });

  it('returns immediately if already initialized', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(() => result.current.initialize());
    expect(result.current.initialized).toBe(true);

    const startTime = Date.now();
    await act(() => result.current.initialize());
    const duration = Date.now() - startTime;

    // Should return almost immediately (< 10ms)
    expect(duration).toBeLessThan(10);
  });
});
```

---

I'll continue with the remaining tickets in the next message. This file is getting long!

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Create security fix tickets (Issues #1-3)", "activeForm": "Creating security fix tickets", "status": "completed"}, {"content": "Create critical bug tickets (Issues #4-5)", "activeForm": "Creating critical bug tickets", "status": "completed"}, {"content": "Create race condition tickets (Issues #6-7)", "activeForm": "Creating race condition tickets", "status": "completed"}, {"content": "Create code quality tickets (Issues #8-10)", "activeForm": "Creating code quality tickets", "status": "in_progress"}, {"content": "Create architecture tickets (Issues #11-13)", "activeForm": "Creating architecture tickets", "status": "pending"}, {"content": "Create error handling tickets (Issues #14-15)", "activeForm": "Creating error handling tickets", "status": "pending"}, {"content": "Create performance tickets (Issues #16-17)", "activeForm": "Creating performance tickets", "status": "pending"}, {"content": "Create UX tickets (Issues #18-19)", "activeForm": "Creating UX tickets", "status": "pending"}, {"content": "Create missing features tickets (Issues #20-21)", "activeForm": "Creating missing features tickets", "status": "pending"}]