# OAuth Callback Fix

## Problem
OAuth callback was failing with "Invalid callback" error because:
- Supabase was using **implicit OAuth flow** (tokens in URL hash `#access_token=...`)
- Server-side route handler only checked for `code` parameter (PKCE flow)
- URL hash fragments are NOT accessible server-side
- Result: Route returned "Invalid callback" and redirected to login

## Solution
Created a **hybrid callback system** that handles both OAuth flows:

### 1. Server-Side Route (`route.ts`)
- Handles PKCE flow (when `code` parameter exists)
- Redirects to client-side handler when no code (implicit flow)
- Handles OAuth errors

### 2. Client-Side Page (`page.tsx`) - NEW
- Handles implicit OAuth flow (tokens in URL hash)
- Uses `supabase.auth.getSession()` to extract session from URL
- Redirects to dashboard after authentication
- Shows "Completing sign in..." loading state

## Flow Diagram

```
User → Discord OAuth → Callback URL
                           ↓
                    [Server Route.ts]
                           ↓
                    Has 'code'? 
                    ├─ YES → Exchange code for session → Dashboard
                    └─ NO → Redirect to /auth/callback (page)
                                  ↓
                            [Client Page.tsx]
                                  ↓
                         Extract session from URL hash
                                  ↓
                              Dashboard
```

## Files Modified
1. ✅ `web/src/app/auth/callback/page.tsx` - NEW: Client-side callback handler
2. ✅ `web/src/app/auth/callback/route.ts` - UPDATED: Added fallback to client handler

## Testing
1. Clear browser cache and cookies
2. Visit app.viewer.gg
3. Click "Continue with Discord"
4. Authorize the app
5. Should see "Completing sign in..." briefly
6. Should redirect to dashboard successfully

## Why This Works
- **Implicit Flow**: Tokens in URL hash → Client-side handler reads them
- **PKCE Flow**: Code in query params → Server-side handler exchanges it
- **No more "Invalid callback"**: Both flows are now properly handled
