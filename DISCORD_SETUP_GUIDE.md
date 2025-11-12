# 🎮 Discord Bot Setup Guide - Complete Walkthrough

## 📍 Where You Are Now

You're on your **home laptop** and need to set up Discord bot integration from scratch.

---

## 🔑 STEP 1: Discord Developer Portal (5 minutes)

### 1.1 Access Developer Portal
Go to: https://discord.com/developers/applications

### 1.2 Create/Select Application
- If new: Click **"New Application"** → Name it "Viewer.gg Bot"
- If exists: Select your existing application

### 1.3 Get Bot Token (CRITICAL)
1. Go to **Bot** tab (left sidebar)
2. Click **"Reset Token"** button
3. **COPY THE TOKEN IMMEDIATELY** (you can't see it again!)
4. This is your `DISCORD_BOT_TOKEN` → Save it somewhere safe

### 1.4 Enable Required Intents
Still in the **Bot** tab, scroll down to **Privileged Gateway Intents**:
- ✅ **SERVER MEMBERS INTENT** (REQUIRED for role assignment)
- ✅ **MESSAGE CONTENT INTENT** (optional, for DM features)

Click **Save Changes**

### 1.5 Get OAuth2 Credentials
1. Go to **OAuth2** tab (left sidebar)
2. In the **General** section:
   - **CLIENT ID**: Copy this → `DISCORD_BOT_CLIENT_ID`
   - **CLIENT SECRET**: Click "Reset Secret", copy → `DISCORD_CLIENT_SECRET`

### 1.6 Add Redirect URIs
Still in **OAuth2** → **General**, scroll to **Redirects**:

Add these two URLs:
```
http://localhost:3000/api/discord/callback
https://app.viewer.gg/api/discord/callback
```

Click **Save Changes**

### 1.7 Generate Bot Invite Link
1. Go to **OAuth2** → **URL Generator**
2. Select **Scopes**:
   - ✅ `bot`
   - ✅ `applications.commands`

3. Select **Bot Permissions**:
   - ✅ Manage Roles
   - ✅ Send Messages  
   - ✅ Read Messages/View Channels
   - ✅ Manage Members

4. **Copy the generated URL** at the bottom
5. Open it in a new tab
6. Select your Discord server
7. Click **Authorize**

---

## 🔧 STEP 2: Update Environment Variables

### Your `.env.local` Location
`C:\Users\rados\viewer.gg\web\.env.local`

### What You Need to Add

I already fixed the Discord redirect URI for you. Now you need to replace these placeholders:

```env
# Line 21: Replace with the token from Step 1.3
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN_FROM_STEP_1.2

# Line 22: Replace with the client ID from Step 1.5  
DISCORD_BOT_CLIENT_ID=YOUR_CLIENT_ID_FROM_STEP_1.2
```

**Example (with placeholder values):**
```env
DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
DISCORD_BOT_CLIENT_ID=YOUR_DISCORD_CLIENT_ID_HERE
```

---

## 📊 What Each Value Does

| Variable | Where It's Used | Purpose |
|----------|----------------|---------|
| `DISCORD_CLIENT_ID` | OAuth login | User login to viewer.gg with Discord |
| `DISCORD_CLIENT_SECRET` | OAuth login | Validates Discord OAuth |
| `DISCORD_REDIRECT_URI` | OAuth login | Where Discord sends users after login |
| `DISCORD_BOT_TOKEN` | Bot API calls | Bot authenticates with Discord API |
| `DISCORD_BOT_CLIENT_ID` | Bot verification | Identifies your bot application |

---

## ✅ Verification Checklist

Before moving to code:

- [ ] Bot token copied and added to `.env.local`
- [ ] Client ID copied and added to `.env.local`
- [ ] Server Members Intent enabled
- [ ] Redirect URIs added (both localhost and production)
- [ ] Bot invited to your Discord server
- [ ] Bot has "Manage Roles" permission
- [ ] Bot's role is ABOVE the role it will assign (drag it higher in Server Settings → Roles)

---

## 🚨 Common Issues

### "Missing Access" Error
- Bot role must be higher than assigned roles in hierarchy
- Go to Server Settings → Roles → Drag bot role above tournament roles

### "Unknown User" Error
- Server Members Intent not enabled
- Go back to Developer Portal → Bot → Enable intent

### OAuth Redirect Mismatch
- Check redirect URI exactly matches (no trailing slash!)
- Wait 5 minutes after adding new redirect URIs

---

## 🎯 Next Steps

After completing this setup:

1. ✅ Environment variables configured
2. 🔄 Create Discord integration API endpoints
3. 🔄 Build Dashboard UI for bot connection
4. 🔄 Add Discord ID field to application form
5. 🔄 Connect approval flow to auto-role assignment

**Ready to continue?** Let me know and I'll create the missing integration code!