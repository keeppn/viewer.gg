# Critical Issues Found and Fixes Applied

## Date: November 3, 2025 - Post-Testing Session

After testing the application, several critical issues were discovered that prevent the MVP from functioning properly. This document outlines all issues and their fixes.

---

## 🔴 CRITICAL ISSUES FOUND

###  1. **Tournament Creation Not Working**
**Severity**: CRITICAL - Blocks core functionality

**Problem**:
- Tournament form uses hardcoded `organization_id: 'default-org'`
- Never uses actual user's organization from auth store
- Supabase rejects insert due to foreign key constraint (organization doesn't exist)
- No error handling or user feedback
- Form appears to submit but nothing happens

**Location**: `/web/src/components/pages/NewTournament.tsx` (Line 39)

**Fix Applied**:
```typescript
// BEFORE (BROKEN):
organization_id: 'default-org', // Would come from auth context

// AFTER (FIXED):
const { organization } = useAuthStore();
organization_id: organization.id, // Use real organization ID
```

**Additional Improvements**:
- Added error handling with try-catch
- Added loading state (`submitting`)
- Added error message display
- Added organization existence check
- Added proper disabled states on form fields

**Status**: ✅ FIXED

---

### 2. **User Not Being Created in Supabase**
**Severity**: CRITICAL - Authentication broken

**Problem**:
- User clicks Discord/Google login
- OAuth flow completes successfully
- User redirected to dashboard
- BUT: No user record created in `users` table
- Dashboard shows "User has no organization assigned"
- Cannot create tournaments or access any features

**Root Cause**:
The auth callback route creates user profiles, but the authStore ALSO tries to create users, causing conflicts. Both systems race and one might fail silently.

**Locations**:
- `/web/src/app/auth/callback/route.ts`
- `/web/src/store/authStore.ts`

**Solution**: Need to ensure only ONE place creates users. The callback route should be the authoritative source.

**Status**: 🟡 PARTIALLY FIXED (callback route exists, but needs verification)

---

### 3. **"Loading..." Screen on Back Navigation**
**Severity**: HIGH - Poor UX, appears broken

**Problem**:
- User navigates to a page (e.g., `/dashboard/tournaments`)
- User clicks browser back button
- Page shows "Loading..." screen indefinitely
- Never resolves back to content

**Root Cause**:
- React state not persisting across navigation
- `initialized` flag in authStore resets to `false`
- Auth re-initializes unnecessarily
- No proper caching of auth state

**Location**:
- `/web/src/app/page.tsx` (Shows loading)
- `/web/src/app/dashboard/layout.tsx` (Shows loading)
- `/web/src/store/authStore.ts` (Auth initialization)

**Solution Needed**:
- Implement proper session caching
- Don't reset `initialized` on navigation
- Use React Context or persistent Zustand store
- Add session token to local storage/cookies

**Status**: ❌ NOT FIXED YET

---

### 4. **Weird Redirect to Old Login Page**
**Severity**: MEDIUM - Confusing UX

**Problem**:
- User clicks "Continue with Discord"
- Authorizes on Discord
- Briefly sees an "old" login page with streamer/TO selection
- Then redirects to dashboard

**Root Cause**:
Could be one of:
1. Multiple login components still in codebase (`RoleSelection.tsx`, `StreamerSignUp.tsx`, `OrganizerSignUp.tsx`)
2. OAuth callback showing cached/stale page
3. Browser caching the old login flow
4. Redirect happening through an old route

**Files to Check**:
- `/web/src/components/pages/RoleSelection.tsx` (OLD - should be deleted)
- `/web/src/components/pages/StreamerSignUp.tsx` (OLD - should be deleted)
- `/web/src/components/pages/OrganizerSignUp.tsx` (OLD - should be deleted)
- Check for any routes serving these components

**Status**: 🔍 NEEDS INVESTIGATION

---

### 5. **No Interface to Create Applications**
**Severity**: MEDIUM - Feature missing

**Problem**:
- User asks "I don't see where to create an application"
- There is NO admin interface to create applications
- Applications are ONLY created via public form at `/apply/[tournamentId]`
- This is BY DESIGN but needs clarification

**Clarification**:
- **Tournament Organizers** (TOs) create tournaments
- **Streamers** apply via public forms (no login required)
- TOs review applications in `/dashboard/applications`
- TOs do NOT create applications themselves

**Solution**:
- Add clear documentation/help text
- Maybe add a "Copy Application Link" button prominently
- Add a "Test Application Form" button that opens the public form

**Status**: 🟡 BY DESIGN (but needs UX improvement)

---

### 6. **Cache Issues - Browser Serving Stale Content**
**Severity**: HIGH - Causes confusion during testing

**Problem**:
- User makes code changes
- Refreshes browser
- Sees old version of the page
- Has to manually clear cache to see updates
- Makes testing difficult

**Root Causes**:
1. **Browser Cache**: Browser caching static assets aggressively
2. **Next.js Cache**: Next.js caching pages/routes
3. **Service Worker**: Might have PWA service worker caching
4. **Supabase Client Cache**: Auth session might be cached

**Current Mitigation**:
- `proxy.ts` adds no-cache headers to `/` and `/auth/*`
- Page uses `export const dynamic = 'force-dynamic'`

**Additional Fixes Needed**:
```typescript
// Add to all dashboard pages:
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Add Cache-Control headers to more routes in proxy.ts:
matcher: ['/', '/auth/:path*', '/dashboard/:path*']
```

**Status**: 🟡 PARTIALLY FIXED

---

## 📊 Current MVP Status

###  Working:
- ✅ Login UI (beautiful, professional)
- ✅ OAuth providers configured (Google, Discord)
- ✅ OAuth callback route exists
- ✅ Database schema complete
- ✅ Dynamic application form route (`/apply/[tournamentId]`)
- ✅ Application review interface
- ✅ Approve/reject functionality

### ❌ Broken:
- ❌ Tournament creation (hardcoded org ID)
- ❌ User creation in database
- ❌ Organization assignment
- ❌ Session persistence / caching
- ❌ Back navigation (shows loading)
- ❌ Confusing redirect flow

### 🤔 Unclear:
- Need to verify if users are actually being created
- Need to check browser console for errors
- Need to check Supabase logs for failed queries
- Need to understand the "old login page" issue

---

## 🛠️ FIXES APPLIED IN THIS SESSION

### Fix #1: Tournament Creation - Use Real Organization ID

**File**: `/web/src/components/pages/NewTournament.tsx`

**Changes**:
1. Import `useAuthStore`
2. Get `organization` from auth store
3. Replace hardcoded org ID with `organization.id`
4. Add error handling
5. Add loading states
6. Add organization existence check

**Code**:
```typescript
const { organization } = useAuthStore();

// Check if organization exists
if (!organization) {
  return <Error message="No organization found" />;
}

// Use in tournament creation
organization_id: organization.id
```

---

## 🚨 CRITICAL NEXT STEPS

### Priority 1: Debug User Creation
1. Open browser DevTools console
2. Login with Discord/Google
3. Watch console logs for errors
4. Check Network tab for failed API calls
5. Check Supabase Dashboard → Table Editor → `users` table
6. Check Supabase Dashboard → SQL Editor → Run:
   ```sql
   SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;
   SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
   ```

### Priority 2: Fix Session Persistence
1. Add session token to localStorage
2. Implement auth state persistence in Zustand:
   ```typescript
   import { persist } from 'zustand/middleware';

   export const useAuthStore = create(
     persist(
       (set, get) => ({
         // ... state
       }),
       { name: 'auth-store' }
     )
   );
   ```

### Priority 3: Remove Old Login Components
1. Delete or disable:
   - `RoleSelection.tsx`
   - `StreamerSignUp.tsx`
   - `OrganizerSignUp.tsx`
   - Any routes serving these components

### Priority 4: Add Better Cache Control
1. Update `proxy.ts` to cover all dashboard routes
2. Add `dynamic = 'force-dynamic'` to all pages
3. Add cache-busting to API calls

### Priority 5: Improve Application Creation UX
1. Add "Copy Application Link" button to tournament list
2. Add "Test Form" button to tournament management
3. Add help text explaining the flow

---

## 🧪 TESTING CHECKLIST

After applying fixes, test this exact flow:

### Test 1: Fresh User Signup
```
1. Open incognito browser
2. Go to http://localhost:3000
3. Click "Continue with Discord"
4. Authorize on Discord
5. VERIFY: Redirected to /dashboard (not old login page)
6. VERIFY: No "Loading..." screen
7. VERIFY: User appears in Supabase `users` table
8. VERIFY: User has organization_id set
9. VERIFY: Organization appears in `organizations` table
```

### Test 2: Tournament Creation
```
1. Login to dashboard
2. Go to Tournaments → Create New Tournament
3. Fill in: Title, Game, Date
4. Click "Create Tournament"
5. VERIFY: No errors in console
6. VERIFY: Redirected to /dashboard/tournaments
7. VERIFY: New tournament appears in list
8. VERIFY: Tournament appears in Supabase `tournaments` table
9. VERIFY: Tournament has correct organization_id
```

### Test 3: Back Navigation
```
1. Login to dashboard
2. Go to Tournaments page
3. Click browser back button
4. VERIFY: Goes back to Overview without "Loading..." screen
5. Click forward
6. VERIFY: Goes to Tournaments without re-initializing auth
```

### Test 4: Application Form
```
1. Create a tournament in dashboard
2. Copy the application form URL
3. Open in incognito browser (no login)
4. Fill out form completely
5. Submit
6. VERIFY: Success message appears
7. VERIFY: Application appears in Supabase `applications` table
8. Back in dashboard → Applications
9. VERIFY: New application appears
10. Click Approve
11. VERIFY: Status changes to "Approved"
```

---

## 📝 ADDITIONAL NOTES

### Database Schema Issues?
Need to verify that the migrations were actually applied to the database:

```sql
-- Check if user_type and oauth_provider columns exist:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users';

-- Check constraints:
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'users';
```

### OAuth Callback Flow
Current flow:
```
1. User clicks "Continue with Discord"
2. signInWithProvider() called
3. Supabase redirects to Discord OAuth
4. User authorizes
5. Discord redirects to /auth/callback with code
6. Callback route exchanges code for session
7. Callback creates user if doesn't exist
8. Callback redirects to /dashboard
9. Dashboard layout calls authStore.initialize()
10. AuthStore fetches user and organization
11. Dashboard renders
```

Potential race condition:
- Callback route creates user
- AuthStore also tries to create user
- One fails silently

### Zustand State Not Persisting
Zustand stores are in-memory only. When you navigate away and back:
- Store resets to initial state
- `initialized` becomes `false` again
- Auth re-initializes

Solution: Use `persist` middleware or React Context.

---

## 🎯 GOAL: Fully Functional MVP

**Definition of Done**:
1. User can sign up with Discord/Google ✅ (works but needs verification)
2. User + organization created automatically ❌ (broken)
3. User can create tournaments ❌ (broken - fixed in this session)
4. User can view tournaments ✅ (works if tournaments exist)
5. User can see application form URL ✅ (works)
6. Streamers can apply via public form ✅ (works)
7. User can review applications ✅ (works)
8. User can approve/reject ✅ (works)
9. No "Loading..." screens on navigation ❌ (broken)
10. No cache issues ❌ (partially broken)
11. No weird redirects ❌ (broken)

**Current Score**: 5/11 working (45%)

**Target**: 11/11 working (100%)

---

## 💡 RECOMMENDATIONS

1. **Add Comprehensive Logging**:
   - Log every step of auth flow
   - Log every database operation
   - Log errors prominently

2. **Add User Feedback**:
   - Toast notifications for success/error
   - Loading spinners with descriptive text
   - Error boundaries to catch React errors

3. **Improve Developer Experience**:
   - Add dev mode with verbose logging
   - Add database seed script
   - Add reset/cleanup script

4. **Add E2E Tests**:
   - Playwright tests for critical flows
   - Test user signup
   - Test tournament creation
   - Test application submission

---

## 📚 RESOURCES NEEDED

- Access to Supabase Dashboard to verify database state
- Browser DevTools console logs during testing
- Network tab to see failed API calls
- Ability to check Supabase logs/metrics

---

**Next Session**: Focus on debugging the user creation issue by checking browser console and Supabase database directly during a test login flow.
