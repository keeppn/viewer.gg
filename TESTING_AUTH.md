# Authentication Testing Checklist

## Pre-Testing Setup

### 1. Database Migration (REQUIRED)
Run this in Supabase Dashboard → SQL Editor:

```sql
-- Add auth fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('organizer', 'streamer')),
ADD COLUMN IF NOT EXISTS oauth_provider TEXT,
ADD COLUMN IF NOT EXISTS streaming_platform TEXT CHECK (streaming_platform IN ('Twitch', 'YouTube', 'Kick'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON users(oauth_provider);
```

### 2. Install Dependencies
```bash
cd web
npm install @supabase/ssr@^0.5.2
npm install
```

### 3. Verify Environment
Check `web/.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://sulxfeyzmocfczxotjda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### 4. Configure OAuth in Supabase
- Go to Supabase Dashboard → Authentication → Providers
- Enable: Google, Discord, Twitch, YouTube
- Set redirect URL: `http://localhost:3001/auth/callback`

## Testing Scenarios

### Test 1: Organizer Signup with Google ✅

**Steps:**
1. Start dev server: `npm run dev`
2. Open http://localhost:3001
3. Click "Sign Up" or "Get Started"
4. Select "Tournament Organizer"
5. Click "Sign up with Google"
6. Complete Google OAuth
7. Should redirect to `/dashboard`

**Expected Results:**
- ✅ Smooth OAuth flow
- ✅ Redirect to dashboard
- ✅ No console errors
- ✅ User appears in sidebar/header

**Database Verification:**
```sql
SELECT id, email, name, user_type, oauth_provider, role, streaming_platform
FROM users
WHERE email = 'your-google-email@gmail.com';
```

Expected values:
- `user_type`: `organizer`
- `oauth_provider`: `google`
- `role`: `admin`
- `streaming_platform`: `null`

---

### Test 2: Organizer Signup with Discord ✅

**Steps:**
1. Sign out
2. Clear browser data (optional but recommended)
3. Go to http://localhost:3001
4. Click "Sign Up"
5. Select "Tournament Organizer"
6. Click "Sign up with Discord"
7. Complete Discord OAuth
8. Should redirect to `/dashboard`

**Expected Results:**
- ✅ Discord OAuth works
- ✅ Redirect to dashboard
- ✅ User profile shows Discord avatar
- ✅ No errors in console

**Database Verification:**
```sql
SELECT id, email, name, user_type, oauth_provider, role
FROM users
WHERE oauth_provider = 'discord';
```

Expected values:
- `user_type`: `organizer`
- `oauth_provider`: `discord`
- `role`: `admin`

---

### Test 3: Streamer Signup with Twitch ✅

**Steps:**
1. Sign out
2. Go to http://localhost:3001
3. Click "Sign Up"
4. Select "Streamer"
5. Click "Sign up with Twitch"
6. Complete Twitch OAuth
7. Should redirect to `/dashboard`

**Expected Results:**
- ✅ Twitch OAuth works
- ✅ Streaming platform detected
- ✅ Profile shows Twitch info
- ✅ No console errors

**Database Verification:**
```sql
SELECT id, email, name, user_type, oauth_provider, role, streaming_platform
FROM users
WHERE oauth_provider = 'twitch';
```

Expected values:
- `user_type`: `streamer`
- `oauth_provider`: `twitch`
- `role`: `viewer`
- `streaming_platform`: `Twitch`

---

### Test 4: Existing User Login ✅

**Steps:**
1. Sign out
2. Go to http://localhost:3001
3. Click "Log In" (not Sign Up!)
4. Click provider you originally signed up with
5. Complete OAuth
6. Should redirect to `/dashboard`

**Expected Results:**
- ✅ Login successful
- ✅ No new user created
- ✅ Same profile as before
- ✅ Faster redirect (no user creation)

**Database Verification:**
```sql
SELECT COUNT(*) FROM users WHERE email = 'your@email.com';
```

Should return: `1` (no duplicate)

---

### Test 5: Protected Route Access ✅

**Steps:**
1. Sign out
2. Try to access http://localhost:3001/dashboard directly
3. Should redirect to `/`
4. Sign in
5. Should be able to access `/dashboard`

**Expected Results:**
- ✅ Unauthenticated users redirected
- ✅ After login, can access dashboard
- ✅ Middleware working correctly

---

### Test 6: Session Persistence ✅

**Steps:**
1. Sign in
2. Close browser tab
3. Reopen http://localhost:3001/dashboard
4. Should still be signed in

**Expected Results:**
- ✅ Session persists across browser restarts
- ✅ No re-authentication needed
- ✅ User data loads correctly

---

### Test 7: Sign Out ✅

**Steps:**
1. While signed in, click "Sign Out" button
2. Should redirect to home page
3. Try accessing `/dashboard`
4. Should redirect to `/`

**Expected Results:**
- ✅ Successfully signed out
- ✅ Protected routes inaccessible
- ✅ Can sign in again

---

## Console Checks

### ✅ Good Console Output
```
Supabase initialization: { url: 'Set', key: 'Set' }
Auth state changed: SIGNED_IN abc123...
Session found: abc123...
User data loaded: {...}
```

### ❌ Bad Console Output
```
Missing Supabase environment variables
Error fetching user: {}
PGRST116 error
Token expired
```

---

## Common Issues & Solutions

### Issue: "Missing environment variables"
**Cause:** `.env.local` not using `NEXT_PUBLIC_` prefix
**Fix:** Update `.env.local` with correct prefixes

### Issue: "Column does not exist"
**Cause:** Database migration not run
**Fix:** Run the SQL migration in Supabase

### Issue: User not created
**Cause:** RLS policies blocking insert
**Fix:** Check RLS policies allow authenticated users to insert

### Issue: OAuth provider not configured
**Cause:** Provider not enabled in Supabase
**Fix:** Enable provider in Supabase Dashboard

### Issue: Redirect fails
**Cause:** Redirect URL mismatch
**Fix:** Ensure callback URL is `http://localhost:3001/auth/callback`

### Issue: Port conflict
**Cause:** Port 3001 in use
**Fix:** Stop other process or change port in `.env.local`

---

## Debugging Commands

### Check all users
```sql
SELECT id, email, name, user_type, oauth_provider, role, streaming_platform, created_at
FROM users
ORDER BY created_at DESC;
```

### Check recent auth events
Go to: Supabase Dashboard → Authentication → Logs

### Clear test data
```sql
-- BE CAREFUL - This deletes all users!
DELETE FROM users WHERE email LIKE '%@test.com';
```

### Check RLS policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

---

## Success Criteria

Your authentication is working correctly if:

- [x] All OAuth providers work
- [x] User records created with correct fields
- [x] No duplicate users on login
- [x] Protected routes are protected
- [x] Sessions persist correctly
- [x] Sign out works properly
- [x] No console errors
- [x] Database has all required columns
- [x] RLS policies allow user creation
- [x] Middleware refreshes sessions

---

## Performance Check

Auth should be fast:
- OAuth redirect: < 1 second
- Callback processing: < 2 seconds
- User creation: < 1 second
- Dashboard load: < 3 seconds total

If slower, check:
- Supabase region (should be close to you)
- Network connection
- Browser extensions blocking requests
- Supabase logs for slow queries

---

## Next Steps After Testing

1. ✅ Test all scenarios above
2. ✅ Verify database records
3. ✅ Check for console errors
4. ✅ Test on different browsers
5. ⚠️ Configure for production (see AUTH_BEST_PRACTICES_FIX.md)

---

**Happy Testing!** 🧪
