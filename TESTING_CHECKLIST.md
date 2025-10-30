# Interactive Testing Checklist - Viewer.gg

**Copy this checklist and check items off as you complete them!**

---

## 🎯 PRE-TESTING SETUP

### Environment Setup
- [ ] Opened project folder: `C:\Users\rados\viewer.gg`
- [ ] Verified Node.js installed: `node --version` (need 18+)
- [ ] Verified npm installed: `npm --version`
- [ ] Dependencies installed: `npm install` (no errors)

### Supabase Setup
- [ ] Created Supabase account at https://app.supabase.com
- [ ] Created new project in Supabase
- [ ] Got Project URL from Settings > API
- [ ] Got anon/public key from Settings > API
- [ ] Got service_role key from Settings > API (optional)

### Environment Configuration
- [ ] Opened `.env.local` file
- [ ] Added `VITE_SUPABASE_URL=` with my project URL
- [ ] Added `VITE_SUPABASE_ANON_KEY=` with my anon key
- [ ] Saved `.env.local` file

### Database Setup
- [ ] Opened `supabase/schema.sql` file
- [ ] Copied all content from schema.sql
- [ ] Went to Supabase SQL Editor
- [ ] Pasted schema content
- [ ] Clicked "Run" 
- [ ] Verified no errors in execution
- [ ] Checked Table Editor - saw new tables created

---

## 🚀 BASIC TESTING (REQUIRED)

### Start Development Server
- [ ] Opened terminal in project folder
- [ ] Ran: `npm run dev`
- [ ] Saw "ready in XXX ms" message
- [ ] Saw "Local: http://localhost:3000/"
- [ ] No error messages in terminal

### Browser Testing
- [ ] Opened browser
- [ ] Navigated to: http://localhost:3000
- [ ] Login page loaded successfully
- [ ] Styles are applied (looks good, not broken)
- [ ] Pressed F12 to open DevTools
- [ ] Checked Console tab - no red errors
- [ ] Checked Network tab - requests to Supabase visible

### Page Navigation
- [ ] Can navigate to: http://localhost:3000/dashboard
- [ ] Redirects to login if not authenticated (expected)
- [ ] No 404 errors when navigating
- [ ] No console errors when changing pages

---

## 🔐 AUTHENTICATION TESTING (IF OAUTH CONFIGURED)

### OAuth Setup (Optional)
- [ ] Decided which OAuth to use: Twitch / Google / Discord
- [ ] Created OAuth app in provider console
- [ ] Added redirect URI: `http://localhost:3000/auth/callback/[provider]`
- [ ] Copied Client ID to `.env.local`
- [ ] Copied Client Secret to `.env.local`
- [ ] Enabled provider in Supabase Auth settings
- [ ] Added provider credentials in Supabase
- [ ] Restarted dev server (Ctrl+C then `npm run dev`)

### OAuth Login Test
- [ ] Clicked "Sign in with [Provider]"
- [ ] Redirected to provider login page
- [ ] Logged in / approved app
- [ ] Redirected back to http://localhost:3000
- [ ] Successfully logged in to dashboard
- [ ] Session persists on page refresh

---

## 📄 PAGE-BY-PAGE TESTING

### Dashboard Overview
- [ ] Navigated to: http://localhost:3000/dashboard
- [ ] Page loads without errors
- [ ] Can see dashboard layout
- [ ] Sidebar/navigation visible
- [ ] No console errors (F12)

### Tournaments Page
- [ ] Clicked "Tournaments" in navigation
- [ ] Page loads successfully
- [ ] Can see tournaments list (may be empty)
- [ ] "Create New Tournament" button visible
- [ ] No console errors

### Applications Page
- [ ] Clicked "Applications" in navigation
- [ ] Page loads successfully
- [ ] Can see applications list (may be empty)
- [ ] Filter options visible
- [ ] No console errors

### Analytics Page
- [ ] Clicked "Analytics" in navigation
- [ ] Page loads successfully
- [ ] Charts render (with mock or real data)
- [ ] No console errors
- [ ] Date range selector works

### Live Page
- [ ] Clicked "Live" in navigation
- [ ] Page loads successfully
- [ ] Live streams section visible (may be empty)
- [ ] No console errors

### Reports Page
- [ ] Clicked "Reports" in navigation
- [ ] Page loads successfully
- [ ] Report generation options visible
- [ ] No console errors

### Settings Page
- [ ] Clicked "Settings" in navigation
- [ ] Page loads successfully
- [ ] Settings options visible
- [ ] No console errors

---

## 🎮 FUNCTIONALITY TESTING (IF DATA EXISTS)

### Create Tournament Test
- [ ] Went to Tournaments page
- [ ] Clicked "Create New Tournament"
- [ ] Filled in tournament title
- [ ] Selected game
- [ ] Set start date
- [ ] Set end date
- [ ] Clicked Save
- [ ] Tournament appears in list
- [ ] No errors during creation

### Submit Application Test (Public Form)
- [ ] Created a test tournament
- [ ] Found application URL
- [ ] Opened URL in incognito window
- [ ] Filled out application form
- [ ] Submitted application
- [ ] Saw success message
- [ ] Application appears in dashboard

### Review Application Test
- [ ] Went to Applications page
- [ ] Found test application
- [ ] Clicked to view details
- [ ] Can see applicant information
- [ ] Status change buttons visible
- [ ] Changed status to "Approved"
- [ ] Status updated successfully
- [ ] No errors

---

## 🔨 BUILD & PRODUCTION TESTING

### Production Build
- [ ] Stopped dev server (Ctrl+C)
- [ ] Ran: `npm run build`
- [ ] Build completed successfully
- [ ] No TypeScript errors
- [ ] No build errors
- [ ] `dist/` folder created

### Preview Production Build
- [ ] Ran: `npm run preview`
- [ ] Preview server started
- [ ] Opened: http://localhost:4173
- [ ] App loads correctly
- [ ] Can navigate pages
- [ ] Looks the same as dev mode
- [ ] No console errors

---

## 🤖 DISCORD BOT TESTING (OPTIONAL)

### Bot Setup
- [ ] Created Discord bot at https://discord.com/developers
- [ ] Added bot token to `.env.local`: `DISCORD_BOT_TOKEN=`
- [ ] Added bot client ID to `.env.local`: `DISCORD_BOT_CLIENT_ID=`
- [ ] Enabled required intents (Server Members, Message Content)
- [ ] Generated invite URL with permissions
- [ ] Invited bot to test Discord server
- [ ] Bot appears online in server

### Bot Testing
- [ ] Opened second terminal
- [ ] Ran: `npm run discord-bot`
- [ ] Saw "Discord bot logged in as..."
- [ ] Approved a test application
- [ ] Bot sent message in Discord
- [ ] Bot assigned role (if configured)
- [ ] No errors in bot terminal

---

## 📊 CONSOLE ERROR CHECKING

### DevTools Console (F12)
- [ ] No red errors on login page
- [ ] No red errors on dashboard
- [ ] No red errors on tournaments page
- [ ] No red errors on applications page
- [ ] No red errors on analytics page
- [ ] No red errors on live page
- [ ] No red errors on reports page
- [ ] No red errors on settings page
- [ ] Warnings are OK (yellow)
- [ ] Info messages are OK (blue)

### Network Tab
- [ ] Requests to Supabase successful (200/201 status)
- [ ] No 401 Unauthorized errors (unless expected)
- [ ] No 404 Not Found errors
- [ ] No 500 Server errors
- [ ] OAuth redirects work correctly (if configured)

---

## 🔒 SECURITY CHECK

### Environment Files
- [ ] Opened `.env.local` - has real credentials
- [ ] Opened `.env` - has ONLY placeholders
- [ ] Opened `.env.example` - has ONLY placeholders
- [ ] Verified `.gitignore` includes `.env.local`
- [ ] Ran: `git status`
- [ ] Verified `.env.local` NOT in list
- [ ] No credentials visible in tracked files

### Git Repository
- [ ] Ran: `git status`
- [ ] Reviewed files to be committed
- [ ] No `.env.local` in staging
- [ ] No sensitive files in staging
- [ ] All changes are intentional

---

## 📤 PRE-PUSH FINAL CHECKS

### Code Quality
- [ ] Ran: `npm run build` - succeeded
- [ ] Ran: `npm run lint` - no errors (warnings OK)
- [ ] All features tested and working
- [ ] No critical bugs found

### Documentation
- [ ] README.md is accurate
- [ ] QUICK_START.md available
- [ ] LOCAL_TESTING_GUIDE.md available
- [ ] SUMMARY.md available
- [ ] TESTING_FLOW.md available

### Environment Files
- [ ] `.env.example` up to date with all variables
- [ ] `.env` has placeholders only
- [ ] `.env.local` not tracked by Git
- [ ] No real credentials in tracked files

### Git Status
- [ ] Ran: `git status` one last time
- [ ] Verified files to commit
- [ ] No unwanted files staged
- [ ] Ready to commit

---

## 🚀 PUSH TO GITHUB

### Commit Changes
- [ ] Ran: `git add .`
- [ ] Ran: `git status` (double-check)
- [ ] Ran: `git commit -m "Fix environment configuration and add testing guides"`
- [ ] Commit successful

### Push to Remote
- [ ] Ran: `git push` (or `git push -u origin main` if first push)
- [ ] Push successful
- [ ] Went to GitHub repository in browser
- [ ] Verified files are updated
- [ ] Checked that `.env.local` is NOT visible
- [ ] Repository looks good

---

## ✅ FINAL VERIFICATION

### GitHub Repository
- [ ] All code files present
- [ ] README.md renders correctly
- [ ] Documentation files visible
- [ ] No `.env.local` in repository
- [ ] No credentials visible anywhere
- [ ] Commit history looks correct

### Local Project
- [ ] Dev server still runs: `npm run dev`
- [ ] App still works locally
- [ ] Changes saved and pushed
- [ ] Ready for deployment (future step)

---

## 🎉 COMPLETION

**Congratulations!** If you've checked all required boxes, your project is:
- ✅ Properly configured
- ✅ Fully tested locally
- ✅ Pushed to GitHub safely
- ✅ Ready for the next phase

---

## 📝 NOTES SECTION

Use this space to track issues or important observations:

```
Issue/Note 1:
____________________________________________________________

Issue/Note 2:
____________________________________________________________

Issue/Note 3:
____________________________________________________________

Reminder for next time:
____________________________________________________________
```

---

## 🆘 IF SOMETHING FAILS

### Quick Troubleshooting Reference
- Server won't start → Check port 3000 is free
- Module errors → Delete node_modules, run `npm install`
- Supabase errors → Verify credentials in `.env.local`
- OAuth errors → Check redirect URIs match exactly
- Build fails → Check TypeScript errors: `npx tsc --noEmit`
- Page not found → Verify route exists in `router.tsx`
- Styles broken → Check Tailwind config and PostCSS

### Where to Get Help
- [ ] Checked LOCAL_TESTING_GUIDE.md troubleshooting section
- [ ] Checked browser console (F12) for error details
- [ ] Checked terminal output for error messages
- [ ] Verified all environment variables are set
- [ ] Restarted dev server as last resort

---

**Total Checkboxes**: ~150+
**Estimated Time**: 
- Basic Testing: 15-30 minutes
- Full Testing: 1-2 hours
- With OAuth + Discord: 2-3 hours

**Priority**: 
- ⭐⭐⭐ PRE-TESTING SETUP (required)
- ⭐⭐⭐ BASIC TESTING (required)
- ⭐⭐ FUNCTIONALITY TESTING (recommended)
- ⭐⭐ BUILD & PRODUCTION TESTING (recommended)
- ⭐ DISCORD BOT TESTING (optional)

**Good luck! 🚀**
