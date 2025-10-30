# viewer.gg Documentation

## Authentication System Documentation

This folder contains comprehensive documentation for the authentication system fix and setup.

### 📚 Documentation Files

#### 🚀 [QUICK_START.md](./QUICK_START.md) - **START HERE**
**Quick 3-step guide to fix authentication**
- Takes ~10 minutes
- Step-by-step instructions
- Immediate verification
- Best for: Getting auth working ASAP

#### 📖 [AUTH_FIX_SUMMARY.md](./AUTH_FIX_SUMMARY.md)
**Complete explanation of what was fixed**
- What was wrong
- What was changed
- How the fix works
- Before/after comparison
- Best for: Understanding the changes

#### ⚙️ [AUTH_SETUP.md](./AUTH_SETUP.md)
**Detailed setup and configuration guide**
- All OAuth providers
- Environment setup
- Configuration steps
- Troubleshooting guide
- Production checklist
- Best for: Complete setup from scratch

#### ✅ [AUTH_TESTING.md](./AUTH_TESTING.md)
**Comprehensive testing checklist**
- Test each auth flow
- Verification queries
- Success criteria
- Common issues
- Best for: Ensuring everything works

#### 🔧 [CACHE_FIX.md](./CACHE_FIX.md)
**Why you don't need to clear cache anymore**
- Cache issues explained
- What was fixed
- Testing best practices
- Troubleshooting tips
- Best for: Understanding cache behavior

### 🗂️ Quick Navigation

**I need to...**
- ✨ **Fix auth now** → [QUICK_START.md](./QUICK_START.md)
- 🔍 **Understand what changed** → [AUTH_FIX_SUMMARY.md](./AUTH_FIX_SUMMARY.md)
- ⚙️ **Set up from scratch** → [AUTH_SETUP.md](./AUTH_SETUP.md)
- ✅ **Test everything** → [AUTH_TESTING.md](./AUTH_TESTING.md)

### 📋 Implementation Checklist

Use this to track your progress:

- [ ] Read QUICK_START.md
- [ ] Run database migration (`migration_add_auth_fields.sql`)
- [ ] Configure OAuth providers in Supabase
- [ ] Test Discord OAuth (organizer)
- [ ] Test Google OAuth (organizer)
- [ ] Test Twitch OAuth (streamer)
- [ ] Test YouTube OAuth (streamer)
- [ ] Verify database has correct data
- [ ] Test login flow with existing user
- [ ] Read AUTH_SETUP.md for advanced configuration
- [ ] Complete AUTH_TESTING.md checklist
- [ ] Review AUTH_FIX_SUMMARY.md for maintenance

### 🎯 What This Documentation Covers

#### Authentication Flows
- ✅ Organizer signup (Google, Discord)
- ✅ Streamer signup (Twitch, YouTube, Kick)
- ✅ User login (all providers)
- ✅ Session management
- ✅ Error handling
- ✅ Database integration

#### OAuth Providers
- ✅ Google OAuth (organizers)
- ✅ Discord OAuth (organizers)
- ✅ Twitch OAuth (streamers)
- ✅ YouTube OAuth (streamers)
- ⚠️ Kick OAuth (coming soon)

#### Technical Components
- ✅ OAuth callback handler
- ✅ Auth store management
- ✅ Database schema
- ✅ User record creation
- ✅ Role-based access
- ✅ Platform detection

### 🔧 Key Files Modified

**Database**:
- `supabase/migration_add_auth_fields.sql` - New migration (RUN THIS)

**Backend**:
- `web/src/app/auth/callback/route.ts` - OAuth callback (complete rewrite)
- `web/src/store/authStore.ts` - Auth state management (enhanced)

**Frontend** (unchanged but relevant):
- `web/src/components/pages/RoleSelection.tsx` - Choose role
- `web/src/components/pages/OrganizerSignUp.tsx` - Organizer signup
- `web/src/components/pages/StreamerSignUp.tsx` - Streamer signup
- `web/src/lib/supabase.ts` - Supabase client

### 🎓 Learning Path

**For Developers**:
1. Start with QUICK_START.md to fix auth
2. Read AUTH_FIX_SUMMARY.md to understand changes
3. Review AUTH_SETUP.md for full context
4. Use AUTH_TESTING.md for QA

**For QA/Testing**:
1. Skip to AUTH_TESTING.md
2. Use the checklist systematically
3. Reference AUTH_SETUP.md for troubleshooting

**For DevOps/Deployment**:
1. Read AUTH_SETUP.md (especially "Production Checklist")
2. Review AUTH_FIX_SUMMARY.md for architecture
3. Use AUTH_TESTING.md before deployment

### 🐛 Troubleshooting Quick Links

**Issue: OAuth works but user not created**
→ [QUICK_START.md](./QUICK_START.md) - Run the migration

**Issue: "Column does not exist" error**
→ [AUTH_SETUP.md#troubleshooting](./AUTH_SETUP.md#troubleshooting)

**Issue: User redirected to login after OAuth**
→ [AUTH_FIX_SUMMARY.md#error-handling](./AUTH_FIX_SUMMARY.md#error-handling)

**Issue: Don't know which provider to test**
→ [AUTH_TESTING.md](./AUTH_TESTING.md)

### 📊 System Overview

```
User Flow:
1. Homepage → Select Role (Organizer/Streamer)
2. Choose OAuth Provider (Google/Discord/Twitch/YouTube)
3. OAuth Redirect → Provider Login
4. Callback Handler:
   - Check if user exists
   - If new → Create user with role/type
   - If existing → Log in
   - Redirect to dashboard

Database Structure:
users table:
- id (UUID)
- email (TEXT)
- name (TEXT)
- user_type ('organizer' | 'streamer') ← NEW
- oauth_provider (TEXT) ← NEW
- streaming_platform ('Twitch' | 'YouTube' | 'Kick') ← NEW
- role ('admin' | 'viewer')
- organization_id (UUID, nullable)
```

### 🚀 Production Deployment

Before going live:
1. ✅ All tests in AUTH_TESTING.md pass
2. ✅ Migration run on production database
3. ✅ OAuth providers configured for production URLs
4. ✅ Error monitoring set up
5. ✅ Auth logs reviewed
6. ✅ Security settings verified

See [AUTH_SETUP.md#production-checklist](./AUTH_SETUP.md#production-checklist) for complete list.

### 💡 Tips

- **Always run the migration first** - Everything depends on the new columns
- **Test in order** - Follow AUTH_TESTING.md sequentially
- **Check browser console** - Most issues show up there
- **Verify database** - Use the SQL queries in AUTH_TESTING.md
- **One provider at a time** - Don't configure everything at once

### 📞 Getting Help

If you're stuck:
1. Check the specific doc section for your issue
2. Review browser console errors
3. Check Supabase auth logs
4. Verify migration was run
5. Ensure OAuth providers are configured

### 🎉 Success Criteria

You know everything is working when:
- ✅ No console errors during auth
- ✅ Users created with all required fields
- ✅ Login works without creating duplicates
- ✅ Smooth redirect to dashboard
- ✅ All auth flows in AUTH_TESTING.md pass

---

**Last Updated**: October 30, 2025
**Version**: 1.0.0
**Status**: Production Ready

For questions or issues, refer to the specific documentation files above.
