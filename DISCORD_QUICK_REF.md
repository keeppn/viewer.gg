# 🎯 Discord Setup - Quick Reference Card

## 📍 Discord Developer Portal
**URL:** https://discord.com/developers/applications

## 🔑 Values You Need

### From Bot Tab:
```
Bot Token (Reset Token button)
└─> Goes to: DISCORD_BOT_TOKEN in .env.local
    Example: MTExMjIyMzMzNDQ0NTU1.GaBcDe.FgHiJk...
```

### From OAuth2 → General:
```
Client ID
└─> Goes to: DISCORD_BOT_CLIENT_ID in .env.local
    Example: 1234567890123456789

Client Secret (Reset Secret button)
└─> Already in your .env.local as DISCORD_CLIENT_SECRET
    Current: dJYDtdFtPsQvhDS9csYGdl49ueLn5V_W
```

## ⚙️ Settings to Enable

### Bot Tab:
- [x] Server Members Intent ← CRITICAL!
- [x] Message Content Intent

### OAuth2 → General → Redirects:
```
http://localhost:3000/api/discord/callback
https://app.viewer.gg/api/discord/callback
```

## 🤖 Invite Bot to Server

### OAuth2 → URL Generator:
**Scopes:**
- bot
- applications.commands

**Permissions:**
- Manage Roles
- Send Messages
- Read Messages/View Channels  
- Manage Members

## 📝 Your Current .env.local Status

Located at: `C:\Users\rados\viewer.gg\web\.env.local`

```env
✅ DISCORD_CLIENT_ID=1418599035312279653
✅ DISCORD_CLIENT_SECRET=dJYDtdFtPsQvhDS9csYGdl49ueLn5V_W
✅ DISCORD_REDIRECT_URI=https://app.viewer.gg/auth/callback/discord

❌ DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN_FROM_STEP_1.2  ← REPLACE THIS
❌ DISCORD_BOT_CLIENT_ID=YOUR_CLIENT_ID_FROM_STEP_1.2  ← REPLACE THIS
```

## 🎯 Final Check

Before coding:
1. Open Discord Developer Portal
2. Copy Bot Token → Update line 21 in .env.local
3. Copy Client ID → Update line 22 in .env.local
4. Enable Server Members Intent
5. Add both redirect URIs
6. Invite bot to your server
7. Check bot role is above tournament roles

Done? → Ready for code integration! 🚀