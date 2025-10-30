# Changelog

All notable changes to the viewer.gg authentication system.

## [1.0.0] - 2025-10-30

### 🎉 Major Authentication System Overhaul

#### Added
- **Database Migration** (`supabase/migration_add_auth_fields.sql`)
  - Added `user_type` column ('organizer' | 'streamer')
  - Added `oauth_provider` column to track auth provider
  - Added `streaming_platform` column for streamers ('Twitch' | 'YouTube' | 'Kick')
  - Added indexes for performance optimization

- **Enhanced OAuth Callback Handler** (`web/src/app/auth/callback/route.ts`)
  - Complete rewrite of callback logic
  - Client-side user creation with proper error handling
  - Distinction between signup and login flows
  - User-friendly loading screen with status messages
  - Automatic user existence checking
  - Proper role and platform assignment
  - Fallback redirect on errors

- **Improved Auth Store** (`web/src/store/authStore.ts`)
  - Enhanced fallback user creation
  - Automatic user type detection from OAuth provider
  - Streaming platform detection for Twitch/YouTube
  - Better error handling and logging

- **Comprehensive Documentation**
  - `docs/QUICK_START.md` - 10-minute setup guide
  - `docs/AUTH_SETUP.md` - Complete configuration guide
  - `docs/AUTH_TESTING.md` - Detailed testing checklist
  - `docs/AUTH_FIX_SUMMARY.md` - Technical explanation
  - `docs/README.md` - Documentation index

#### Fixed
- ❌ **[CRITICAL]** User records not being created after OAuth authentication
- ❌ **[CRITICAL]** "Error fetching user: {}" console error
- ❌ Users being redirected to login page after successful OAuth
- ❌ Missing database fields causing insertion failures
- ❌ Server-side localStorage access in callback handler
- ❌ No distinction between signup and login flows
- ❌ Duplicate user creation on login attempts

#### Changed
- OAuth callback now uses client-side JavaScript instead of server-side redirect
- User creation includes all required fields (user_type, oauth_provider, streaming_platform)
- Auth flow now checks for existing users before creating new records
- Improved error messages and user feedback during authentication
- Better console logging for debugging

#### Supported OAuth Providers
- ✅ **Google OAuth** - For tournament organizers
- ✅ **Discord OAuth** - For tournament organizers  
- ✅ **Twitch OAuth** - For streamers
- ✅ **YouTube OAuth** - For streamers
- ⚠️ **Kick OAuth** - Coming soon (no official API yet)

### Technical Details

#### Database Schema Changes
```sql
ALTER TABLE users 
ADD COLUMN user_type TEXT CHECK (user_type IN ('organizer', 'streamer')),
ADD COLUMN oauth_provider TEXT,
ADD COLUMN streaming_platform TEXT CHECK (streaming_platform IN ('Twitch', 'YouTube', 'Kick'));
```

#### Authentication Flow
1. **Signup Flow**:
   - User selects role (organizer/streamer)
   - User chooses OAuth provider
   - OAuth authentication
   - Callback checks if user exists
   - If new → creates user with full profile
   - If exists → logs in
   - Redirects to dashboard

2. **Login Flow**:
   - User chooses OAuth provider
   - OAuth authentication
   - Callback verifies existing user
   - Redirects to dashboard
   - No duplicate creation

#### Breaking Changes
- **Database Migration Required**: All deployments must run `migration_add_auth_fields.sql`
- **OAuth Configuration**: Providers must be reconfigured in Supabase Dashboard
- **User Records**: Existing users may need manual migration to add new fields

#### Migration Path
1. Run `supabase/migration_add_auth_fields.sql` in Supabase SQL Editor
2. Configure OAuth providers in Supabase Dashboard
3. Update existing users if needed:
   ```sql
   UPDATE users SET user_type = 'organizer' WHERE role = 'admin';
   UPDATE users SET user_type = 'streamer' WHERE role = 'viewer';
   ```
4. Test authentication flows using `docs/AUTH_TESTING.md`

### Removed
- Deprecated server-side localStorage access in callback
- Removed redundant user creation attempts
- Cleaned up unused auth error states

### Security
- OAuth tokens properly secured in Supabase
- User data validated before database insertion
- Role-based access control properly enforced
- Prevent duplicate account creation

### Performance
- Added database indexes on `user_type` and `oauth_provider`
- Early exit on existing user detection
- Optimized callback handler logic
- Reduced unnecessary database queries

### Known Issues
- Kick OAuth not yet available (platform limitation)
- Organization auto-creation for organizers not implemented (future feature)
- Email verification optional (can be enabled in Supabase)

### Contributors
- Fixed by: Claude (Anthropic AI Assistant)
- Tested by: [To be filled]
- Reviewed by: [To be filled]

---

## How to Read This Changelog

- 🎉 Major features and overhauls
- ✅ Successfully implemented
- ❌ Bugs fixed
- ⚠️ Known issues or limitations
- 🔒 Security improvements
- ⚡ Performance improvements

## Version History

- **1.0.0** (2025-10-30) - Complete authentication system overhaul
- **0.1.0** (Previous) - Initial authentication implementation with issues

---

For detailed information about the changes, see:
- [`docs/AUTH_FIX_SUMMARY.md`](./docs/AUTH_FIX_SUMMARY.md) - Complete explanation
- [`docs/AUTH_SETUP.md`](./docs/AUTH_SETUP.md) - Setup guide
- [`docs/AUTH_TESTING.md`](./docs/AUTH_TESTING.md) - Testing guide
