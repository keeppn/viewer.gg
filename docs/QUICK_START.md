# 🚀 Quick Start: Fix Your Auth in 3 Steps

## The Problem You Had
```
✅ OAuth worked (Discord login successful)
❌ Error: "Error fetching user: {}"
❌ User record not created in database
❌ Redirected back to login page
```

## The Solution (3 Steps)

### Step 1: Run Database Migration (2 minutes)

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy the contents of `supabase/migration_add_auth_fields.sql`
4. Paste and click **Run**
5. You should see: "Success. No rows returned"

**What this does**: Adds `user_type`, `oauth_provider`, and `streaming_platform` columns to your users table.

### Step 2: Configure OAuth Providers (5 minutes)

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Enable these providers:

#### For Organizers:
- ✅ **Google** - Add your OAuth credentials
- ✅ **Discord** - Add your OAuth credentials

#### For Streamers:
- ✅ **Twitch** - Add your OAuth credentials  
- ✅ **YouTube** - Add your OAuth credentials (use Google provider + YouTube scope)

**Redirect URL for all**: `https://[your-project].supabase.co/auth/v1/callback`

### Step 3: Test It (3 minutes)

1. **Start your dev server**:
   ```bash
   cd web
   npm run dev
   ```

2. **Test Sign Up**:
   - Go to http://localhost:3000
   - Click "Sign Up"
   - Select "Tournament Organizer"
   - Click "Sign up with Discord"
   - Complete OAuth
   - ✅ Should redirect to dashboard

3. **Verify in Database**:
   - Supabase → Table Editor → `users` table
   - Your user should have:
     - `user_type`: 'organizer'
     - `role`: 'admin'
     - `oauth_provider`: 'discord'

## What Changed

### Before (Broken):
```typescript
// ❌ Callback tried to use localStorage on server-side
// ❌ Didn't check for existing users
// ❌ Missing database columns
```

### After (Working):
```typescript
// ✅ Callback checks if user exists first
// ✅ Creates user with all required fields
// ✅ Handles both signup AND login
// ✅ Database has all required columns
```

## Files Modified

### Must Review:
- `supabase/migration_add_auth_fields.sql` - **RUN THIS FIRST**
- `web/src/app/auth/callback/route.ts` - Complete rewrite

### Also Changed:
- `web/src/store/authStore.ts` - Improved fallback

### New Documentation:
- `docs/AUTH_SETUP.md` - Detailed setup guide
- `docs/AUTH_TESTING.md` - Testing checklist
- `docs/AUTH_FIX_SUMMARY.md` - Complete explanation

## Verification

After completing the 3 steps, you should see:

✅ **In Browser Console**:
```
Session found: [uuid]
Auth callback - User data: {...}
User created successfully
Redirecting to dashboard...
```

✅ **In Database** (users table):
```sql
| id | email | name | user_type | oauth_provider | role | streaming_platform |
|----|-------|------|-----------|----------------|------|-------------------|
| ... | your@email | You | organizer | discord | admin | null |
```

✅ **User Experience**:
- Smooth OAuth flow
- No errors in console
- Redirect to dashboard
- No "Error fetching user" message

## Troubleshooting

### Issue: "Column does not exist"
**Fix**: Run the migration in Step 1

### Issue: Still redirected to login
**Fix**: Check browser console for specific error

### Issue: OAuth provider not working
**Fix**: Verify credentials in Supabase Dashboard

## Need More Help?

Check these files for detailed information:
- `docs/AUTH_FIX_SUMMARY.md` - Full explanation of changes
- `docs/AUTH_SETUP.md` - Complete setup guide
- `docs/AUTH_TESTING.md` - Comprehensive testing guide

## Next: Test All Auth Flows

After the quick test above, go through:
1. Organizer signup (Google)
2. Organizer signup (Discord)
3. Streamer signup (Twitch)
4. Streamer signup (YouTube)
5. Login with existing account

Follow the detailed checklist in `docs/AUTH_TESTING.md`

---

**That's it! Your auth should now work perfectly.** 🎉

**Estimated Time**: 10 minutes
**Difficulty**: Easy
**Required**: Database access, OAuth provider credentials
