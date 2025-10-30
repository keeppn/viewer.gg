# Authentication Testing Checklist

## Prerequisites
- [ ] Database migration `migration_add_auth_fields.sql` has been run
- [ ] All OAuth providers configured in Supabase Dashboard
- [ ] Environment variables set in `.env.local`
- [ ] Dev server is running (`npm run dev`)

## Test 1: Organizer Signup with Google
- [ ] Navigate to homepage
- [ ] Click "Sign Up"
- [ ] Select "Tournament Organizer"
- [ ] Click "Sign up with Google"
- [ ] Complete Google OAuth flow
- [ ] Verify redirect to `/dashboard`
- [ ] Check browser console for errors
- [ ] Verify in Supabase database:
  - User exists in `users` table
  - `user_type` = 'organizer'
  - `role` = 'admin'
  - `oauth_provider` = 'google'
  - `email`, `name`, `avatar_url` populated

## Test 2: Organizer Signup with Discord
- [ ] Sign out if signed in
- [ ] Navigate to homepage
- [ ] Click "Sign Up"
- [ ] Select "Tournament Organizer"
- [ ] Click "Sign up with Discord"
- [ ] Complete Discord OAuth flow
- [ ] Verify redirect to `/dashboard`
- [ ] Check browser console for errors
- [ ] Verify in Supabase database:
  - User exists in `users` table
  - `user_type` = 'organizer'
  - `role` = 'admin'
  - `oauth_provider` = 'discord'

## Test 3: Streamer Signup with Twitch
- [ ] Sign out if signed in
- [ ] Navigate to homepage
- [ ] Click "Sign Up"
- [ ] Select "Streamer"
- [ ] Click "Sign up with Twitch"
- [ ] Complete Twitch OAuth flow
- [ ] Verify redirect to `/dashboard`
- [ ] Check browser console for errors
- [ ] Verify in Supabase database:
  - User exists in `users` table
  - `user_type` = 'streamer'
  - `role` = 'viewer'
  - `oauth_provider` = 'twitch'
  - `streaming_platform` = 'Twitch'

## Test 4: Streamer Signup with YouTube
- [ ] Sign out if signed in
- [ ] Navigate to homepage
- [ ] Click "Sign Up"
- [ ] Select "Streamer"
- [ ] Click "Sign up with YouTube"
- [ ] Complete YouTube OAuth flow
- [ ] Verify redirect to `/dashboard`
- [ ] Check browser console for errors
- [ ] Verify in Supabase database:
  - User exists in `users` table
  - `user_type` = 'streamer'
  - `role` = 'viewer'
  - `oauth_provider` = 'youtube'
  - `streaming_platform` = 'YouTube'

## Test 5: Existing User Login
- [ ] Sign out if signed in
- [ ] Navigate to homepage
- [ ] Click "Log In"
- [ ] Select the same provider you signed up with before
- [ ] Click login button
- [ ] Verify immediate redirect to `/dashboard`
- [ ] Check that NO new user record was created
- [ ] Verify you can see your existing data

## Test 6: Error Handling
- [ ] Try to access `/dashboard` without being logged in
- [ ] Verify redirect to login page
- [ ] Check browser console during auth flow
- [ ] Verify error messages are user-friendly

## Test 7: Sign Out
- [ ] Click sign out button in dashboard
- [ ] Verify redirect to homepage
- [ ] Verify session cleared
- [ ] Try to access `/dashboard` again
- [ ] Verify redirect to login

## Browser Console Checks
During each test, watch for these console logs:
- ✅ "Session found: [user-id]"
- ✅ "User data loaded: [user-object]"
- ✅ "Auth callback - User data: ..."
- ✅ "User created successfully" (for new signups)
- ✅ "Existing user found, logging in..." (for logins)
- ❌ No errors related to missing columns
- ❌ No "Error fetching user" (unless expected during fallback)

## Database Verification Queries

Run these in Supabase SQL Editor to verify data:

```sql
-- Check all users
SELECT id, email, name, user_type, role, oauth_provider, streaming_platform
FROM users
ORDER BY created_at DESC;

-- Check for missing required fields
SELECT id, email, 
  CASE WHEN user_type IS NULL THEN 'MISSING user_type' ELSE 'OK' END as user_type_check,
  CASE WHEN oauth_provider IS NULL THEN 'MISSING oauth_provider' ELSE 'OK' END as provider_check
FROM users;

-- Count users by type
SELECT user_type, COUNT(*) as count
FROM users
GROUP BY user_type;

-- Count users by provider
SELECT oauth_provider, COUNT(*) as count
FROM users
GROUP BY oauth_provider;
```

## Common Issues & Solutions

### Issue: "Column does not exist" error
**Solution**: Run the database migration in Supabase SQL Editor

### Issue: User redirected to login after OAuth
**Solution**: Check browser console for localStorage values and callback errors

### Issue: "Error fetching user: {}"
**Solution**: This is handled by fallback logic, but check if user was created properly

### Issue: Callback shows error message
**Solution**: Check the error message in the callback page and browser console

## Success Criteria
✅ All auth flows work without errors
✅ Users are created with correct fields
✅ Existing users can log in without creating duplicates
✅ No console errors during auth flows
✅ Proper redirects after auth
✅ Sign out works correctly

---

**Last Updated**: October 30, 2025
**Next Review**: After implementing Kick OAuth
