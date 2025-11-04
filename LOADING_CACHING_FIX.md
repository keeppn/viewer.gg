# Loading and Caching Issues - FIXED

## Issues Identified

1. **Race Condition in Auth Initialization**
   - Both `app/page.tsx` and `app/dashboard/layout.tsx` were calling `initialize()` independently
   - This caused multiple simultaneous initialization attempts
   - Loading state would get stuck or show repeatedly

2. **Browser Caching**
   - Next.js was caching the "Loading..." screen
   - No cache-control headers were set
   - Static optimization was enabled by default

3. **Hydration Mismatch**
   - Client-side rendering without proper mounting checks
   - Could cause flashing or inconsistent states

## Fixes Applied

### 1. Auth Store (authStore.ts)
- Added initialization guard to prevent multiple simultaneous calls
- Checks if already initialized or currently initializing before running
- Prevents race conditions

### 2. Root Layout (app/layout.tsx)
- Added `dynamic = 'force-dynamic'` export
- Added `revalidate = 0` export
- Added meta tags for cache control in HTML head

### 3. Home Page (app/page.tsx)
- Added mounting state to prevent hydration issues
- Improved loading logic to check both `initialized` and `loading` states
- Removed timeout fallback (now relies on proper state management)
- Better handling of the login display

### 4. Dashboard Layout (app/dashboard/layout.tsx)
- Added mounting state to prevent hydration issues
- Improved initialization check to avoid duplicate calls
- Added `dynamic = 'force-dynamic'` export
- Added `revalidate = 0` export
- Better loading indicator with spinner

### 5. Login Component (components/pages/Login.tsx)
- Added local `isAuthenticating` state
- Better loading messages ("Redirecting to sign in..." vs "Loading...")
- Added spinner to loading state

### 6. Next.js Config (next.config.ts)
- Added global headers configuration
- Sets Cache-Control, Pragma, and Expires headers for all routes
- Prevents browser and CDN caching

### 7. Proxy File (proxy.ts) - UPDATED
- Updated existing proxy file to cover all routes (not just / and /auth)
- Added max-age=0 to cache control headers
- Applies cache headers at the edge for all routes except static assets
- Ensures no caching at any level

## Testing Steps

1. **Clear Browser Cache**
   ```
   - Chrome: Ctrl+Shift+Delete or Cmd+Shift+Delete
   - Select "Cached images and files"
   - Clear for "All time"
   ```

2. **Hard Refresh**
   ```
   - Windows: Ctrl+Shift+R or Ctrl+F5
   - Mac: Cmd+Shift+R
   ```

3. **Test Flow**
   - Visit app.viewer.gg
   - Should see loading screen briefly, then login page
   - Login with Google or Discord
   - Should redirect to dashboard without seeing "Loading..." again
   - Navigate around dashboard
   - Refresh page - should not see "Loading..." flash

4. **Test Cache Issues**
   - Open app.viewer.gg in new tab
   - Should not see cached "Loading..." screen
   - Should initialize properly each time

## Expected Behavior After Fix

✅ No more persistent "Loading..." screen
✅ Smooth login flow without flashing
✅ Page refreshes work correctly
✅ No cached states showing up
✅ Proper initialization on each visit
✅ No race conditions in auth initialization

## Technical Details

### Cache Control Strategy
- `no-store`: Don't store in cache at all
- `no-cache`: Validate before serving from cache
- `must-revalidate`: Force revalidation with origin server
- `proxy-revalidate`: Same as above for shared caches
- `max-age=0`: Expire immediately

### Initialization Flow
1. User visits site → Component mounts
2. Check if already initialized → Skip if yes
3. Initialize auth → Fetch session from Supabase
4. Set loading to false → Show appropriate UI
5. Redirect based on auth state

## Files Modified

1. ✅ `web/src/store/authStore.ts` - Added initialization guard
2. ✅ `web/src/app/layout.tsx` - Added cache control and dynamic rendering
3. ✅ `web/src/app/page.tsx` - Improved mounting and loading logic
4. ✅ `web/src/app/dashboard/layout.tsx` - Added mounting and cache control
5. ✅ `web/src/components/pages/Login.tsx` - Better loading states
6. ✅ `web/next.config.ts` - Added global cache headers
7. ✅ `web/src/proxy.ts` - UPDATED: Extended matcher to all routes and added max-age=0

## Next Steps

1. **Rebuild and restart the dev server:**
   ```bash
   cd web
   npm run build
   npm run dev
   ```

2. **Test thoroughly:**
   - Clear browser cache completely
   - Test login flow
   - Test page refreshes
   - Test navigation

3. **Monitor console logs:**
   - Check for "Already initialized or initializing" messages
   - Verify no duplicate initialization attempts
   - Check that loading states transition properly

## Notes

- The updated proxy.ts file is the most important change for preventing cache issues
- The initialization guard prevents the race condition
- The mounting states prevent hydration mismatches
- All changes maintain existing functionality while fixing the caching issue
- Used proxy.ts instead of middleware.ts (Next.js doesn't allow both)
