# Comprehensive Codebase Investigation Report: Caching, Navigation, and Page Refresh Issues

## Executive Summary

The viewer.gg application is a Next.js 16.0.1 esports tournament management platform that uses Zustand for state management, Supabase for backend, and direct API client code instead of React Query. The architecture has **deliberately disabled HTTP caching** to prevent stale data issues, but this introduces several potential problems with page transitions, loading states, and data refresh patterns.

---

## 1. FRONTEND FRAMEWORK & ROUTING

### Framework Details
- **Framework**: Next.js 16.0.1 (App Router)
- **React Version**: 19.2.0
- **Routing**: File-based routing with App Directory (`/src/app`)

### Navigation Implementation
**Location**: `/home/user/viewer.gg/web/src/components/layout/`

**Key Components**:
- **Sidebar** (`Sidebar.tsx`, lines 18-20): Uses `Link` from `next/link` and `usePathname()` for active route detection
- **Header** (`Header.tsx`, lines 4-5, 14-15): Uses `useRouter()` and `usePathname()` for navigation and page title detection

**Navigation Pattern**:
```tsx
// Example from Sidebar.tsx
const pathname = usePathname();
const isActive = pathname === path;

return (
  <Link href={path} onClick={onClose}>
    {/* Navigation item */}
  </Link>
);
```

**Routes Structure**:
```
/dashboard (Overview)
/dashboard/tournaments
/dashboard/tournaments/new
/dashboard/applications
/dashboard/analytics
/dashboard/live
/dashboard/reports
/dashboard/settings
/apply/[tournamentId] (Public form)
/auth/callback (OAuth callback)
/login
/signup
```

---

## 2. DATA FETCHING PATTERNS

### No React Query - Direct Supabase Client Calls

**Key Finding**: The application does NOT use React Query or SWR. All data fetching is done via:
1. Direct Supabase client calls in custom API modules
2. Zustand actions that dispatch API calls
3. useEffect hooks in components

### Data Fetching Architecture

**API Module Structure** (`/home/user/viewer.gg/web/src/lib/api/`):
- `tournaments.ts`: Tournament CRUD operations
- `applications.ts`: Application management and status updates
- `analytics.ts`: Analytics and live stream data

**Example from `tournaments.ts` (lines 6-15)**:
```typescript
export const tournamentApi = {
  async getAll(organizationId: string): Promise<Tournament[]> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  // ... more methods
};
```

**Location of Calls**:
- `appStore.ts` (Zustand store) - lines 42-82: `fetchTournaments`, `fetchApplications`, `fetchLiveStreams`, `fetchAnalytics`
- `appStore.ts` (lines 137-147): `refreshStats` method
- Direct component calls in pages like `apply/[tournamentId]/page.tsx` (lines 43-76)

### Data Fetching Flow in Dashboard Layout

**File**: `/home/user/viewer.gg/web/src/app/dashboard/layout.tsx`

**Initialization Flow** (lines 22-67):
1. **First useEffect** (lines 22-54): Initializes auth store
   - Calls `useAuthStore().initialize()`
   - Sets `checking` state to false when complete
   - 500ms retry delay if no initial session (line 48)

2. **Second useEffect** (lines 56-67): Fetches app data
   - Triggers when `user` and `organization` change
   - Calls `fetchTournaments(organization.id)`
   - Calls `fetchApplications(organization.id)`
   - **ISSUE**: Both calls are fire-and-forget with only `.catch()` handlers

```typescript
// Lines 60-65
fetchTournaments(organization.id).catch(err => {
  console.error('Failed to fetch tournaments:', err);
});
fetchApplications(organization.id).catch(err => {
  console.error('Failed to fetch applications:', err);
});
```

---

## 3. CACHING IMPLEMENTATION

### HTTP Header Configuration

**File**: `/home/user/viewer.gg/web/next.config.ts`

**Aggressive Cache Disabling** (lines 8-28):
```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
        {
          key: 'Pragma',
          value: 'no-cache',
        },
        {
          key: 'Expires',
          value: '0',
        },
      ],
    },
  ];
}
```

### Next.js Page Configuration

**File**: `/home/user/viewer.gg/web/src/app/layout.tsx` (lines 27-29)
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

**File**: `/home/user/viewer.gg/web/src/app/dashboard/settings/page.tsx` (lines 4-6)
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

**Analysis**: 
- ✓ Good: Prevents ISR and forces fresh data on every request
- ✗ Bad: Causes full page re-renders and potential flash of loading states on navigation

### No Service Worker or Browser Cache API

- **Finding**: No service worker implementation found
- **Status**: Application relies entirely on server-side cache control headers

### Supabase Client Configuration

**File**: `/home/user/viewer.gg/web/src/lib/supabase.ts` (lines 20-27)
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
```

**Caching Settings**:
- No explicit cache configuration in Supabase client
- Token refresh handled by Supabase SDK
- Session persistence enabled (good for UX)

---

## 4. STATE MANAGEMENT

### Zustand Store Architecture

**Files**:
- `/home/user/viewer.gg/web/src/store/authStore.ts` - Authentication state
- `/home/user/viewer.gg/web/src/store/appStore.ts` - Application data state

### Authentication Store (authStore.ts)

**State Shape** (lines 6-17):
```typescript
interface AuthState {
  user: User | null;
  organization: Organization | null;
  session: any | null;
  loading: boolean;
  initialized: boolean;
  isInitializing: boolean;  // Prevents race conditions
  setUser: (user: User | null) => void;
  setOrganization: (org: Organization | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

**Key Features**:
1. **Race Condition Prevention** (lines 31-37):
   ```typescript
   const state = get();
   if (state.initialized || state.isInitializing) {
     console.log('AuthStore: Already initialized or initializing, skipping...');
     return;
   }
   ```

2. **Session Retry Logic** (lines 45-52):
   - Retries after 500ms if no initial session
   - Handles cross-origin redirect timing issues

3. **Organization Auto-Creation** (lines 96-127):
   - Creates organization if user exists but has no org
   - Links user to newly created org

4. **Auth State Change Listener** (lines 259-283):
   - Listens for SIGNED_IN and SIGNED_OUT events
   - Calls `initialize()` on sign in
   - Resets state on sign out

**Potential Issue**: The auth state initialization is complex with multiple async operations and potential race conditions even with the guard.

### Application Store (appStore.ts)

**State Shape** (lines 7-26):
```typescript
interface AppState {
  tournaments: Tournament[];
  applications: Application[];
  liveStreams: LiveStream[];
  stats: Stats;
  analyticsData: AnalyticsData | null;
  loading: boolean;
  currentOrganizationId: string | null;
  
  fetchTournaments: (organizationId: string) => Promise<void>;
  fetchApplications: (organizationId: string) => Promise<void>;
  fetchLiveStreams: (tournamentId: string) => Promise<void>;
  fetchAnalytics: (tournamentId: string) => Promise<void>;
  // ... action methods
}
```

**Critical Functions**:

1. **fetchApplications** (lines 53-64):
   ```typescript
   fetchApplications: async (organizationId: string) => {
     try {
       set({ loading: true, currentOrganizationId: organizationId });
       const applications = await applicationApi.getByOrganization(organizationId);
       set({ applications, loading: false });
       await get().refreshStats(organizationId);  // Refreshes stats after load
     } catch (error) {
       console.error('Error fetching applications:', error);
       set({ loading: false });
     }
   },
   ```

2. **updateApplicationStatus** (lines 84-98):
   ```typescript
   updateApplicationStatus: async (id: string, status, userId, notes?) => {
     try {
       await applicationApi.updateStatus(id, status, userId, notes);
       const { applications } = get();
       // Optimistic update
       set({
         applications: applications.map(app =>
           app.id === id ? { ...app, status, reviewed_by: userId, ... } : app
         )
       });
       await get().refreshStats();  // Refresh after update
     } catch (error) {
       // ... error handling
     }
   },
   ```

3. **refreshStats** (lines 137-147):
   ```typescript
   refreshStats: async (organizationId?: string) => {
     try {
       const orgId = organizationId || get().currentOrganizationId;
       const stats = await applicationApi.getStats(undefined, orgId || undefined);
       set({ stats });
     } catch (error) {
       console.error('Error refreshing stats:', error);
     }
   }
   ```

**Issues Identified**:
- ✗ **No error state tracking**: Errors are logged but not stored in state
- ✗ **Optimistic updates without rollback**: If API fails, local state remains incorrect
- ✗ **Missing request deduplication**: Multiple simultaneous calls to same endpoint will each make requests
- ✓ **Optimistic UI updates** for status changes - good UX pattern

---

## 5. LOADING STATES & SUSPENSE BOUNDARIES

### Loading State Patterns

**Dashboard Layout** (`/src/app/dashboard/layout.tsx`, lines 70-89):
```typescript
// Show loading while initializing auth
if (checking) {
  console.log('[DashboardLayout] Rendering: Loading dashboard (checking=true)');
  return (
    <div className="min-h-screen bg-gradient-to-br ...">
      <div className="text-center relative z-10">
        <div className="w-16 h-16 border-4 ... animate-spin" />
        <div className="text-white text-2xl font-semibold ...">
          Loading dashboard...
        </div>
      </div>
    </div>
  );
}
```

**Home Page** (`/src/app/page.tsx`, lines 37-44):
```typescript
return (
  <div className="min-h-screen bg-[#121212] flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block w-12 h-12 border-4 ... animate-spin" />
      <div className="text-white text-xl">Loading...</div>
    </div>
  </div>
);
```

**Applied Page** (`/src/app/apply/[tournamentId]/page.tsx`, lines 30-31, 65):
```typescript
const [loading, setLoading] = useState(true);
// ...
if (loading) {
  // Show loading indicator
}
```

**Settings Page** (`/src/components/pages/Settings.tsx`):
```typescript
const [loading, setLoading] = useState(true);
```

### Suspense Boundaries

**Settings Page Layout** (`/src/app/dashboard/settings/page.tsx`, lines 1-25):
```typescript
import { Suspense } from 'react';

function SettingsFallback() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 ... animate-spin" />
        <p className="text-gray-400 mt-4">Preparing settings...</p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <Settings />
    </Suspense>
  );
}
```

**Issues**:
- ✗ Only Settings page uses Suspense
- ✗ Other pages use useState for loading - not streaming-friendly
- ✗ Multiple loading states can cause flickering

---

## 6. KNOWN ISSUES & PROBLEMATIC PATTERNS

### Issue 1: Delayed Session Check with Hardcoded Timeout

**Location**: `/home/user/viewer.gg/web/src/store/authStore.ts`, lines 45-52

```typescript
// If no session found, retry after a short delay (handles cross-origin redirect timing)
if (!currentSession && !sessionError) {
  console.log('AuthStore: No session on first try, retrying after delay...');
  await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
  const retry = await supabase.auth.getSession();
  currentSession = retry.data.session;
  sessionError = retry.error;
}
```

**Problem**: 
- Hard-coded 500ms delay may be insufficient for slow networks
- No exponential backoff
- Could cause loading screen to appear longer than necessary

---

### Issue 2: Race Condition in Dashboard Layout

**Location**: `/home/user/viewer.gg/web/src/app/dashboard/layout.tsx`, lines 54-67

```typescript
}, [initialize, router]);  // <- initialize function included in dependency

// Fetch data when user and organization are ready
useEffect(() => {
  if (user && organization) {
    console.log('Fetching data for organization:', organization.id);
    fetchTournaments(organization.id).catch(err => {
      console.error('Failed to fetch tournaments:', err);
    });
    fetchApplications(organization.id).catch(err => {
      console.error('Failed to fetch applications:', err);
    });
  }
}, [user, organization, fetchTournaments, fetchApplications]);  // <- Zustand functions in dependency
```

**Problem**:
- `fetchTournaments` and `fetchApplications` are recreated on every store update
- Zustand doesn't guarantee function reference stability
- Could cause unnecessary refetches even when user/org don't change

---

### Issue 3: Settings Page Doesn't Reload Data on Navigation

**Location**: `/home/user/viewer.gg/web/src/components/pages/Settings.tsx`, lines 20-84

```typescript
useEffect(() => {
  // ... initialization code
  initializePage().catch(...);
  
  return () => {
    console.log('[Settings] Cleanup - component unmounting');
    isMounted = false;
  };
}, []); // <- EMPTY DEPENDENCY ARRAY - Only runs ONCE!
```

**Problem**:
- Uses empty dependency array, so data only loads on mount
- If user navigates away and back, no refresh happens
- URL params are cleared, but data may be stale

---

### Issue 4: Optimistic Updates Without Rollback

**Location**: `/home/user/viewer.gg/web/src/store/appStore.ts`, lines 84-98

```typescript
updateApplicationStatus: async (id: string, status, userId, notes?) => {
  try {
    await applicationApi.updateStatus(id, status, userId, notes);
    const { applications } = get();
    set({
      applications: applications.map(app =>
        app.id === id ? { ...app, status, reviewed_by: userId, ... } : app
      )
    });
    await get().refreshStats();
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;  // <- Local state still updated even if error thrown!
  }
}
```

**Problem**:
- Updates local state AFTER API call
- If API fails, error is thrown but local state is already changed
- User won't see the error clearly since UI already updated
- Should update pessimistically or with rollback on error

---

### Issue 5: localStorage.clear() on Logout Is Too Aggressive

**Location**: `/home/user/viewer.gg/web/src/lib/supabase.ts`, lines 67-79

```typescript
export async function signOut() {
  // Clear pending OAuth data from localStorage
  localStorage.removeItem('pending_user_type');
  localStorage.removeItem('pending_oauth_provider');

  // Sign out from Supabase (clears session, cookies, localStorage)
  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  // Force clear any remaining session data
  localStorage.clear();  // <- CLEARS EVERYTHING!
  sessionStorage.clear();
}
```

**Problem**:
- Clears ALL localStorage, not just auth-related items
- Removes user preferences, UI state, other app data
- Better approach: Remove specific keys

---

### Issue 6: Analytics Page Doesn't Refresh Data on Tournament Selection

**Location**: `/home/user/viewer.gg/web/src/components/pages/Analytics.tsx`, lines 26-38

```typescript
// Select first tournament by default
useEffect(() => {
  if (tournaments.length > 0 && !selectedTournamentId) {
    setSelectedTournamentId(tournaments[0].id);
  }
}, [tournaments, selectedTournamentId]);

// Fetch analytics when tournament is selected
useEffect(() => {
  if (selectedTournamentId) {
    fetchAnalytics(selectedTournamentId);
    fetchLiveStreams(selectedTournamentId);
  }
}, [selectedTournamentId, fetchAnalytics, fetchLiveStreams]);
```

**Problem**:
- Zustand functions (`fetchAnalytics`, `fetchLiveStreams`) included in dependency array
- These functions are recreated on every store update
- Could cause unnecessary refetches or missed updates
- Should use `useCallback` or memoize Zustand actions

---

### Issue 7: Applications Filter State Not Synchronized with Pagination/Search

**Location**: `/home/user/viewer.gg/web/src/components/pages/Applications.tsx`, lines 16-24

```typescript
const Applications: React.FC = () => {
  const { applications, updateApplicationStatus } = useAppStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<StatusFilter>('All');

  const filteredApplications = useMemo(() => {
    if (filter === 'All') return applications;
    return applications.filter(app => app.status === filter);
  }, [applications, filter]);
```

**Problem**:
- Filter state is local to component
- If applications data refreshes, filtering still works but no persistence
- No way to deep-link to filtered view
- If user navigates away and comes back, filter is reset

---

### Issue 8: No Validation of Discord Configuration Before Showing Status

**Location**: `/home/user/viewer.gg/web/src/lib/api/applications.ts`, lines 98-146

```typescript
// If approved, assign Discord role
if (status === 'Approved' && application.custom_data) {
  try {
    const discordUserId = application.custom_data.discord_user_id || application.custom_data.discordUserId;

    if (!discordUserId) {
      console.log('[Applications] No Discord User ID found in application');
      return data;
    }

    // Get Discord config for the organization
    const { data: discordConfig } = await supabase
      .from('discord_configs')
      .select('*')
      .eq('organization_id', application.tournament?.organization_id)
      .single();
```

**Problem**:
- Application is marked as Approved even if Discord role assignment fails
- No error feedback to user about Discord role assignment failure
- `maybeSingle()` could return null but code assumes it exists

---

## 7. ANTI-PATTERNS & CODE QUALITY ISSUES

### 1. Missing Error Boundaries

- No Error Boundary components found
- Runtime errors could crash entire page
- No fallback UI for component errors

### 2. Memory Leaks - Incomplete Cleanup

**Location**: `/home/user/viewer.gg/web/src/components/layout/Header.tsx`, lines 24-38

```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
      setIsUserMenuOpen(false);
    }
  };

  if (isUserMenuOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isUserMenuOpen]);
```

✓ Good cleanup pattern here, but...

**Location**: `/home/user/viewer.gg/web/src/store/authStore.ts`, lines 259-283

```typescript
let authListener: any = null;

if (typeof window !== 'undefined') {
    authListener = supabase.auth.onAuthStateChange(async (event, session) => {
        // ...
    });
}
// <- NO CLEANUP! authListener is never unsubscribed
```

**Problem**: Auth listener is never cleaned up, could cause multiple listeners to accumulate.

### 3. Weak Type Definitions

**Location**: `/home/user/viewer.gg/web/src/components/pages/Settings.tsx`, lines 13-15

```typescript
const [organization, setOrganization] = useState<any>(null);
const [discordConfig, setDiscordConfig] = useState<any>(null);
```

**Problem**: Using `any` defeats TypeScript's type safety.

### 4. Inconsistent Error Handling

**Good**:
```typescript
// settings.tsx - has try/catch with proper error state
try {
  // ...
} catch (err: any) {
  if (isMounted) {
    setError(err.message);
    setLoading(false);
  }
}
```

**Bad**:
```typescript
// appStore.ts - silently logs errors
catch (error) {
  console.error('Error fetching applications:', error);
  set({ loading: false });  // Doesn't communicate error to UI
}
```

---

## 8. NAVIGATION & PAGE TRANSITION ISSUES

### Issue: Data Staleness on Tab Navigation

**Problem Scenario**:
1. User is on `/dashboard` (Overview page)
2. Dashboard layout fetches tournaments and applications
3. User clicks to `/dashboard/applications`
4. The layout component doesn't re-fetch (data is already in Zustand)
5. If data became stale on the server, user sees old data

**Why It Happens**:
- Zustand persists state across page transitions
- Dashboard layout only fetches when `user` or `organization` changes
- Navigation within dashboard doesn't trigger refetch

**Current Mitigation**:
- `force-dynamic = true` and `revalidate = 0` ensure server doesn't cache
- But client-side cache in Zustand isn't invalidated on navigation

---

### Issue: Authorization Checks Happen Too Late

**Location**: `/home/user/viewer.gg/web/src/app/dashboard/layout.tsx`, lines 91-96

```typescript
// After initialization, if no user found, redirect to login
if (!user) {
  console.log('[DashboardLayout] Rendering: No user after init, redirecting to login');
  router.push('/');
  return null;  // <- Could render briefly before redirect
}
```

**Problem**: 
- Content briefly renders before redirect
- Dashboard shows loading spinner, then redirects
- Better approach: Use middleware to prevent unauthorized access

---

## 9. SPECIFIC FILE LOCATIONS FOR KEY FINDINGS

| Issue | File | Lines | Severity |
|-------|------|-------|----------|
| Aggressive cache disabling | `/web/next.config.ts` | 8-28 | Medium |
| Force dynamic rendering | `/web/src/app/layout.tsx` | 27-29 | Medium |
| Race condition in dashboard | `/web/src/app/dashboard/layout.tsx` | 54-67 | High |
| Hardcoded 500ms timeout | `/web/src/store/authStore.ts` | 48 | Medium |
| Settings page empty deps | `/web/src/components/pages/Settings.tsx` | 84 | High |
| localStorage.clear() | `/web/src/lib/supabase.ts` | 77 | High |
| Optimistic updates w/o rollback | `/web/src/store/appStore.ts` | 84-98 | High |
| No auth listener cleanup | `/web/src/store/authStore.ts` | 262-283 | Medium |
| Zustand functions in deps | `/web/src/components/pages/Analytics.tsx` | 38 | Medium |
| Missing error boundaries | Entire codebase | - | High |

---

## 10. RECOMMENDATIONS SUMMARY

### Critical Issues (Fix Immediately):
1. **Fix race condition**: Wrap Zustand actions with `useCallback` or use selector to prevent recreation
2. **Fix Settings refresh**: Remove empty dependency array or add data refresh on mount
3. **Fix localStorage.clear()**: Target specific keys instead of clearing everything
4. **Add auth listener cleanup**: Unsubscribe from auth state changes on component unmount
5. **Add Error Boundaries**: Wrap pages and major components with React Error Boundary

### High Priority Issues:
1. Implement proper request deduplication in Zustand actions
2. Add rollback logic for failed optimistic updates
3. Consider using TanStack Query instead of manual fetch + Zustand
4. Implement proper error state tracking in app store
5. Use middleware for authorization checks

### Medium Priority Issues:
1. Replace hardcoded timeout with exponential backoff
2. Use Suspense more consistently across pages
3. Implement memo/useCallback for Zustand selectors
4. Add component-level error boundaries
5. Use more specific type definitions (avoid `any`)

### Nice-to-Have Improvements:
1. Add request caching layer with configurable TTL
2. Implement optimistic locking for concurrent updates
3. Add analytics for cache hit rates
4. Consider implementing stale-while-revalidate pattern
5. Add visual indicators for loading/error states

---

## 11. REFERENCE CODE LOCATIONS

### Key Initialization Flow
- Root layout: `/web/src/app/layout.tsx`
- Dashboard layout: `/web/src/app/dashboard/layout.tsx`
- Auth store: `/web/src/store/authStore.ts`
- App store: `/web/src/store/appStore.ts`

### Data Fetching
- API layer: `/web/src/lib/api/`
- Supabase client: `/web/src/lib/supabase.ts`
- Supabase server client: `/web/src/lib/supabase/server.ts`

### Components
- Layout: `/web/src/components/layout/`
- Pages: `/web/src/components/pages/`
- Analytics: `/web/src/components/analytics/`

---

## Conclusion

The application has deliberately disabled caching to prevent stale data issues, but this approach creates several problems:
1. Each page load requires full data refetch
2. Unnecessary requests when navigating between dashboard tabs
3. Potential loading state flickering
4. Memory leaks from unmanaged subscriptions

The Zustand store is well-structured for state management but lacks proper error handling, request deduplication, and error recovery mechanisms. The introduction of React Query or SWR would significantly improve the data fetching architecture and cache management strategy.
