# Local Testing Guide for Viewer.gg

## ✅ Issues Fixed

1. **Port Consistency**: All redirect URIs now use port 3000 (matches vite.config.ts)
2. **Created .env.local**: Proper local development environment file
3. **Fixed .env and .env.example**: Consistent port references across all files
4. **Verified Vite Config**: Server correctly set to port 3000

---

## 🔍 Pre-Testing Checklist

Before you start testing, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Supabase account and project created
- [ ] Git configured for version control
- [ ] Dependencies installed (`npm install`)

---

## 📝 Step-by-Step Local Testing Guide

### Step 1: Verify Dependencies

```bash
cd C:\Users\rados\viewer.gg
npm install
```

Expected Output:
- No errors
- All packages installed successfully
- `node_modules` folder populated

### Step 2: Configure Environment Variables

**Option A: Use .env.local (Recommended for local development)**
```bash
# Edit .env.local with your actual credentials
notepad .env.local
```

**Option B: Use .env (Alternative)**
```bash
# Edit .env with your actual credentials
notepad .env
```

**Required Credentials to Add:**

1. **Supabase Credentials** (Get from https://app.supabase.com)
   - Project URL: `https://yourproject.supabase.co`
   - Anon Key: Settings > API > anon public
   - Service Role Key: Settings > API > service_role (keep secret!)

2. **OAuth Providers** (Optional but recommended for full testing)
   - Twitch: https://dev.twitch.tv/console
   - Google: https://console.cloud.google.com
   - Discord: https://discord.com/developers/applications

3. **Discord Bot** (Optional, for Discord integration testing)
   - Bot Token from Discord Developer Portal
   - Bot Client ID

### Step 3: Set Up Supabase Database

1. **Go to your Supabase project**
   - Navigate to SQL Editor

2. **Run the schema**
   ```bash
   # Open the schema file
   notepad C:\Users\rados\viewer.gg\supabase\schema.sql
   ```
   - Copy all content
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **Verify tables created**
   - Check Table Editor
   - Should see: organizations, users, tournaments, applications, etc.

### Step 4: Configure OAuth Redirect URIs

⚠️ **CRITICAL**: All OAuth redirect URIs must match exactly!

**For Local Testing (Port 3000):**

1. **Supabase Auth Settings**
   - Go to Authentication > URL Configuration
   - Site URL: `http://localhost:3000`
   - Add Redirect URL: `http://localhost:3000/auth/callback`

2. **Twitch OAuth** (if using)
   - Dev Console > Your App > OAuth Redirect URLs
   - Add: `http://localhost:3000/auth/callback/twitch`
   - Also add Supabase callback: `https://yourproject.supabase.co/auth/v1/callback`

3. **Google OAuth** (if using)
   - Google Cloud Console > Credentials
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/callback/google`
     - `https://yourproject.supabase.co/auth/v1/callback`

4. **Discord OAuth** (if using)
   - Discord Developer Portal > OAuth2
   - Add Redirects:
     - `http://localhost:3000/auth/callback/discord`
     - `https://yourproject.supabase.co/auth/v1/callback`

### Step 5: Start Development Server

```bash
cd C:\Users\rados\viewer.gg
npm run dev
```

**Expected Output:**
```
VITE v6.2.0  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.X.X:3000/
➜  press h + enter to show help
```

**✅ Success Indicators:**
- No compilation errors
- Server starts on port 3000
- Can access in browser

**❌ Common Issues:**
- Port 3000 already in use → Kill the process or change port in vite.config.ts
- Module not found → Run `npm install` again
- TypeScript errors → Check tsconfig.json

### Step 6: Open and Test in Browser

1. **Open Browser**
   ```
   http://localhost:3000
   ```

2. **What You Should See:**
   - Login page with OAuth buttons
   - Clean UI with Viewer.gg branding
   - No console errors (press F12 to check)

### Step 7: Test Authentication Flow

**Test 1: Basic Page Load**
- [ ] Login page loads without errors
- [ ] Styles are applied correctly
- [ ] No console errors in DevTools (F12)

**Test 2: OAuth Authentication (if configured)**
1. Click "Sign in with [Provider]"
2. Should redirect to OAuth provider
3. Approve/login
4. Should redirect back to app
5. Should see dashboard

**Test 3: Without OAuth (Using Supabase Direct)**
If you haven't set up OAuth yet:
1. Use Supabase Auth UI or SQL to create test user
2. Test session persistence

### Step 8: Test Core Features (Mock Mode)

The app should work with mock data even without real API keys:

**Test Dashboard Pages:**
- [ ] Navigate to http://localhost:3000/dashboard
- [ ] Check Overview page loads
- [ ] Navigate to Tournaments
- [ ] Navigate to Applications
- [ ] Navigate to Analytics
- [ ] Navigate to Live
- [ ] Navigate to Reports
- [ ] Navigate to Settings

**Test Console for Errors:**
```javascript
// Open DevTools (F12) and check:
// 1. Console tab - No red errors (warnings are OK)
// 2. Network tab - API calls (if any) returning 200
// 3. Application tab - Check localStorage for session
```

### Step 9: Test Supabase Connection

**Check if Supabase is connected:**

1. Open DevTools Console (F12)
2. Run:
```javascript
// Check if env variables are loaded
console.log(import.meta.env.NEXT_SUPABASE_URL);
console.log(import.meta.env.NEXT_SUPABASE_ANON_KEY ? "Key loaded" : "No key");
```

3. Should see your Supabase URL and "Key loaded"

**Test Database Query:**
- Try to load tournaments or applications
- Check Network tab for Supabase requests
- Should see requests to `yourproject.supabase.co`

### Step 10: Test Discord Bot (Optional)

If you configured the Discord bot:

```bash
# In a new terminal
cd C:\Users\rados\viewer.gg
npm run discord-bot
```

**Expected Output:**
```
Discord bot logged in as [BotName]#1234
```

**Test Bot Functionality:**
1. Bot should be online in Discord server
2. Try inviting bot to test server
3. Test role assignment (requires approved application)

---

## 🧪 Testing Scenarios

### Scenario 1: Create a Tournament (Basic)

1. Navigate to Tournaments page
2. Click "Create New Tournament"
3. Fill in required fields:
   - Title: "Test Tournament"
   - Game: "League of Legends"
   - Start Date: Tomorrow
   - End Date: Day after tomorrow
4. Click Save
5. Verify tournament appears in list

### Scenario 2: Test Application Form

1. Find your test tournament
2. Copy application URL
3. Open in incognito window (simulates streamer view)
4. Fill out application form
5. Submit
6. Check Applications page in dashboard
7. Verify application appears

### Scenario 3: Test Application Management

1. Go to Applications page
2. Find test application
3. Click to view details
4. Try changing status:
   - Pending → Approved
   - Check if Discord bot sends message (if configured)
   - Try Rejected status

### Scenario 4: Test Analytics (Mock Data)

1. Navigate to Analytics page
2. Verify charts render
3. Check for any console errors
4. Test date range filters

### Scenario 5: Test Live Monitoring

1. Navigate to Live page
2. Should see live streamers list (if any)
3. Test refresh functionality
4. Verify no errors

---

## 🐛 Troubleshooting Guide

### Issue: Port 3000 Already in Use

**Solution:**
```bash
# Windows - Find and kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in vite.config.ts
```

### Issue: "Cannot find module" Errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Supabase Connection Fails

**Check:**
1. Is VITE_SUPABASE_URL correct?
2. Is VITE_SUPABASE_ANON_KEY correct?
3. Are credentials in .env or .env.local?
4. Did you restart dev server after changing .env?

**Test Connection:**
```javascript
// In browser console
import { supabase } from './lib/supabase';
const { data, error } = await supabase.from('organizations').select('*').limit(1);
console.log(data, error);
```

### Issue: OAuth Redirect Fails

**Common Causes:**
1. Redirect URI mismatch
2. OAuth provider not enabled in Supabase
3. Wrong credentials in .env

**Fix:**
1. Verify redirect URIs match exactly (case-sensitive)
2. Enable provider in Supabase Auth > Providers
3. Check credentials in .env are correct
4. Restart dev server

### Issue: White Screen / Blank Page

**Check:**
1. Browser console for errors (F12)
2. Network tab for failed requests
3. Verify all routes in router.tsx exist
4. Check App.tsx for rendering issues

**Debug:**
```bash
# Run with verbose logging
npm run dev -- --debug
```

### Issue: TypeScript Errors

**Solutions:**
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Common fix
npm install --save-dev @types/node @types/react @types/react-dom
```

### Issue: Styles Not Loading

**Check:**
1. PostCSS config present
2. Tailwind config correct
3. index.css imported in main file

**Verify:**
```bash
# Check if Tailwind is working
# Should see Tailwind classes in inspector
```

---

## ✅ Pre-Push Checklist

Before pushing to GitHub, ensure:

### 1. Code Quality
- [ ] No TypeScript errors: `npm run build`
- [ ] No linting errors: `npm run lint`
- [ ] All features tested locally

### 2. Environment Files
- [ ] `.env` has placeholder values (NO real credentials!)
- [ ] `.env.example` updated with all required variables
- [ ] `.env.local` in `.gitignore`
- [ ] Real credentials only in `.env.local` (not tracked by Git)

### 3. Git Status Check
```bash
git status
```

**Ensure NOT committing:**
- [ ] `.env` with real credentials
- [ ] `.env.local`
- [ ] `node_modules/`
- [ ] Any sensitive API keys

**Verify .gitignore includes:**
```
.env
.env.local
.env.production
.env.development
node_modules/
```

### 4. Final Tests
```bash
# Production build test
npm run build

# Preview production build
npm run preview
```

- [ ] Build succeeds without errors
- [ ] Preview works on http://localhost:4173

---

## 🚀 Pushing to GitHub

### Step 1: Check Git Status
```bash
cd C:\Users\rados\viewer.gg
git status
```

### Step 2: Stage Changes
```bash
# Stage specific files
git add .

# Or stage individually
git add package.json
git add src/
git add .env.example
# etc.
```

### Step 3: Verify What's Being Committed
```bash
git diff --staged
```

**Double-check:**
- No `.env` with real credentials
- No API keys
- No sensitive data

### Step 4: Commit Changes
```bash
git commit -m "Fix environment configuration and update redirect URIs to port 3000"
```

### Step 5: Push to GitHub
```bash
# First time
git push -u origin main

# Subsequent pushes
git push
```

### Step 6: Verify on GitHub
1. Go to your GitHub repository
2. Check files uploaded correctly
3. Verify `.env` not present (only `.env.example`)
4. Check README.md renders correctly

---

## 📊 Success Metrics

Your local testing is successful when:

✅ **Development Server**
- Starts without errors
- Runs on http://localhost:3000
- Hot reload works

✅ **Frontend**
- All pages accessible
- No console errors
- UI renders correctly
- Navigation works

✅ **Authentication**
- Login page loads
- OAuth redirects work (if configured)
- Session persists on refresh

✅ **Database**
- Supabase connection successful
- Can read/write data
- Tables exist and are accessible

✅ **Type Safety**
- No TypeScript errors
- Build completes successfully

✅ **Production Build**
- `npm run build` succeeds
- Preview works correctly

---

## 📚 Additional Resources

**Vite Documentation:**
- https://vitejs.dev/guide/

**Supabase Documentation:**
- https://supabase.com/docs
- Auth: https://supabase.com/docs/guides/auth

**React Router:**
- https://reactrouter.com/

**Testing Tools:**
- Chrome DevTools Guide: https://developer.chrome.com/docs/devtools/

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Console**: Always check browser console first (F12)
2. **Check Network Tab**: See if API calls are failing
3. **Verify Environment**: Ensure .env variables are loaded
4. **Restart Server**: Sometimes a restart fixes issues
5. **Clear Cache**: Try clearing browser cache and cookies
6. **Check Logs**: Look at terminal output for errors

**Common Commands:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Force clean build
npm run build -- --force

# Check for updates
npm outdated
```

---

## 📝 Notes

- **Port 3000** is now consistent across all configs
- **`.env.local`** is for your local development (not tracked by Git)
- **`.env.example`** is the template (tracked by Git)
- **OAuth Redirect URIs** must match exactly in all places
- Always test in **incognito/private mode** to verify clean sessions

**Environment File Priority:**
1. `.env.local` (highest priority - your actual credentials)
2. `.env` (tracked by Git - placeholders only)
3. `.env.example` (template for others)

---

**Good luck with your testing! 🚀**
