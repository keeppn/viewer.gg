# Discord Bot - Environment Variables Setup Guide

## 🚨 Current Issue

Your Settings page shows `client_id=undefined` because environment variables are not configured.

## ✅ Solution - 3 Steps

### **Step 1: Get Discord Credentials**

Go to https://discord.com/developers/applications

1. **Select your application** (or create new: "Viewer.gg Bot")

2. **Get Client ID** (OAuth2 → General)
   - Copy the "CLIENT ID"
   - Example: `1418599035312279653`

3. **Get Client Secret** (OAuth2 → General)
   - Click "Reset Secret"
   - Copy immediately (can't view again!)
   - Example: `dJYDtdFtPsQvhDS9csYGdl49ueLn5V_W`

4. **Get Bot Token** (Bot tab)
   - Click "Reset Token"
   - Copy immediately (can't view again!)
   - Example: `MTExMjIyMzMzNDQ0NTU1.GaBcDe.FgHiJk...`

5. **Enable Server Members Intent** (Bot tab)
   - Scroll to "Privileged Gateway Intents"
   - ✅ Enable "Server Members Intent" (REQUIRED!)
   - Click Save Changes

6. **Add Redirect URIs** (OAuth2 → General → Redirects)
   ```
   http://localhost:3000/api/discord/bot-callback
   https://app.viewer.gg/api/discord/bot-callback
   ```
   Click "Add" then "Save Changes"

---

### **Step 2: Create .env.local File**

Create file: `/home/user/viewer.gg/web/.env.local`

```bash
# Copy this entire block and replace YOUR_XXX with actual values
# =============================================================================

# Supabase (should already be set - check existing config)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Discord Bot Integration (ADD THESE)
NEXT_PUBLIC_DISCORD_CLIENT_ID=YOUR_CLIENT_ID_FROM_STEP_1.2
DISCORD_CLIENT_SECRET=YOUR_CLIENT_SECRET_FROM_STEP_1.3
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN_FROM_STEP_1.4

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional (some code checks for this)
DISCORD_BOT_CLIENT_ID=YOUR_CLIENT_ID_FROM_STEP_1.2
```

**Important:**
- Replace ALL `YOUR_XXX` placeholders with real values
- Do NOT commit this file to git (it's gitignored)
- Keep Bot Token secret - never share it!

---

### **Step 3: Restart Development Server**

After creating `.env.local`:

```bash
# Stop your Next.js server (Ctrl+C)
cd /home/user/viewer.gg/web
npm run dev
# OR
pnpm dev
# OR
yarn dev
```

**Why restart?** Next.js only reads `.env.local` on startup.

---

## 🧪 **Test It Works**

1. **Check environment variables loaded:**
   - Navigate to Settings page
   - Open browser DevTools console
   - Look for the Discord OAuth URL in console logs
   - Should show: `client_id=1418599035312279653` (NOT `undefined`)

2. **Test OAuth flow:**
   - Click "Connect Discord Bot"
   - Should redirect to Discord (not show "Invalid form body")
   - Select your Discord server
   - Authorize bot
   - Should redirect back to Settings with success message

---

## 🔒 **For Production (Vercel)**

If deploying to Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add these variables:
   ```
   NEXT_PUBLIC_DISCORD_CLIENT_ID = your_client_id
   DISCORD_CLIENT_SECRET = your_client_secret
   DISCORD_BOT_TOKEN = your_bot_token
   NEXT_PUBLIC_APP_URL = https://app.viewer.gg
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
   ```

3. Redeploy your application

---

## 📋 **Quick Verification Checklist**

Before testing the full workflow:

- [ ] `.env.local` file created in `/web/` folder
- [ ] `NEXT_PUBLIC_DISCORD_CLIENT_ID` set (NOT undefined)
- [ ] `DISCORD_CLIENT_SECRET` set
- [ ] `DISCORD_BOT_TOKEN` set
- [ ] `NEXT_PUBLIC_APP_URL` set to `http://localhost:3000` or production URL
- [ ] Server Members Intent enabled in Discord Developer Portal
- [ ] Redirect URIs added in Discord Developer Portal
- [ ] Development server restarted after creating `.env.local`
- [ ] Settings page OAuth URL no longer shows `client_id=undefined`

---

## 🎯 **Expected Behavior After Setup**

### **Settings Page (Before connecting bot):**
```
Discord Bot Integration
Status: Not Connected

Organization Settings
Organization Name: Radostin Angelov's Organization
Organization ID: 1565bad8-9ae8-4e26-a999-21abe9cd2c3f

[Connect Discord Bot] button
```

### **Click "Connect Discord Bot":**
- Redirects to Discord OAuth page
- Shows: "Viewer.gg Bot wants to access your Discord server"
- Dropdown: "Select a server" (shows servers where you have admin)
- Permissions listed: Manage Roles, View Channels, etc.

### **After authorizing:**
- Redirects to: `http://localhost:3000/api/discord/bot-callback?code=...&guild_id=...`
- Callback saves guild_id to database (`discord_configs` table)
- Redirects to Settings page with success message
- Status changes to: "Connected"
- Shows: Guild ID, connected timestamp

---

## ❓ **Troubleshooting**

### **Still shows `client_id=undefined`**
- Check `.env.local` is in correct location: `/home/user/viewer.gg/web/.env.local`
- Variable name MUST be `NEXT_PUBLIC_DISCORD_CLIENT_ID` (note the prefix!)
- Restart dev server after creating/editing `.env.local`

### **"Invalid form body" on Discord page**
- Client ID is incorrect or missing
- Check Discord Developer Portal → OAuth2 → Copy Client ID again
- Ensure no extra spaces in `.env.local`

### **OAuth redirect mismatch error**
- Add redirect URI in Discord Developer Portal
- Must exactly match: `http://localhost:3000/api/discord/bot-callback`
- Wait 5 minutes after adding redirect URI (Discord caches)

### **Bot doesn't assign roles later**
- Server Members Intent must be enabled
- Bot must be invited to the Discord server
- Bot's role must be ABOVE the role it's assigning
- `DISCORD_BOT_TOKEN` must be set (for API calls)

---

## 📚 **Related Documentation**

- Full setup guide: `/DISCORD_SETUP_GUIDE.md`
- Developer console guide: `/DISCORD_DEV_CONSOLE_GUIDE.md`
- Architecture overview: `/tasks/111125/DISCORD_ARCHITECTURE.md`
- Task status: `/tasks/141125/` (recent fixes)

---

## 🆘 **Need Help?**

If you're still stuck:

1. Check browser console for errors
2. Check Next.js server logs for errors
3. Verify all credentials are correct in Discord Developer Portal
4. Double-check `.env.local` syntax (no quotes around values needed)
5. Try clearing browser cache and restarting server

---

**Last updated:** 2025-11-14
**Related commit:** 48d47c7 (Settings page fixes)
