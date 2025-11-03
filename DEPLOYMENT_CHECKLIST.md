# Deployment Checklist - After Git Push

## ✅ Git Push Complete

Your code has been pushed to GitHub. Vercel should automatically start deploying.

---

## 🚀 Vercel Deployment Steps

### 1. Monitor Deployment
- Go to https://vercel.com/dashboard
- Click on your `viewer.gg` project
- You should see a new deployment in progress
- Wait for it to complete (usually 2-5 minutes)

### 2. Check Deployment Status
Look for:
- ✅ **Building** - Vercel is compiling your Next.js app
- ✅ **Deploying** - Uploading to Vercel's CDN
- ✅ **Ready** - Deployment successful

### 3. Common Build Errors to Watch For
If the build fails, check for:
- TypeScript errors
- Missing dependencies
- Environment variables not set

---

## ⚙️ Critical: Update Vercel Environment Variables

Your `.env.local` file is not pushed to Git (for security). You need to add these in Vercel Dashboard:

### Required Environment Variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add these variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sulxfeyzmocfczxotjda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]

# App Config
NEXT_PUBLIC_APP_URL=https://app.viewer.gg
NODE_ENV=production
```

3. **Important**: Set these for **Production**, **Preview**, and **Development** environments

4. After adding variables, **Redeploy** the project

---

## 🔧 Supabase OAuth Configuration (Critical!)

After deployment, you MUST update Supabase OAuth settings:

### 1. Update Site URL
Supabase Dashboard → Authentication → URL Configuration

**Site URL:**
```
https://app.viewer.gg
```

### 2. Add Redirect URLs
**Redirect URLs** (add both):
```
https://app.viewer.gg/auth/callback
http://localhost:3000/auth/callback
```

**Remove any old URLs with `/#`**

### 3. Update OAuth Providers

#### Discord:
1. Discord Developer Portal → Your App → OAuth2 → Redirects
2. Add: `https://sulxfeyzmocfczxotjda.supabase.co/auth/v1/callback`
3. Remove: Any URLs with `app.viewer.gg/#`

#### Google:
1. Google Cloud Console → Credentials → OAuth 2.0 Client
2. Authorized redirect URIs → Add: `https://sulxfeyzmocfczxotjda.supabase.co/auth/v1/callback`
3. Remove: Any URLs with `app.viewer.gg/#`

---

## 🧪 Testing After Deployment

### Test 1: Visit Production Site
```
1. Go to https://app.viewer.gg
2. Should see clean login page (no Twitch/YouTube/Kick)
3. Only Google and Discord buttons
```

### Test 2: Test OAuth Flow
```
1. Click "Continue with Discord"
2. Authorize on Discord
3. Should redirect to: https://app.viewer.gg/auth/callback
4. Then redirect to: https://app.viewer.gg/dashboard
5. Should NOT see /#/ in URL
```

### Test 3: Check User Creation
```
1. Login with Discord or Google
2. Open browser DevTools → Console
3. Look for: "Organization created and linked"
4. Check Supabase → Table Editor → users
5. Your user should have organization_id set
```

### Test 4: Create Tournament
```
1. Dashboard → Tournaments → Create New
2. Fill in: Title, Game, Date
3. Click "Create Tournament"
4. Should succeed and redirect to tournaments list
5. Check Supabase → tournaments table
```

### Test 5: Public Application Form
```
1. Create a tournament
2. Copy application URL
3. Open in incognito browser
4. Should see: https://app.viewer.gg/apply/[tournament-id]
5. Fill and submit form
6. Check Supabase → applications table
```

---

## 🐛 Troubleshooting

### Issue: Build fails on Vercel
**Check:**
- Vercel build logs for specific error
- TypeScript compilation errors
- Missing environment variables
- Node version compatibility

### Issue: "Site URL mismatch" after deployment
**Fix:**
- Update Supabase Site URL to production URL
- Make sure redirect URLs include production domain
- Clear browser cache

### Issue: OAuth redirects to localhost instead of production
**Fix:**
- Check Supabase redirect URLs
- Make sure production URL is first in the list
- Verify Discord/Google OAuth app settings

### Issue: Users not created in database
**Fix:**
1. Check browser console for errors
2. Check Supabase logs
3. Verify RLS policies allow inserts
4. Run `fix_existing_users.sql` migration

### Issue: Tournament creation fails
**Fix:**
1. Check browser console for error
2. Verify user has organization_id
3. Check Supabase logs for database errors
4. Verify RLS policies on tournaments table

---

## 📊 What Changed in This Deployment

### Code Changes:
- ✅ Fixed tournament creation (uses real organization ID)
- ✅ Auto-create organizations for new users
- ✅ Created OAuth callback handler
- ✅ Converted /apply to dynamic route
- ✅ Deleted 5 legacy components
- ✅ Removed Twitch/YouTube/Kick login options

### Files Added:
- ✅ `auth/callback/route.ts` - OAuth handler
- ✅ `apply/[tournamentId]/page.tsx` - Dynamic application form
- ✅ `proxy.ts` - Cache control middleware
- ✅ `fix_existing_users.sql` - Database migration
- ✅ 7 documentation files

### Files Deleted:
- ❌ 5 old login components
- ❌ Old static /apply page

---

## ✅ Post-Deployment Checklist

- [ ] Vercel deployment successful
- [ ] Environment variables set in Vercel
- [ ] Supabase Site URL updated to production URL
- [ ] Supabase redirect URLs include production domain
- [ ] Discord OAuth redirect updated
- [ ] Google OAuth redirect updated
- [ ] Browser cache cleared
- [ ] Can access https://app.viewer.gg
- [ ] Login with Discord works (no `/#` in URL)
- [ ] Login with Google works (no `/#` in URL)
- [ ] User has organization after login
- [ ] Can create tournaments successfully
- [ ] Public application form works
- [ ] Can review and approve applications

---

## 🎯 Expected Results

After all configuration updates:

✅ **Clean OAuth flow**: Discord/Google → Callback → Dashboard
✅ **No hash fragments**: No `/#` in any URLs
✅ **Auto-organization**: Every user gets an organization
✅ **Tournament creation**: Works with real organization ID
✅ **Application forms**: Dynamic routes work correctly
✅ **Legacy removed**: No old Twitch/YouTube/Kick options

---

## 📞 If You Need Help

**Vercel Issues:**
- Check Vercel build logs
- Verify environment variables are set
- Check for TypeScript/build errors

**Supabase Issues:**
- Check Supabase logs in Dashboard
- Verify OAuth redirect URLs
- Check RLS policies

**OAuth Issues:**
- Follow [FIX_OAUTH_REDIRECT.md](FIX_OAUTH_REDIRECT.md)
- Verify Discord & Google settings
- Clear browser cache completely

---

## 🚀 Next Steps After Successful Deployment

1. **Test thoroughly** using the checklist above
2. **Update OAuth settings** in Supabase/Discord/Google
3. **Invite beta testers** to try the application
4. **Monitor Vercel logs** for any runtime errors
5. **Check Supabase metrics** for database usage

---

## 📈 Deployment Summary

**Git Commit**: `4b67b31`
**Branch**: `master`
**Files Changed**: 26 files
**Lines Added**: ~3,258
**Lines Removed**: ~1,609

**Major Features:**
- OAuth authentication flow fixed
- Tournament creation fixed
- Legacy code removed
- Documentation added

**Status**: 🟢 **Ready for Production** (after OAuth configuration)
