---
status: pending
---

# Implement Logout Functionality and Verify Data Isolation

## 📊 Description

Adding logout functionality to the viewer.gg dashboard and verifying that user data is properly isolated per account. Currently, users cannot log out, making it impossible to test multi-account functionality or switch between organizer and streamer accounts.

**The Problem We're Solving**:
- No logout button or functionality exists in the application
- Unable to test if data is properly isolated between different user accounts
- Cannot switch between different OAuth provider accounts
- Cannot verify if RLS policies are working correctly for multi-user scenarios

**Technical Approach**:
- Add logout functionality accessible through the "Admin" button in the header
- Implement a dropdown menu with user info and logout option
- Use Supabase's `signOut()` method to properly clear session
- Clear any client-side cached data
- Redirect to home/landing page after logout
- Test data isolation by logging in with different accounts

**Expected Deliverables**:
- Functional logout button with smooth UX
- Dropdown menu from Admin button showing user info + logout option
- Proper session clearing and redirect flow
- Verification that RLS policies correctly isolate data between users
- Documentation of data isolation test results

**Success Criteria**:
- User can click Admin button and see dropdown with logout option
- Logout clears session and redirects to landing page
- After logging in with different account, no data from previous account is visible
- Each user sees only their own tournaments, applications, and analytics
- RLS policies prevent unauthorized data access

---

## 🧠 Chain of Thought

### Why This Approach?

**Using Admin Button for User Menu**:
The Admin button is already prominently placed in the header and is a natural location for user-related actions. Converting it to a dropdown menu provides:
- Intuitive UX pattern (common in modern web apps)
- Space for additional user actions later (settings, profile, etc.)
- Maintains the premium aesthetic without cluttering the header
- Mobile-friendly implementation possible

**Supabase signOut() Method**:
Using Supabase's built-in `signOut()` ensures:
- Proper server-side session invalidation
- Automatic token cleanup
- OAuth provider session termination
- No stale authentication state

**Client-Side Cache Clearing**:
Need to clear Zustand store and any localStorage to prevent data leakage:
- Reset authStore state to initial values
- Clear any cached tournament or application data
- Reset navigation state if needed

### Key Logic & Patterns

**Logout Flow**:
1. User clicks Admin button → Dropdown opens
2. User clicks "Logout" → Confirmation (optional)
3. Call `supabase.auth.signOut()`
4. Clear Zustand auth store
5. Clear any other app state
6. Redirect to `/` (landing page)
7. Show success toast

**Data Isolation Verification**:
RLS policies should ensure:
- `users` table: Users can only view/update their own row (`auth.uid() = id`)
- `organizations` table: Only organization members see their org data
- `tournaments` table: Only tournament creator/org members can see/edit
- `applications` table: Streamers see their own, organizers see applications to their tournaments

**Dropdown Menu Implementation**:
- Use AnimatePresence for smooth open/close animations
- Close on outside click (useEffect with document listener)
- Show user avatar, name, email
- Logout button with hover effects matching app theme

### Critical References

- **Header Component**: /web/src/components/layout/Header.tsx — Where Admin button currently exists, needs dropdown added
- **Auth Store**: /web/src/store/authStore.ts — Zustand store managing authentication state, needs signOut action
- **Supabase Client**: /web/src/lib/supabase/client.ts — Client instance for auth operations
- **RLS Policies**: /RUN_THIS_NOW.sql — Current policies that should enforce data isolation
- **User Types**: /web/src/types/index.ts — User interface definition

### Expected Side Effects

**UX Changes**:
- Admin button becomes interactive dropdown instead of static display
- User menu appears on click with smooth animation
- Clicking outside dropdown closes it (standard pattern)

**State Management**:
- Auth store will have new `signOut` action
- All user-related state cleared on logout
- Any background subscriptions/listeners should be cleaned up

**Security Considerations**:
- Ensure signOut actually invalidates server session (not just client)
- No sensitive data remains in localStorage after logout
- Token cleanup prevents session replay attacks

### Learning & Insights

**To Discover**:
- Whether current RLS policies actually prevent cross-user data access
- If any data is being cached client-side that shouldn't persist across sessions
- Performance of data refetch after switching accounts
- Any edge cases with OAuth provider sessions

---

## 📚 KNOWLEDGE BASE

### Core System Paths

| Path | Purpose | Dependencies |
|------|---------|--------------|
| `/web/src/components/layout/Header.tsx` | Main header with Admin button | framer-motion, next/navigation |
| `/web/src/store/authStore.ts` | Zustand authentication store | zustand, @supabase/supabase-js |
| `/web/src/lib/supabase/client.ts` | Supabase client instance | @supabase/supabase-js |
| `/web/src/app/(authenticated)/layout.tsx` | Authenticated route layout | next.js 16 app router |
| `/web/src/types/index.ts` | TypeScript type definitions | - |

### Environment & Configuration

| File | Purpose | Required Variables |
|------|---------|-------------------|
| `/.env.local` | Local environment config | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY |
| `/web/src/lib/supabase/client.ts` | Supabase initialization | Uses env variables |

### External Integrations

| Service | Config Path | Documentation |
|---------|-------------|---------------|
| Supabase Auth | `/web/src/lib/supabase/client.ts` | https://supabase.com/docs/guides/auth |
| Discord OAuth | Configured in Supabase dashboard | https://supabase.com/docs/guides/auth/social-login/auth-discord |
| Google OAuth | Configured in Supabase dashboard | https://supabase.com/docs/guides/auth/social-login/auth-google |
| Twitch OAuth | Configured in Supabase dashboard | https://dev.twitch.tv/docs/authentication |
| YouTube OAuth | Configured in Supabase dashboard | https://developers.google.com/identity/protocols/oauth2 |

### Database Security

| Component | Location | Purpose |
|-----------|----------|---------|
| RLS Policies | `/RUN_THIS_NOW.sql` | Row-level security for data isolation |
| Users Table | Supabase dashboard | Auth users + profile data |
| Organizations Table | Supabase dashboard | Tournament organizer companies |
| Tournaments Table | Supabase dashboard | Tournament data with creator_id |
| Applications Table | Supabase dashboard | Streamer applications to tournaments |

---

## 🎯 Task Groups

### Group 1: Implement Logout UI
- [x] ~~**Create UserMenu dropdown component** — Build reusable dropdown menu component with user info display (avatar, name, email) and logout button, styled to match app theme with glassmorphism effects~~
      **✅ Completed: 07/11/25 18:45:00**
- [x] ~~**Add dropdown state to Header** — Implement useState for dropdown open/close, useEffect for click-outside-to-close, integrate with existing Admin button~~
      **✅ Completed: 07/11/25 18:50:00**
- [x] ~~**Style dropdown menu** — Match premium esports aesthetic with gradient borders, backdrop blur, smooth animations using framer-motion, ensure mobile responsive~~
      **✅ Completed: 07/11/25 18:55:00**
- [x] ~~**Add user avatar display** — Show actual user avatar from OAuth provider (user_metadata.avatar_url), fallback to UserCircleIcon if no avatar~~
      **✅ Completed: 07/11/25 19:00:00**

### Group 2: Implement Logout Logic
- [x] ~~**Add signOut action to authStore** — Create async signOut function in Zustand store that calls supabase.auth.signOut() and resets all store state to initial values~~
      **✅ Completed: 07/11/25 19:05:00** (Already existed in authStore)
- [x] ~~**Clear client-side state on logout** — Reset auth store, clear any cached data in other stores, ensure clean slate for next login~~
      **✅ Completed: 07/11/25 19:05:00** (Already implemented in signOut)
- [x] ~~**Implement logout flow** — Wire up logout button onClick to call signOut action, show loading state during sign out, handle errors gracefully~~
      **✅ Completed: 07/11/25 19:10:00**
- [x] ~~**Add redirect after logout** — Use next/navigation router to redirect to `/` (landing page) after successful sign out~~
      **✅ Completed: 07/11/25 19:10:00**

### Group 3: Test Data Isolation
- [ ] **Test with two different accounts** — Create test accounts with different OAuth providers (Discord + Google), log in as Account A, create tournament, log out
- [ ] **Verify data isolation** — Log in as Account B, confirm no access to Account A's tournaments or data, verify RLS policies work correctly
- [ ] **Test all user types** — Test with organizer account and streamer account, ensure proper data access based on user_type
- [ ] **Document RLS behavior** — Record which tables have RLS, what policies exist, what data each user type can access

### Group 4: Polish & Edge Cases
- [ ] **Add logout confirmation (optional)** — Consider adding "Are you sure?" modal for logout action to prevent accidental logouts
- [ ] **Add success feedback** — Show toast notification on successful logout with smooth fade-out
- [ ] **Handle logout errors** — Catch and display errors from sign out operation (network failures, etc.)
- [ ] **Test session persistence** — Verify that closing browser tab doesn't log user out (session should persist), but logout properly clears everything

---

## 📂 FILES CHANGED

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| /web/src/components/layout/UserMenu.tsx | Created | New dropdown menu component with user info display, profile/settings links, and logout button with premium styling |
| /web/src/components/layout/Header.tsx | Modified | Added UserMenu integration, click handlers, outside-click detection, user avatar display, signOut and router imports |

---

## 🔗 Previously Related Tasks

- Initial project setup established authentication with multiple OAuth providers
- RLS policies implemented in /RUN_THIS_NOW.sql for data isolation
- Header component created with Admin button placeholder
