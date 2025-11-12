# 🎮 Discord Developer Console Setup - Complete Guide

## 🎯 What We're Building

**ONE Discord Bot Application** that:
- Can join MULTIPLE tournament organizer servers
- Assigns roles automatically when applications are approved
- Managed entirely through viewer.gg dashboard by each organizer

---

## 📍 PART 1: Create Discord Application (2 min)

### Step 1.1: Access Developer Portal
1. Go to: https://discord.com/developers/applications
2. Log in with your Discord account
3. You should see "Applications" page

### Step 1.2: Create New Application
1. Click **"New Application"** (top right)
2. Name it: **"Viewer.gg Bot"** or **"Tournament Manager"**
3. Check "I agree to Discord's Developer Terms of Service"
4. Click **"Create"**

**What you see:**
- General Information page with your app name
- Navigation sidebar on the left

---

## 🤖 PART 2: Configure Bot (5 min)

### Step 2.1: Create Bot User
1. Click **"Bot"** in left sidebar
2. You'll see "Build-A-Bot" section
3. Bot is already created with same name as application
4. Note the username (e.g., "Viewer.gg Bot")

### Step 2.2: Get Bot Token (CRITICAL!)
1. Under "TOKEN" section, click **"Reset Token"**
2. Confirm the action
3. **COPY THE TOKEN IMMEDIATELY** 
   - Format: `MTExMjIyMzMzNDQ0NTU1.GaBcDe.FgHiJk...`
   - This is your `DISCORD_BOT_TOKEN`
   - **You can't see this again!** Save it now!

4. Paste it into `web/.env.local`:
   ```env
   DISCORD_BOT_TOKEN=MTExMjIyMzMzNDQ0NTU1.GaBcDe.FgHiJk...
   ```

### Step 2.3: Configure Bot Settings

**Public Bot:**
- ✅ **Keep "PUBLIC BOT" enabled**
  - This allows tournament organizers to add it to their servers

**Requires OAuth2 Code Grant:**
- ⬜ **Leave UNCHECKED**
  - We use server-side OAuth, not client-side

**Privileged Gateway Intents** (scroll down):
- ⬜ Presence Intent (not needed)
- ✅ **SERVER MEMBERS INTENT** ← **CRITICAL!**
  - Required to fetch members and assign roles
  - Click the toggle to enable
- ✅ **MESSAGE CONTENT INTENT** ← **OPTIONAL**
  - Only needed if you want to read DMs
  - Enable for future features

5. Click **"Save Changes"** at bottom
---

## 🔐 PART 3: OAuth2 Configuration (5 min)

### Step 3.1: Get OAuth2 Credentials
1. Click **"OAuth2"** in left sidebar
2. Click **"General"** sub-tab

**Client Information Section:**
- **CLIENT ID**: Already visible
  - Copy this → `DISCORD_BOT_CLIENT_ID`
  - Format: `1234567890123456789`
  - Paste into `web/.env.local`:
    ```env
    DISCORD_BOT_CLIENT_ID=1234567890123456789
    ```

- **CLIENT SECRET**: 
  - Click **"Reset Secret"**
  - Confirm action
  - Copy the secret → `DISCORD_CLIENT_SECRET`
  - Format: `dJYDtdFtPsQvhDS9csYGdl49ueLn5V_W`
  - **This is for USER OAuth login** (different from bot token!)
  - Should already be in your `.env.local`

### Step 3.2: Add Redirect URIs
Scroll down to **"Redirects"** section:

1. Click **"Add Redirect"**
2. Enter: `http://localhost:3000/api/discord/bot-callback`
3. Click **"Add Redirect"** again
4. Enter: `https://app.viewer.gg/api/discord/bot-callback`
5. Click **"Save Changes"**

**Why two URLs?**
- `localhost:3000` → For local development/testing
- `app.viewer.gg` → For production deployment

**Important Notes:**
- ⚠️ No trailing slashes!
- ⚠️ Must be EXACT matches
- ⚠️ Changes take ~5 minutes to propagate

---

## 🎯 PART 4: Bot Permissions & Invite Setup (3 min)

### Step 4.1: Understanding Permission Value

We need the bot to have these permissions:
- **Manage Roles** (assign tournament roles)
- **Send Messages** (send DMs or announcements)
- **View Channels** (see server structure)
- **Read Message History** (optional)

**Permission Integer:** `268435456`
- This is the decimal value for "Manage Roles"
- We'll add more as needed

### Step 4.2: Generate Test Invite URL (Optional)

To test the bot on YOUR own server:

1. Go to **OAuth2** → **URL Generator**
2. Select **Scopes**:
   - ✅ `bot`
   - ✅ `applications.commands`

3. Select **Bot Permissions**:
   - ✅ Manage Roles
   - ✅ View Channels
   - ✅ Send Messages
   - ✅ Read Message History

4. **Copy the generated URL** at bottom
5. Open in new tab
6. Select YOUR test server
7. Click **Authorize**

**Result:** Bot joins your server with these permissions

---

## 🔍 PART 5: Verification Checklist

Before moving to code, verify:

### Environment Variables ✅
Open `C:\Users\rados\viewer.gg\web\.env.local`:

```env
# User OAuth (for login)
DISCORD_CLIENT_ID=1418599035312279653
DISCORD_CLIENT_SECRET=dJYDtdFtPsQvhDS9csYGdl49ueLn5V_W
DISCORD_REDIRECT_URI=https://app.viewer.gg/auth/callback/discord

# Bot credentials (for role assignment)
DISCORD_BOT_TOKEN=MTExMjIyMzMzNDQ0... ← MUST BE FILLED
DISCORD_BOT_CLIENT_ID=1234567890123456789 ← MUST BE FILLED
```

### Discord Developer Portal ✅
- [ ] Bot token copied and saved
- [ ] Client ID copied and saved
- [ ] Server Members Intent enabled
- [ ] Both redirect URIs added
- [ ] Bot invited to your test server (optional)

### Server Setup (If testing) ✅
- [ ] Bot appears in member list
- [ ] Bot role exists in Server Settings → Roles
- [ ] Bot role is ABOVE roles it will assign
  - Discord hierarchy: Higher roles can manage lower roles
  - Drag bot role above "Co-Streamer" role

---

## 🎓 Understanding the System

### How It All Connects

```
DISCORD APPLICATION (What you just set up)
  │
  ├─ BOT USER
  │   ├─ Token: Used by backend to make API calls
  │   ├─ Permissions: What bot can do in servers
  │   └─ Intents: What data bot can access
  │
  └─ OAUTH2
      ├─ Client ID: Identifies your app
      ├─ Client Secret: Validates requests
      └─ Redirects: Where Discord sends users back

VIEWER.GG BACKEND
  │
  ├─ User Login Flow
  │   Uses: DISCORD_CLIENT_ID + DISCORD_CLIENT_SECRET
  │   Purpose: Authenticate users on viewer.gg
  │
  └─ Bot Integration Flow
      Uses: DISCORD_BOT_TOKEN + DISCORD_BOT_CLIENT_ID
      Purpose: Assign roles in organizer servers
```

### Multiple Servers - How It Works

```
┌─────────────────────────────────────┐
│  VIEWER.GG BOT (One Application)    │
│  - Token: xyz123                    │
│  - Client ID: 1234567890            │
└─────────────────────────────────────┘
              │
              ├─────────────────┬─────────────────┬─────────────────┐
              │                 │                 │                 │
              ▼                 ▼                 ▼                 ▼
        ┌──────────┐      ┌──────────┐    ┌──────────┐      ┌──────────┐
        │ Server A │      │ Server B │    │ Server C │      │ Server D │
        │ (Org 1)  │      │ (Org 2)  │    │ (Org 3)  │      │ (Org 4)  │
        └──────────┘      └──────────┘    └──────────┘      └──────────┘
        guild_id:         guild_id:       guild_id:         guild_id:
        111111111         222222222       333333333         444444444
```

Each organizer:
1. Clicks "Connect Discord" in dashboard
2. Authorizes bot to join THEIR server
3. We store their `guild_id` in database
4. Bot operates in their server using the stored `guild_id`

---

## 🚀 Next Steps

You've completed the Discord Developer Console setup!

**Files Created:**
- ✅ `DISCORD_DEV_CONSOLE_GUIDE.md` (this file)
- ✅ `DISCORD_SETUP_GUIDE.md` (overview)
- ✅ `DISCORD_QUICK_REF.md` (quick reference)

**Ready to Build:**
1. Database migration (discord_configs table)
2. Backend API endpoints
3. Frontend Dashboard UI
4. Application form updates
5. Approval integration

**Tell me when you want to proceed!** 🎯