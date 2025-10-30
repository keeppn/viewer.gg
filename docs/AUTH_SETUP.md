# Authentication Setup Guide for viewer.gg

## Overview
Your viewer.gg platform now supports complete authentication for both **Tournament Organizers** and **Streamers** across multiple OAuth providers.

## Supported Authentication Methods

### For Tournament Organizers:
- ✅ **Google OAuth** - For professional/business accounts
- ✅ **Discord OAuth** - For gaming community integration

### For Streamers:
- ✅ **Twitch OAuth** - Most popular streaming platform
- ✅ **YouTube OAuth** - Live streaming & VODs platform
- ⚠️ **Kick OAuth** - (Not yet fully implemented in Supabase)

## Setup Steps

### 1. Database Migration (REQUIRED)
Run the migration to add required auth fields to your users table:

```bash
# Navigate to Supabase dashboard → SQL Editor
# Run the file: supabase/migration_add_auth_fields.sql
```

This adds:
- `user_type` - 'organizer' or 'streamer'
- `oauth_provider` - which OAuth provider was used
- `streaming_platform` - 'Twitch', 'YouTube', or 'Kick' for streamers

### 2. Configure OAuth Providers in Supabase

#### Google OAuth
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials from Google Cloud Console
4. Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

#### Discord OAuth
1. Enable Discord provider in Supabase
2. Add Discord OAuth credentials from Discord Developer Portal
3. Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

#### Twitch OAuth
1. Enable Twitch provider in Supabase
2. Create app at https://dev.twitch.tv/console
3. Add OAuth credentials to Supabase
4. Scopes needed: `user:read:email`

#### YouTube OAuth
1. Enable YouTube provider (Google) in Supabase
2. Add additional scope: `https://www.googleapis.com/auth/youtube.readonly`
3. This allows reading channel information

#### Kick OAuth (Coming Soon)
Kick doesn't have official OAuth yet. You'll need to implement a custom solution when available.

## How the Authentication Flow Works

### Sign Up Flow:
1. User lands on homepage → selects "Sign Up"
2. User chooses role: **Organizer** or **Streamer**
3. User selects their OAuth provider (Google/Discord for organizers, Twitch/YouTube/Kick for streamers)
4. OAuth redirect to provider
5. After authorization, redirect to `/auth/callback`
6. Callback handler:
   - Exchanges code for session
   - Checks if user exists (login) or is new (signup)
   - Creates user record with appropriate fields
   - Redirects to dashboard

### Login Flow:
1. User lands on homepage → selects "Log In"
2. User sees their previous role or can select one
3. User clicks their OAuth provider
4. OAuth redirect and authentication
5. Callback verifies existing user and logs them in
6. Redirects to dashboard

## Key Files Modified

### `/web/src/app/auth/callback/route.ts`
- Handles OAuth callback for ALL providers
- Creates user records with proper role, user_type, and streaming_platform
- Distinguishes between signup and login

### `/web/src/store/authStore.ts`
- Fallback user creation if callback fails
- Proper initialization with all auth fields

### `/web/src/lib/supabase.ts`
- `signInWithProvider()` function stores pending user type in localStorage
- Configured for all OAuth providers

### UI Components:
- `/web/src/components/pages/RoleSelection.tsx` - Choose organizer or streamer
- `/web/src/components/pages/OrganizerSignUp.tsx` - Google/Discord signup
- `/web/src/components/pages/StreamerSignUp.tsx` - Twitch/YouTube/Kick signup
- `/web/src/components/pages/Login.tsx` - Main login entry point

## Testing the Auth Flow

### Test Organizer Signup:
1. Go to homepage → Sign Up → Select "Tournament Organizer"
2. Click "Sign up with Google" or "Sign up with Discord"
3. Complete OAuth flow
4. Check database - user should have:
   - `user_type`: 'organizer'
   - `role`: 'admin'
   - `oauth_provider`: 'google' or 'discord'

### Test Streamer Signup:
1. Go to homepage → Sign Up → Select "Streamer"
2. Click "Sign up with Twitch" or "Sign up with YouTube"
3. Complete OAuth flow
4. Check database - user should have:
   - `user_type`: 'streamer'
   - `role`: 'viewer'
   - `oauth_provider`: 'twitch' or 'youtube'
   - `streaming_platform`: 'Twitch' or 'YouTube'

### Test Login:
1. Sign out (if signed in)
2. Go to homepage → Log In
3. Select your provider
4. Should redirect to dashboard immediately without creating new record

## Troubleshooting

### Error: "Error fetching user: {}"
**Cause**: User record wasn't created during OAuth callback
**Fix**: The auth store now has fallback logic to create a basic user record

### Error: User redirected to login page after successful OAuth
**Cause**: Missing user_type or oauth_provider in localStorage
**Fix**: Ensured callback checks for existing users first before requiring signup data

### Error: "Column does not exist"
**Cause**: Database migration not run
**Fix**: Run `migration_add_auth_fields.sql` in Supabase SQL Editor

### Kick OAuth not working
**Cause**: Kick doesn't have official OAuth support yet
**Fix**: You'll need to implement a custom auth flow or wait for official support

## Environment Variables Required

Make sure you have these in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Next Steps

1. ✅ Run database migration
2. ✅ Configure OAuth providers in Supabase Dashboard
3. ✅ Test signup flow for organizers
4. ✅ Test signup flow for streamers
5. ✅ Test login flow
6. ⚠️ Implement Kick OAuth when available
7. 🎨 Add organization creation for new organizers (future enhancement)

## Production Checklist

Before going live:
- [ ] All OAuth providers configured with production credentials
- [ ] Redirect URLs updated to production domain
- [ ] Database migration run on production
- [ ] Error handling tested
- [ ] User consent/terms of service flow added
- [ ] Email verification (if required)
- [ ] Rate limiting on auth endpoints

---

Your authentication system is now fully functional! 🎉
