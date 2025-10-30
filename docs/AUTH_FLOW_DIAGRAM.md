# Authentication Flow Diagram

## Visual Overview of the Complete Auth System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          VIEWER.GG AUTH FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Homepage   │
└──────┬───────┘
       │
       ├─────────────────────┬─────────────────────┐
       │                     │                     │
       ▼                     ▼                     ▼
┌─────────────┐      ┌──────────────┐     ┌─────────────┐
│  Sign Up    │      │   Log In     │     │   Browse    │
└──────┬──────┘      └──────┬───────┘     └─────────────┘
       │                    │
       │                    │
       ▼                    │
┌─────────────────┐         │
│ Role Selection  │         │
├─────────────────┤         │
│ • Organizer     │         │
│ • Streamer      │         │
└──────┬──────────┘         │
       │                    │
       ├────────────┬───────┤
       │            │       │
       ▼            ▼       ▼
┌──────────────┐   │   ┌──────────────┐
│ Organizer    │   │   │   Streamer   │
│  Sign Up     │   │   │   Sign Up    │
├──────────────┤   │   ├──────────────┤
│ • Google  ○  │   │   │ • Twitch  ○  │
│ • Discord ○  │   │   │ • YouTube ○  │
└──────┬───────┘   │   │ • Kick    ○  │
       │           │   └──────┬───────┘
       │           │          │
       │    ┌──────┴──────┐   │
       │    │   OAuth     │   │
       │    │  Provider   │   │
       │    │  Selection  │   │
       │    └──────┬──────┘   │
       │           │          │
       └───────────┼──────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  OAuth Provider │
         │  Authorization  │
         ├─────────────────┤
         │ • Google        │
         │ • Discord       │
         │ • Twitch        │
         │ • YouTube       │
         └────────┬────────┘
                  │
                  │ (Auth Code)
                  │
                  ▼
         ┌─────────────────────┐
         │  /auth/callback     │
         │  Exchange Code      │
         └─────────┬───────────┘
                   │
                   ├─────────────────────────┐
                   │                         │
                   ▼                         ▼
         ┌──────────────────┐      ┌──────────────────┐
         │ Check if User    │  YES │  Existing User   │
         │ Exists in DB?    ├─────→│  Found!          │
         └──────────┬───────┘      └────────┬─────────┘
                    │                       │
                  NO│                       │ (LOGIN FLOW)
                    │                       │
                    ▼                       │
         ┌──────────────────────┐           │
         │ Get localStorage     │           │
         │ - pending_user_type  │           │
         │ - pending_provider   │           │
         └──────────┬───────────┘           │
                    │                       │
         (SIGNUP FLOW)                      │
                    │                       │
                    ▼                       │
         ┌──────────────────────┐           │
         │ Create User Record   │           │
         ├──────────────────────┤           │
         │ • id                 │           │
         │ • email              │           │
         │ • name               │           │
         │ • avatar_url         │           │
         │ • user_type         │← From     │
         │ • oauth_provider    │  localStorage
         │ • role              │← Calculated
         │ • streaming_platform│← If streamer
         └──────────┬───────────┘           │
                    │                       │
                    │                       │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Clear localStorage    │
                    │ - pending_user_type   │
                    │ - pending_provider    │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Redirect to Dashboard │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    Dashboard Loads    │
                    ├───────────────────────┤
                    │ Auth Store Init       │
                    │ - Fetch user from DB  │
                    │ - Load organization   │
                    │ - Set global state    │
                    └───────────────────────┘
```

## Data Flow

### 1. Sign Up Flow

```
User Selection:
  role = 'organizer' | 'streamer'
  provider = 'google' | 'discord' | 'twitch' | 'youtube' | 'kick'
        │
        ▼
localStorage:
  pending_user_type = role
  pending_oauth_provider = provider
        │
        ▼
OAuth:
  User authenticates
  Returns with code
        │
        ▼
Callback:
  Exchange code for session
  Read localStorage
  Create user:
    {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      user_type: pending_user_type,
      oauth_provider: pending_oauth_provider,
      role: user_type === 'organizer' ? 'admin' : 'viewer',
      streaming_platform: (twitch|youtube|kick) ? Platform : null
    }
        │
        ▼
Success:
  Clear localStorage
  Redirect to /dashboard
```

### 2. Login Flow

```
User clicks OAuth provider
        │
        ▼
OAuth:
  User authenticates
  Returns with code
        │
        ▼
Callback:
  Exchange code for session
  Check database for user
  User exists? ✓
        │
        ▼
Success:
  No new user created
  Redirect to /dashboard
```

## Database Schema

```
users table:
┌─────────────────────┬──────────────────┬──────────────┐
│ Column              │ Type             │ Example      │
├─────────────────────┼──────────────────┼──────────────┤
│ id                  │ UUID             │ uuid-123...  │
│ email               │ TEXT             │ user@mail.co │
│ name                │ TEXT             │ John Doe     │
│ avatar_url          │ TEXT             │ https://...  │
│ user_type          │ TEXT             │ organizer    │
│ oauth_provider     │ TEXT             │ discord      │
│ role                │ TEXT             │ admin        │
│ streaming_platform  │ TEXT             │ Twitch       │
│ organization_id     │ UUID (nullable)  │ null         │
│ created_at          │ TIMESTAMPTZ      │ 2025-10-30   │
└─────────────────────┴──────────────────┴──────────────┘
```

## Role & Type Mapping

```
┌─────────────┬──────────────────┬────────┬──────────────────────┐
│ User Type   │ OAuth Provider   │ Role   │ Streaming Platform   │
├─────────────┼──────────────────┼────────┼──────────────────────┤
│ organizer   │ google           │ admin  │ null                 │
│ organizer   │ discord          │ admin  │ null                 │
│ streamer    │ twitch           │ viewer │ Twitch               │
│ streamer    │ youtube          │ viewer │ YouTube              │
│ streamer    │ kick             │ viewer │ Kick                 │
└─────────────┴──────────────────┴────────┴──────────────────────┘
```

## Error Handling

```
Callback Error Flow:
┌───────────────────┐
│  OAuth Success    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐    NO
│ User exists in DB?├────────┐
└─────────┬─────────┘        │
          │ YES              │
          ▼                  ▼
┌───────────────────┐  ┌─────────────────────┐
│ Log in user       │  │ localStorage empty? │
└───────────────────┘  └─────────┬───────────┘
                                 │ YES
                                 ▼
                       ┌─────────────────────┐
                       │ Show error message  │
                       │ Fallback: Create    │
                       │ basic user record   │
                       └─────────┬───────────┘
                                 │
                                 ▼
                       ┌─────────────────────┐
                       │ Redirect to         │
                       │ dashboard anyway    │
                       └─────────────────────┘
```

## File Structure

```
viewer.gg/
├── web/
│   └── src/
│       ├── app/
│       │   └── auth/
│       │       └── callback/
│       │           └── route.ts ◄── Main callback handler
│       ├── store/
│       │   └── authStore.ts ◄────── Auth state management
│       ├── lib/
│       │   └── supabase.ts ◄─────── OAuth initiation
│       └── components/
│           └── pages/
│               ├── RoleSelection.tsx
│               ├── OrganizerSignUp.tsx
│               └── StreamerSignUp.tsx
├── supabase/
│   ├── schema.sql ◄─────────────── Initial schema
│   └── migration_add_auth_fields.sql ◄── Auth fields
└── docs/
    ├── QUICK_START.md
    ├── AUTH_SETUP.md
    ├── AUTH_TESTING.md
    └── AUTH_FIX_SUMMARY.md
```

## Component Interaction

```
┌─────────────────────────────────────────────────────┐
│                  Browser/Client                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │  React Components                               │ │
│ │  - RoleSelection                                │ │
│ │  - OrganizerSignUp                              │ │
│ │  - StreamerSignUp                               │ │
│ │  - Login                                        │ │
│ └───────────────────┬─────────────────────────────┘ │
│                     │                                │
│                     ▼                                │
│ ┌─────────────────────────────────────────────────┐ │
│ │  Supabase Client (lib/supabase.ts)              │ │
│ │  - signInWithProvider()                         │ │
│ │  - Set localStorage (pending_user_type)         │ │
│ └───────────────────┬─────────────────────────────┘ │
└─────────────────────┼─────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              OAuth Provider                          │
│  (Google, Discord, Twitch, YouTube)                 │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│          Next.js Server (callback route)             │
│  /auth/callback/route.ts                            │
│  - Exchange code for session                        │
│  - Return HTML with client script                   │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│          Client-side Script (in HTML)                │
│  - Read localStorage                                │
│  - Check if user exists                             │
│  - Create user if needed                            │
│  - Redirect to dashboard                            │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              Supabase Database                       │
│  - Insert/query users table                         │
│  - Validate constraints                             │
│  - Return result                                    │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              Auth Store (Zustand)                    │
│  - Initialize session                               │
│  - Fetch user profile                               │
│  - Set global auth state                            │
└─────────────────────────────────────────────────────┘
```

## Success Indicators

```
✅ Console Logs:
   - "Session found: [uuid]"
   - "Auth callback - User data: {...}"
   - "User created successfully" OR "Existing user found"

✅ Database:
   - User record exists with all fields populated
   - No duplicate records
   - Correct user_type and role

✅ User Experience:
   - Smooth redirect to dashboard
   - No error messages
   - Profile loads correctly
   - Can access authorized features
```

---

This diagram represents the complete authentication flow as implemented in viewer.gg.
For implementation details, see the documentation in `/docs/`.
