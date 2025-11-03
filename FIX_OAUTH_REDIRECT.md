# Fix OAuth Redirect Issue - Remove # Hash Fragment

## Problem

After authorizing Discord login, you're redirected to:
```
https://app.viewer.gg/#
```

This shows an old login page instead of completing the OAuth flow.

## Root Cause

The OAuth redirect URL is configured incorrectly in **Supabase Dashboard**. It's using a hash fragment (`#`) which is from an old single-page-app routing approach.

---

## Solution: Update Supabase OAuth Configuration

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com
2. Select your project: `viewer.gg`
3. Click on **Authentication** in the left sidebar
4. Click on **URL Configuration**

### Step 2: Update Redirect URLs

Look for these fields and update them:

#### **Site URL**
```
Old: https://app.viewer.gg/#
New: https://app.viewer.gg
```

#### **Redirect URLs** (Add both of these)
```
https://app.viewer.gg/auth/callback
http://localhost:3000/auth/callback
```

#### **Remove any URLs with `/#`**
Delete any entries that look like:
- `https://app.viewer.gg/#`
- `https://app.viewer.gg/#!/auth`
- Any URL containing a hash `#`

### Step 3: Update OAuth Provider Settings

#### **Discord OAuth**
1. In Supabase Dashboard → Authentication → Providers
2. Click on **Discord**
3. Check the **Redirect URL** shown
4. It should be:
   ```
   https://sulxfeyzmocfczxotjda.supabase.co/auth/v1/callback
   ```
5. **Copy this URL**

6. Go to Discord Developer Portal:
   - https://discord.com/developers/applications
   - Select your application
   - Click **OAuth2** → **General**
   - In **Redirects**, ADD:
     ```
     https://sulxfeyzmocfczxotjda.supabase.co/auth/v1/callback
     ```
   - **Remove** any old redirect like `https://app.viewer.gg/#`
   - Click **Save Changes**

#### **Google OAuth**
1. In Supabase Dashboard → Authentication → Providers
2. Click on **Google**
3. Check the **Redirect URL** shown
4. **Copy this URL**

5. Go to Google Cloud Console:
   - https://console.cloud.google.com/apis/credentials
   - Select your OAuth 2.0 Client ID
   - In **Authorized redirect URIs**, ADD:
     ```
     https://sulxfeyzmocfczxotjda.supabase.co/auth/v1/callback
     ```
   - **Remove** any old redirect like `https://app.viewer.gg/#`
   - Click **Save**

---

## Verification

### Step 1: Clear Browser Cache
```
1. Open your browser
2. Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
3. Check "Cached images and files"
4. Select "All time"
5. Click "Clear data"
```

### Step 2: Test OAuth Flow

1. Go to http://localhost:3000 (for local testing)
2. Click "Continue with Discord"
3. Authorize on Discord
4. **Expected**: Redirect to http://localhost:3000/auth/callback
5. **Then**: Redirect to http://localhost:3000/dashboard
6. **Should NOT see**: Any page with `/#` in the URL
7. **Should NOT see**: Old login page with Twitch/YouTube/Kick buttons

### Step 3: Check Console

Open browser DevTools (F12) and look for:
```
✅ "Auth callback - User authenticated"
✅ "AuthStore: User profile found"
✅ "AuthStore: Organization created and linked" (if new user)
```

---

## Additional Fixes Applied in Code

### 1. Deleted Old Components ✅
These files have been deleted:
- ❌ `RoleSelection.tsx` - Old role selection page
- ❌ `StreamerSignUp.tsx` - Old streamer signup (deprecated)
- ❌ `OrganizerSignUp.tsx` - Old organizer signup (deprecated)
- ❌ `LoginForm.tsx` - Old login with Twitch/YouTube/Kick options
- ❌ `Apply.tsx` - Old static application form

### 2. Current Login Flow ✅
Now using:
- ✅ `LoginPage.tsx` - Modern, clean login with only Google/Discord
- ✅ No Twitch/YouTube/Kick options
- ✅ No role selection (all users are organizers)
- ✅ Streamers use public application forms (no login needed)

---

## File Structure After Cleanup

```
web/src/components/pages/
├── Analytics.tsx
├── Applications.tsx
├── AuthLayout.tsx          # Wrapper for login
├── Login.tsx               # Main login component
├── LoginPage.tsx           # ✅ GOOD - Only Google/Discord
├── Live.tsx
├── NewTournament.tsx
├── Overview.tsx
├── Reports.tsx
├── Settings.tsx
└── Tournaments.tsx

# DELETED (no longer exist):
# ❌ RoleSelection.tsx
# ❌ StreamerSignUp.tsx
# ❌ OrganizerSignUp.tsx
# ❌ LoginForm.tsx (old one with Twitch/YouTube/Kick)
# ❌ Apply.tsx (old static form)
```

---

## What Changed in Supabase Config

### Before (Broken):
```yaml
Site URL: https://app.viewer.gg/#
Redirect URLs:
  - https://app.viewer.gg/#
  - https://app.viewer.gg/#!/callback
```

### After (Fixed):
```yaml
Site URL: https://app.viewer.gg
Redirect URLs:
  - https://app.viewer.gg/auth/callback
  - http://localhost:3000/auth/callback
```

---

## Common Issues & Solutions

### Issue: Still seeing `/#` after updating Supabase
**Solution**:
- Clear browser cache completely
- Check Discord/Google OAuth app settings (not just Supabase)
- Make sure you saved changes in Supabase Dashboard

### Issue: "Redirect URI mismatch" error
**Solution**:
- The redirect URL in Supabase must match Discord/Google
- Copy the exact URL from Supabase → Providers → Discord/Google
- Paste it into Discord Developer Portal / Google Cloud Console

### Issue: Old login page still shows
**Solution**:
- This is browser cache
- Do a hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Or clear cache as shown above

### Issue: "Invalid redirect_uri" from Discord
**Solution**:
1. Go to Discord Developer Portal
2. OAuth2 → General → Redirects
3. Remove old URLs with `/#`
4. Add: `https://sulxfeyzmocfczxotjda.supabase.co/auth/v1/callback`
5. Save and wait 5 minutes for Discord to propagate changes

---

## Quick Reference: Correct URLs

### Production:
```
Site URL: https://app.viewer.gg
Callback: https://app.viewer.gg/auth/callback
```

### Development:
```
Site URL: http://localhost:3000
Callback: http://localhost:3000/auth/callback
```

### Supabase Callback (for OAuth providers):
```
https://sulxfeyzmocfczxotjda.supabase.co/auth/v1/callback
```

This is what you add to Discord and Google OAuth settings.

---

## Testing Checklist

After making changes:

- [ ] Updated Supabase Site URL (removed `/#`)
- [ ] Updated Supabase Redirect URLs
- [ ] Updated Discord OAuth redirect in Discord Developer Portal
- [ ] Updated Google OAuth redirect in Google Cloud Console
- [ ] Cleared browser cache
- [ ] Tested Discord login → No `/#` in URL
- [ ] Tested Google login → No `/#` in URL
- [ ] Redirects to `/dashboard` correctly
- [ ] No old login page with Twitch/YouTube/Kick
- [ ] User created in database with organization
- [ ] Can create tournaments

---

## Summary

**The Problem**: Supabase is configured with old redirect URLs using hash fragments (`/#`)

**The Fix**: Update Supabase Dashboard and OAuth provider settings to use proper callback routes

**Files Cleaned Up**: Deleted 5 old components that showed Twitch/YouTube/Kick login options

**Result**: Clean OAuth flow → Google/Discord only → Straight to dashboard ✅

---

## Need Help?

If you still see issues after making these changes:

1. **Check Supabase logs**: Dashboard → Logs → Filter for "auth"
2. **Check browser console**: Look for redirect errors
3. **Verify OAuth providers**: Make sure callbacks match exactly
4. **Wait a few minutes**: OAuth changes can take time to propagate

Send me:
- Screenshot of Supabase URL Configuration page
- Screenshot of Discord OAuth redirects
- Browser console errors during login
