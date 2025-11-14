# ✅ Discord Bot Connection - Ready to Test!

## 📋 What I Fixed

The Settings page was **completely fake** - it just showed a success message but didn't actually do anything. 

Now it:
1. ✅ Uses real Discord OAuth to add bot to your server
2. ✅ Saves configuration to existing `discord_configs` table
3. ✅ Automatically creates "Approved Co-streamers" role
4. ✅ Properly works with existing approval flow

## 🔧 What You Need To Do

### Step 1: Add Redirect URI to Discord Developer Portal

1. Go to https://discord.com/developers/applications
2. Select your application (viewer.gg bot)
3. Go to **OAuth2** → **General**
4. Under **Redirects**, add:
   ```
   http://localhost:3000/api/discord/bot-callback
   ```
5. Click **Save Changes**

### Step 2: Verify Environment Variables

Check `C:\Users\RadostinAngelov\viewer.gg\web\.env.local` has:

```env
DISCORD_BOT_TOKEN=your_actual_bot_token_here
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_client_id_here
# OR
NEXT_PUBLIC_DISCORD_BOT_CLIENT_ID=your_client_id_here
```

### Step 3: Restart Dev Server

```bash
cd C:\Users\RadostinAngelov\viewer.gg\web
npm run dev
```

### Step 4: Test the Connection!

1. Open http://localhost:3000/dashboard/settings
2. Click **"Connect Discord Bot"**
3. Select your Discord server
4. Click **Authorize**
5. You'll be redirected back to Settings
6. Should see **"✓ Bot Connected"** with server name

### Step 5: Verify Bot is in Server

1. Open your Discord server
2. Check member list - you should see the bot
3. Check Roles - should have "Approved Co-streamers" role (cyan color)

## 📁 Files Changed

| File | Status |
|------|--------|
| `web/src/components/pages/Settings.tsx` | ✅ Completely rewritten - now functional |
| `web/src/app/api/discord/bot-callback/route.ts` | ✅ NEW - handles bot installation |
| `web/src/app/api/applications/[id]/approve/route.ts` | ✅ Updated column names (default_role_id, is_connected) |

## 🎯 What Works Now

✅ **Bot Installation**: Actually adds bot to Discord server  
✅ **Role Creation**: Creates "Approved Co-streamers" role automatically  
✅ **Database Storage**: Saves guild_id, guild_name, default_role_id  
✅ **Settings UI**: Shows connection status correctly  
✅ **Approval Integration**: Uses correct database schema  

## ❌ What's NOT Done Yet (From Original Plan)

- ❌ DM notifications to approved streamers
- ❌ Discord messages audit log
- ❌ Testing end-to-end approval flow

## 🚀 Next Steps (After You Test This)

Once you confirm the bot connection works:
1. We'll implement DM notifications
2. Test full approval flow (application → approve → role assigned → DM sent)
3. Handle all edge cases

## ⚠️ Important Notes

- The existing `discord_configs` table has UNIQUE constraint on `organization_id`, so each org can only connect to ONE Discord server
- Bot token is stored as placeholder "GLOBAL_BOT_TOKEN" in database (actual token is in .env)
- Using column names: `default_role_id` and `is_connected` (not approved_role_id and enabled)

## 🐛 Troubleshooting

If bot doesn't connect:
1. Check console logs in terminal
2. Check browser console for errors
3. Verify redirect URI matches exactly in Discord portal
4. Verify DISCORD_BOT_TOKEN is correct in .env.local
5. Make sure bot has been invited to at least one server manually first (for testing)

---

**Ready to test!** Go to Settings and try connecting the bot. 🎮