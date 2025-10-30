# Quick Start - Testing Viewer.gg Locally

## 🚀 Quick Commands

```bash
# 1. Install dependencies
cd C:\Users\rados\viewer.gg
npm install

# 2. Configure environment (choose one)
# Edit .env.local with your Supabase credentials
notepad .env.local

# 3. Start development server
npm run dev
# Opens on http://localhost:3000

# 4. Optional: Start Discord bot (in new terminal)
npm run discord-bot
```

## ✅ What Was Fixed

| Issue | Before | After |
|-------|--------|-------|
| Port Mismatch | Mixed 5173 & 3000 | Consistent 3000 |
| Environment File | Only .env | Added .env.local |
| OAuth Redirects | Wrong ports | Correct redirects |
| Vite Config | ✅ Already correct | Port 3000 |

## 📋 Testing Checklist

- [ ] `npm install` completed successfully
- [ ] Added Supabase credentials to `.env.local`
- [ ] `npm run dev` starts on port 3000
- [ ] Browser opens http://localhost:3000
- [ ] Login page loads without errors
- [ ] Check DevTools Console (F12) - no red errors
- [ ] Can navigate between pages

## 🔑 Required Credentials (Add to .env.local)

```bash
# Minimum Required
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Optional (for full OAuth testing)
VITE_TWITCH_CLIENT_ID=...
VITE_GOOGLE_CLIENT_ID=...
VITE_DISCORD_CLIENT_ID=...
```

Get Supabase credentials:
1. Go to https://app.supabase.com
2. Select your project
3. Settings > API
4. Copy Project URL and anon/public key

## ⚠️ Before Pushing to GitHub

```bash
# 1. Build test
npm run build

# 2. Verify .env.local is NOT staged
git status

# 3. Ensure .env.example has placeholders only
# 4. Push
git add .
git commit -m "Your message"
git push
```

## 🐛 Quick Troubleshooting

**Port 3000 in use?**
```bash
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Module errors?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Supabase not connecting?**
- Check credentials in .env.local
- Restart dev server: Ctrl+C, then `npm run dev`

**OAuth not working?**
- Verify redirect URIs in provider settings
- Must match: `http://localhost:3000/auth/callback/[provider]`
- Enable provider in Supabase Auth settings

## 📊 Success = All These Work

✅ Server starts on port 3000
✅ Login page loads
✅ No console errors (F12)
✅ Can navigate pages
✅ `npm run build` succeeds

## 📁 File Structure

```
viewer.gg/
├── .env.example      ← Template (tracked by Git)
├── .env.local        ← Your credentials (NOT in Git)
├── .env              ← Fallback (tracked, use placeholders)
├── LOCAL_TESTING_GUIDE.md  ← Full detailed guide
└── QUICK_START.md    ← This file
```

## 🔗 Useful URLs

- Local App: http://localhost:3000
- Supabase Dashboard: https://app.supabase.com
- Vite Docs: https://vitejs.dev
- Full Testing Guide: See LOCAL_TESTING_GUIDE.md

---

**Need more details?** Check `LOCAL_TESTING_GUIDE.md` for comprehensive testing steps!
