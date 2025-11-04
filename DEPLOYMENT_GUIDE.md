# 🚀 DEPLOYMENT GUIDE - Apply All Fixes

## Quick Start (5 minutes)

Follow these steps **in order** to deploy all fixes:

---

## ✅ STEP 1: Backup Your Database

**In Supabase Dashboard:**
1. Go to Database → Backups
2. Click "Create backup"
3. Wait for backup to complete
4. ✅ Checkpoint reached - Safe to proceed

---

## ✅ STEP 2: Apply RLS Policies

**In Supabase SQL Editor:**

```sql
-- Copy and paste the ENTIRE contents of this file:
-- viewer.gg/supabase/rls_policies_improved.sql

-- Then click "Run" button

-- You should see: "Success. No rows returned"
```

**Verify it worked:**
```sql
-- Run this verification query:
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public';

-- Expected: Should show ~15-20 policies
```

✅ Checkpoint reached - RLS policies applied

---

## ✅ STEP 3: Fix Existing Users

**In Supabase SQL Editor:**

```sql
-- Copy and paste the ENTIRE contents of this file:
-- viewer.gg/supabase/fix_existing_users_final.sql

-- Then click "Run" button

-- You should see:
-- "NOTICE: Created organization <uuid> for user <uuid> (<email>)"
-- "NOTICE: Migration complete: Created X organizations"
```

**Verify it worked:**
```sql
-- Run this verification query:
SELECT 
  COUNT(*) as total_users,
  COUNT(organization_id) as users_with_org,
  COUNT(*) - COUNT(organization_id) as users_without_org
FROM users;

-- Expected: users_without_org should be 0
```

✅ Checkpoint reached - All users have organizations

---

## ✅ STEP 4: Deploy Frontend Changes

**The code changes are already saved in your files.**

No additional deployment needed if you're running locally!

**If deploying to production:**
1. Commit all changes to git
2. Push to your repository
3. Deploy via your hosting platform (Vercel/Netlify/etc.)

✅ Checkpoint reached - Code deployed

---

## ✅ STEP 5: Test Everything

### Test 1: New User Registration
1. Open incognito/private window
2. Go to your app URL
3. Click "Continue with Discord"
4. Complete OAuth flow
5. **✅ Expected:** Dashboard loads without errors

### Test 2: Existing User Login
1. Log out
2. Log back in
3. **✅ Expected:** Dashboard loads immediately
4. **✅ Expected:** See your tournaments/applications

### Test 3: Check Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. **✅ Expected:** No red errors
4. **✅ Expected:** See logs like "Session found", "User profile found"

### Test 4: Check Database
```sql
-- Verify user has organization
SELECT u.email, u.organization_id, o.name as org_name
FROM users u
LEFT JOIN organizations o ON o.id = u.organization_id
WHERE u.email = 'your-email@example.com';

-- Expected: Should show your organization
```

✅ Checkpoint reached - Everything working!

---

## 🐛 TROUBLESHOOTING

### Issue: "Error creating user profile"
**Solution:**
1. Check Supabase logs (Dashboard → Logs)
2. Verify RLS policies applied (run Step 2 again)
3. Check user doesn't already exist

### Issue: "Error fetching tournaments" 
**Solution:**
1. Verify user has organization_id (run Step 3 again)
2. Check RLS policies include organization members
3. Check console for specific error

### Issue: "500 Server Error"
**Solution:**
1. Clear browser cache
2. Log out completely
3. Try incognito window
4. Check Supabase function logs

### Issue: Stats showing wrong data
**Solution:**
1. Verify organization filter in query
2. Check currentOrganizationId in appStore
3. Refresh the page

---

## 📊 VERIFICATION QUERIES

Run these in Supabase SQL Editor to verify everything:

```sql
-- 1. Check all users have organizations
SELECT 
  COUNT(*) as total_users,
  COUNT(organization_id) as users_with_org
FROM users;

-- 2. Check RLS policies exist
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Check recent user activity
SELECT 
  u.email,
  u.name,
  o.name as organization,
  u.created_at
FROM users u
LEFT JOIN organizations o ON o.id = u.organization_id
ORDER BY u.created_at DESC
LIMIT 5;

-- 4. Check application stats are isolated
SELECT 
  o.name as organization,
  COUNT(DISTINCT t.id) as tournaments,
  COUNT(a.id) as applications
FROM organizations o
LEFT JOIN tournaments t ON t.organization_id = o.id
LEFT JOIN applications a ON a.tournament_id = t.id
GROUP BY o.id, o.name;
```

---

## ✅ SUCCESS CRITERIA

You know everything is working when:

- ✅ New users can register without 500 errors
- ✅ All users have organization_id in database
- ✅ Dashboard loads with correct data
- ✅ Stats only show your organization's data
- ✅ No errors in browser console
- ✅ No errors in Supabase logs

---

## 🎉 DEPLOYMENT COMPLETE!

All fixes have been applied:
- ✅ No more race conditions
- ✅ Proper data isolation
- ✅ Improved RLS policies
- ✅ Better error handling
- ✅ Organization filtering working

**Next Steps:**
- Monitor Supabase logs for any errors
- Test with real users
- Check performance metrics
- Celebrate! 🎊

---

## 📞 NEED HELP?

If something isn't working:

1. Check the ALL_FIXES_APPLIED.md document
2. Review the TROUBLESHOOTING section above
3. Check Supabase logs in the dashboard
4. Verify all SQL migrations ran successfully
5. Clear browser cache and try incognito

**Remember:** You can always restore from the backup created in Step 1!

---

**Last Updated:** November 4, 2025  
**Estimated Time:** 5-10 minutes  
**Difficulty:** Easy (just copy/paste SQL!)
