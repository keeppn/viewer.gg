# Testing Flow Diagram - Viewer.gg

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VIEWER.GG LOCAL TESTING FLOW                     │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: SETUP ENVIRONMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────┐
│  .env.local │ ← YOUR REAL CREDENTIALS (not in Git)
└──────┬──────┘
       │ Add Supabase URL & Keys
       │ VITE_SUPABASE_URL=https://...
       │ VITE_SUPABASE_ANON_KEY=...
       ↓
┌──────────────────────┐
│   npm install        │ ← Install all dependencies
└───────────┬──────────┘
            ↓

STEP 2: DATABASE SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌──────────────────────┐
│ supabase/schema.sql  │ ← Copy this content
└───────────┬──────────┘
            │
            ↓
┌─────────────────────────────────┐
│  Supabase SQL Editor            │ ← Paste and run
│  ✓ Creates tables               │
│  ✓ Sets up relationships        │
│  ✓ Configures auth              │
└──────────────┬──────────────────┘
               ↓

STEP 3: START DEV SERVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌──────────────────────┐
│   npm run dev        │ ← Starts Vite on port 3000
└───────────┬──────────┘
            │
            ↓
    ┌───────────────┐
    │  Port 3000    │ ✓ Server running
    │  localhost    │ ✓ Hot reload enabled
    └───────┬───────┘
            ↓

STEP 4: TEST IN BROWSER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌───────────────────────────────────────┐
│  http://localhost:3000                │
└───────────────┬───────────────────────┘
                │
                ↓
        ┌───────────────┐
        │  Login Page   │ ← Should load without errors
        └───────┬───────┘
                │
                ↓
┌───────────────────────────────────────┐
│  Press F12 → Check DevTools           │
│  ✓ No red errors in Console           │
│  ✓ Network requests to Supabase       │
│  ✓ Styles loaded correctly            │
└───────────────┬───────────────────────┘
                ↓

STEP 5: TEST FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────────────────────┐
│  Test Authentication (if OAuth configured)              │
│  ├─ Click "Sign in with Twitch/Google/Discord"         │
│  ├─ Redirects to OAuth provider                         │
│  ├─ Approve and redirect back                           │
│  └─ Should see dashboard                                │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Navigate Through Pages                                 │
│  ├─ /dashboard           → Overview                     │
│  ├─ /dashboard/tournaments → Tournaments List           │
│  ├─ /dashboard/applications → Applications              │
│  ├─ /dashboard/analytics → Charts & Data               │
│  ├─ /dashboard/live → Live Monitoring                   │
│  ├─ /dashboard/reports → Report Generator               │
│  └─ /dashboard/settings → Settings                      │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Test Core Functionality                                │
│  ├─ Create Test Tournament                              │
│  ├─ Submit Test Application                             │
│  ├─ Review Application                                  │
│  ├─ Change Status (Approve/Reject)                      │
│  └─ View Analytics                                      │
└────────────────────────┬────────────────────────────────┘
                         ↓

STEP 6: VERIFY BUILD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌──────────────────────┐
│   npm run build      │ ← Test production build
└───────────┬──────────┘
            │
            ↓
    ┌───────────────┐
    │  Build Success│ ✓ No TypeScript errors
    │  dist/ folder │ ✓ Optimized bundle
    └───────┬───────┘
            ↓
┌──────────────────────┐
│  npm run preview     │ ← Test production preview
└───────────┬──────────┘
            │
            ↓
┌──────────────────────────────────┐
│  http://localhost:4173           │ ← Production mode test
└──────────────────────────────────┘
            ↓

STEP 7: PUSH TO GITHUB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌──────────────────────┐
│   git status         │ ← Verify what will be committed
└───────────┬──────────┘
            │
            ↓ VERIFY:
    ✓ .env.local NOT listed
    ✓ Only safe files staged
    ✓ No credentials visible
            │
            ↓
┌──────────────────────┐
│   git add .          │ ← Stage changes
│   git commit -m "..." │ ← Commit
│   git push           │ ← Push to GitHub
└──────────────────────┘
            ↓
        ┌─────────┐
        │ SUCCESS │
        └─────────┘
```

## 🔄 Parallel Testing (Optional)

If you want to test Discord bot integration:

```
Terminal 1                    Terminal 2
━━━━━━━━━━━━━━━━━━━━━       ━━━━━━━━━━━━━━━━━━━━━
┌──────────────┐              ┌──────────────────┐
│ npm run dev  │              │ npm run         │
│              │              │   discord-bot    │
└──────┬───────┘              └────────┬─────────┘
       │                               │
       ↓                               ↓
Port 3000                       Discord Bot
Web App                         Listening for
                                application
                                status changes
```

## 🎯 Success Indicators at Each Step

```
┌─────────────────────┬────────────────────────────────────┐
│ STEP                │ SUCCESS INDICATOR                  │
├─────────────────────┼────────────────────────────────────┤
│ npm install         │ ✓ No errors                        │
│                     │ ✓ node_modules populated           │
├─────────────────────┼────────────────────────────────────┤
│ Database Setup      │ ✓ Tables appear in Supabase        │
│                     │ ✓ No SQL errors                    │
├─────────────────────┼────────────────────────────────────┤
│ npm run dev         │ ✓ "ready in XXX ms"                │
│                     │ ✓ Local: http://localhost:3000/    │
├─────────────────────┼────────────────────────────────────┤
│ Browser Load        │ ✓ Login page visible               │
│                     │ ✓ No console errors (F12)          │
│                     │ ✓ Styles applied                   │
├─────────────────────┼────────────────────────────────────┤
│ Navigation          │ ✓ All routes work                  │
│                     │ ✓ No 404 errors                    │
├─────────────────────┼────────────────────────────────────┤
│ Supabase Connection │ ✓ Network requests to Supabase     │
│                     │ ✓ Data loads (if any exists)       │
├─────────────────────┼────────────────────────────────────┤
│ npm run build       │ ✓ Build complete                   │
│                     │ ✓ No TypeScript errors             │
├─────────────────────┼────────────────────────────────────┤
│ git status          │ ✓ .env.local NOT in list           │
│                     │ ✓ Only intended files staged       │
└─────────────────────┴────────────────────────────────────┘
```

## ⚠️ Common Issues Decision Tree

```
                    Issue Occurs
                        │
                        ↓
        ┌───────────────┴───────────────┐
        │                               │
    Port Error                    Module Error
        │                               │
        ↓                               ↓
    Kill process              npm install again
    on port 3000                      │
        │                             ↓
        ↓                         Still error?
    Try again                         │
                                      ↓
                              Delete node_modules
                              npm install
                                      │
                                      ↓
                                  Try again

                    Supabase Error
                        │
                        ↓
            ┌───────────┴───────────┐
            │                       │
      Credentials Wrong        Schema Issue
            │                       │
            ↓                       ↓
    Check .env.local      Run schema.sql again
    Restart server             in Supabase
            │                       │
            └───────────┬───────────┘
                        ↓
                    Try again


            OAuth Redirect Error
                    │
                    ↓
        ┌───────────┴───────────────┐
        │                           │
    Port Mismatch            Not Enabled
        │                           │
        ↓                           ↓
    Verify all                Enable in
    use port 3000           Supabase Auth
        │                           │
        └───────────┬───────────────┘
                    ↓
            Update provider
            redirect URIs
                    │
                    ↓
                Try again
```

## 📊 Testing Priority Order

```
Priority 1 (MUST TEST)       Priority 2 (SHOULD TEST)    Priority 3 (NICE TO HAVE)
━━━━━━━━━━━━━━━━━━━━━       ━━━━━━━━━━━━━━━━━━━━━━━     ━━━━━━━━━━━━━━━━━━━━━━━
┌────────────────────┐       ┌────────────────────┐     ┌─────────────────────┐
│ • Server starts    │       │ • OAuth login      │     │ • Discord bot       │
│ • Page loads       │       │ • Create tournament│     │ • Report generation │
│ • No console errors│       │ • Submit app       │     │ • All analytics     │
│ • Navigation works │       │ • Approve/Reject   │     │ • Advanced features │
│ • Build succeeds   │       │ • View analytics   │     │                     │
└────────────────────┘       └────────────────────┘     └─────────────────────┘
        ↓                            ↓                            ↓
    MUST PASS                    RECOMMENDED                   OPTIONAL
```

## 🎓 What Each File Does

```
Configuration Files                 Test Guides                  Environment
━━━━━━━━━━━━━━━━━━━               ━━━━━━━━━━━━━━               ━━━━━━━━━━━━
vite.config.ts                     QUICK_START.md               .env.local
  └─ Dev server setup                └─ Quick reference            └─ Your real keys
                                                                      (NOT in Git)
package.json                       LOCAL_TESTING_GUIDE.md
  └─ Dependencies & scripts          └─ Full testing steps       .env.example
                                                                    └─ Template for
tsconfig.json                      SUMMARY.md                         others
  └─ TypeScript config               └─ Project status              (IN Git)

tailwind.config.js                 TESTING_FLOW.md (this file)
  └─ Styling config                  └─ Visual flow diagram
```

## 🚀 Quick Command Reference

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run discord-bot      # Start Discord bot (optional)

# Testing
npm run build            # Test production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Check for linting errors

# Git
git status               # See what will be committed
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push                 # Push to GitHub
```

## ✅ Final Checklist Before Push

```
┌─────────────────────────────────────────────┐
│ □ Tested locally - everything works         │
│ □ No console errors in browser (F12)        │
│ □ npm run build succeeds                    │
│ □ .env.local has credentials (not tracked)  │
│ □ .env has placeholders only                │
│ □ git status verified                       │
│ □ No sensitive data in tracked files        │
│ □ Ready to push!                            │
└─────────────────────────────────────────────┘
```

---

**This visual guide complements:**
- `QUICK_START.md` - Quick commands
- `LOCAL_TESTING_GUIDE.md` - Detailed steps
- `SUMMARY.md` - Project overview

**Use this when you need to:**
- Understand the testing flow
- Visualize the process
- Troubleshoot issues
- See the big picture
