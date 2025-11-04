# Supabase Configuration Checklist

## ⚡ Quick Setup (5 minutes)

### 1️⃣ Database Migration (CRITICAL)

**Location:** Supabase Dashboard → SQL Editor

Copy and paste this SQL:

```sql
-- Add authentication-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('organizer', 'streamer')),
ADD COLUMN IF NOT EXISTS oauth_provider TEXT,
ADD COLUMN IF NOT EXISTS streaming_platform TEXT CHECK (streaming_platform IN ('Twitch', 'YouTube', 'Kick'));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON users(oauth_provider);

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('user_type', 'oauth_provider', 'streaming_platform');
```

**Expected Output:**
```
column_name         | data_type | is_nullable
--------------------|-----------|------------
user_type           | text      | YES
oauth_provider      | text      | YES
streaming_platform  | text      | YES
```

---

### 2️⃣ OAuth Providers Configuration

**Location:** Supabase Dashboard → Authentication → Providers

#### Google OAuth (for Organizers)

**Enable:** ✅ Yes

**Configuration:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI:
   ```
   https://sulxfeyzmocfczxotjda.supabase.co/auth/v1/callback
   ```
4. Copy Client ID and Client Secret
5. Paste in Supabase:
   - Client ID: `[your-google-client-id]`
   - Client Secret: `[your-google-client-secret]`

**Redirect URL in your app:**
```
http://localhost:3001/auth/callback
```

---

#### Discord OAuth (for Organizers)

**Enable:** ✅ Yes

**Configuration:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create New Application
3. Go to OAuth2 → Add Redirect:
   ```
   https://sulxfeyzmocfczxotjda.supabase.co/auth/v1/callback
   ```
4. Copy Client ID and Client Secret
5. Paste in Supabase:
   - Client ID: `[your-discord-client-id]`
   - Client Secret: `[your-discord-client-secret]`

**Redirect URL in your app:**
```
http://localhost:3001/auth/callback
```

---

#### Twitch OAuth (for Streamers)

**Enable:** ✅ Yes

**Configuration:**
1. Go to [Twitch Dev Console](https://dev.twitch.tv/console)
2. Register Your Application
3. Add OAuth Redirect URL:
   ```
   https://sulxfeyzmocfczxotjda.supabase.co/auth/v1/callback
   ```
4. Copy Client ID and Client Secret
5. Paste in Supabase:
   - Client ID: `[your-twitch-client-id]`
   - Client Secret: `[your-twitch-client-secret]`

**Redirect URL in your app:**
```
http://localhost:3001/auth/callback
```

---

#### YouTube OAuth (for Streamers)

**Enable:** ✅ Yes (Uses Google OAuth)

**Configuration:**
1. Use the same Google Cloud project as Google OAuth above
2. Enable YouTube Data API v3
3. Same Client ID and Secret as Google
4. Supabase handles scope automatically

**Scopes requested:**
```
https://www.googleapis.com/auth/youtube.readonly
```

---

### 3️⃣ RLS Policies Verification

**Location:** Supabase Dashboard → Authentication → Policies

Verify these policies exist on `users` table:

**Policy: "Users can view own profile"**
```sql
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);
```

**Policy: "Users can create own profile"**
```sql
CREATE POLICY "Users can create own profile"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);
```

**Policy: "Users can update own profile"**
```sql
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id);
```

---

### 4️⃣ Verification Queries

Run these to verify setup:

**Check users table structure:**
```sql
\d users
```

**Check existing users:**
```sql
SELECT COUNT(*), user_type 
FROM users 
GROUP BY user_type;
```

**Check RLS is enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';
```
Should show: `rowsecurity = true`

---

## 🎯 Verification Checklist

After completing the above:

### Database:
- [ ] Migration ran successfully
- [ ] Three new columns exist: `user_type`, `oauth_provider`, `streaming_platform`
- [ ] Indexes created on new columns
- [ ] RLS is enabled on users table

### OAuth Providers:
- [ ] Google OAuth configured
- [ ] Discord OAuth configured
- [ ] Twitch OAuth configured
- [ ] YouTube OAuth configured (via Google)
- [ ] All have correct redirect URLs

### Test One Provider:
- [ ] Pick one provider (e.g., Discord)
- [ ] Try to sign up in your app
- [ ] Check user was created in database
- [ ] Verify all fields populated correctly

---

## 🔧 Production Configuration

When deploying to production, update these URLs:

### 1. OAuth Provider Redirects
Change from:
```
http://localhost:3001/auth/callback
```

To:
```
https://your-domain.com/auth/callback
```

Update in:
- Google Cloud Console
- Discord Developer Portal
- Twitch Dev Console

### 2. Supabase Environment
Update in your production `.env`:
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 📊 Monitoring

### Check Auth Logs
**Location:** Supabase Dashboard → Authentication → Logs

Look for:
- Successful signups
- Login events
- Token refreshes
- Failed attempts

### Check User Growth
```sql
SELECT 
  DATE(created_at) as date,
  user_type,
  COUNT(*) as signups
FROM users
GROUP BY DATE(created_at), user_type
ORDER BY date DESC;
```

---

## 🆘 Troubleshooting

### Migration fails
**Error:** "relation users does not exist"
**Fix:** Run the main schema.sql first, then migration

### OAuth redirect mismatch
**Error:** "redirect_uri_mismatch"
**Fix:** Check redirect URLs match exactly in both places

### User not created
**Error:** Policy violation
**Fix:** Check RLS policies allow INSERT for authenticated users

### Can't see users in dashboard
**Error:** RLS blocking admin queries
**Fix:** Use service role key for admin queries, or temporarily disable RLS for testing

---

## ✅ All Done!

Once you've completed all steps:
1. ✅ Database migration ran
2. ✅ All OAuth providers configured
3. ✅ RLS policies verified
4. ✅ Test signup completed successfully

**You're ready to test authentication!**

Next step: Follow `TESTING_AUTH.md` for complete testing.
