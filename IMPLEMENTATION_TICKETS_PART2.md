# Discord Bot Integration - Implementation Tickets (Part 2)

This is a continuation of IMPLEMENTATION_TICKETS.md containing tickets #8-21.

---

## PHASE 3: CODE QUALITY ISSUES

### 🎫 TICKET #8: Add TypeScript Type Safety
**Priority:** 🟡 MEDIUM
**Severity:** MEDIUM
**Component:** Multiple files (Settings.tsx, bot-callback/route.ts, applications.ts)
**Estimated Effort:** 2 hours

#### Description
Multiple files use `any` types, type assertions, and untyped data structures, reducing type safety and making bugs harder to catch at compile time.

#### Current Issues

**Issue 1: Settings.tsx uses `any` for state**
```typescript
// Line 13-14
const [organization, setOrganization] = useState<any>(null);
const [discordConfig, setDiscordConfig] = useState<any>(null);
```

**Issue 2: bot-callback uses untyped Discord API responses**
```typescript
// Line 131
let approvedRole = roles.find((role: any) => role.name === roleName);
```

**Issue 3: applications.ts uses `any` type assertion**
```typescript
// Line 97
const { data: { session } } = await Promise.race([...]) as any;
```

#### Required Changes

**Step 1: Create shared type definitions**

```typescript
// types/database.ts
export interface Organization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  // Add other fields from your schema
}

export interface DiscordConfig {
  id: string;
  organization_id: string;
  guild_id: string;
  guild_name: string;
  approved_role_id: string;
  approved_role_name: string;
  bot_added_at: string;
  connection_state?: 'disconnected' | 'connecting' | 'connected' | 'error';
  connection_state_updated_at?: string;
  connection_lock_token?: string | null;
  connection_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  organization_id: string;
  role: 'admin' | 'member';
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  organization_id: string;
  status: ApplicationStatus;
  custom_data: ApplicationCustomData;
  reviewed_by?: string;
  reviewed_at?: string;
  discord_role_assignment_status?: 'pending' | 'success' | 'failed' | 'not_applicable';
  discord_role_assignment_error?: string | null;
  discord_role_assignment_attempted_at?: string;
  discord_role_assignment_retry_count?: number;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'approved_pending_role'
  | 'approved_role_assigned'
  | 'approved_role_failed';

export interface ApplicationCustomData {
  discord_user_id?: string;
  discordUserId?: string; // Legacy field
  [key: string]: any; // Allow other custom fields
}
```

**Step 2: Create Discord API type definitions**

```typescript
// types/discord.ts

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  icon?: string | null;
  unicode_emoji?: string | null;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

export interface DiscordOAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export interface DiscordMember {
  user?: DiscordUser;
  nick?: string | null;
  avatar?: string | null;
  roles: string[];
  joined_at: string;
  premium_since?: string | null;
  deaf: boolean;
  mute: boolean;
  pending?: boolean;
  permissions?: string;
}

export interface DiscordAPIError {
  message: string;
  code: number;
  errors?: Record<string, any>;
}
```

**Step 3: Update Settings.tsx**

```typescript
// app/(authenticated)/dashboard/settings/Settings.tsx
import type { Organization, DiscordConfig } from '@/types/database';

const Settings = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [discordConfig, setDiscordConfig] = useState<DiscordConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ... rest of component with proper types
};
```

**Step 4: Update bot-callback/route.ts**

```typescript
// app/api/discord/bot-callback/route.ts
import type {
  DiscordOAuthTokenResponse,
  DiscordGuild,
  DiscordRole
} from '@/types/discord';
import type { Organization, DiscordConfig } from '@/types/database';

export async function GET(request: NextRequest) {
  // ... OAuth code exchange ...

  const tokenData: DiscordOAuthTokenResponse = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // ... fetch guilds ...

  const guilds: DiscordGuild[] = await guildsResponse.json();
  const guild = guilds[0];

  // ... fetch roles ...

  const roles: DiscordRole[] = await rolesResponse.json();
  const approvedRole = roles.find((role) => role.name === roleName);

  // ... create role if needed ...

  const createRoleResponse = await fetch(/*...*/);
  const newRole: DiscordRole = await createRoleResponse.json();

  // ... save config with proper typing ...
  const configData: Partial<DiscordConfig> = {
    organization_id: organizationId,
    guild_id: guild.id,
    guild_name: guild.name,
    bot_added_at: new Date().toISOString(),
    approved_role_id: approvedRole.id,
    approved_role_name: approvedRole.name,
  };

  const { data, error } = await supabase
    .from('discord_configs')
    .upsert(configData, { onConflict: 'organization_id' })
    .select()
    .single();
}
```

**Step 5: Update applications.ts**

```typescript
// lib/applications.ts
import type { Application, ApplicationStatus } from '@/types/database';
import type { Session } from '@supabase/supabase-js';

export const updateApplicationStatus = async (
  id: string,
  status: ApplicationStatus,
  reviewedBy: string
): Promise<Application> => {
  const supabase = createClient();

  // Remove 'as any' and properly type the Promise.race
  const sessionPromise = supabase.auth.getSession();
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Session timeout')), 5000);
  });

  const { data: { session }, error: sessionError } = await Promise.race<
    [Awaited<ReturnType<typeof supabase.auth.getSession>>, never]
  >([sessionPromise, timeoutPromise]);

  if (sessionError || !session) {
    throw new Error('Failed to get session');
  }

  // ... rest of function with proper types ...

  return data as Application;
};
```

**Step 6: Update AuthStore**

```typescript
// lib/auth/authStore.ts
import type { User, Organization } from '@/types/database';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  initialized: boolean;
  isInitializing: boolean;
  error: Error | null;
  _initPromise: Promise<void> | null;
  initialize: () => Promise<void>;
  reset: () => void;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // ... implementation with proper types
}));
```

**Step 7: Configure TypeScript for strict mode**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### Acceptance Criteria
- [ ] All `any` types replaced with proper interfaces
- [ ] Type definitions created for database tables
- [ ] Type definitions created for Discord API responses
- [ ] No type assertions (`as any`) in production code
- [ ] TypeScript strict mode enabled with no errors
- [ ] IDE autocomplete works for all typed objects
- [ ] Refactoring becomes safer with compile-time checks

#### Testing Steps
1. **Compile Check:**
   ```bash
   npm run type-check
   # or
   npx tsc --noEmit
   ```
   - Verify: No type errors

2. **IDE Autocomplete Test:**
   - Type `organization.` in VS Code
   - Verify: All properties appear in autocomplete
   - Verify: Incorrect properties show error

3. **Type Safety Test:**
   - Try to assign wrong type: `organization.id = 123` (should be string)
   - Verify: TypeScript shows error

4. **Refactoring Test:**
   - Rename a field in `Organization` interface
   - Verify: TypeScript shows errors everywhere field is used
   - Update all usages
   - Verify: Compiles successfully

5. **Runtime Type Validation:**
   - Add runtime checks for API responses:
   ```typescript
   function isDiscordRole(obj: any): obj is DiscordRole {
     return (
       typeof obj === 'object' &&
       typeof obj.id === 'string' &&
       typeof obj.name === 'string' &&
       typeof obj.color === 'number'
     );
   }

   const role = await response.json();
   if (!isDiscordRole(role)) {
     throw new Error('Invalid Discord role response');
   }
   ```

#### Migration Strategy
1. Create type definition files first
2. Update one file at a time
3. Enable strict mode incrementally
4. Add runtime validation for external APIs
5. Document type decisions in code comments

#### Documentation
Add JSDoc comments to complex types:
```typescript
/**
 * Represents a Discord bot configuration for an organization
 * @property organization_id - Unique org ID (foreign key to organizations table)
 * @property guild_id - Discord server ID where bot is installed
 * @property approved_role_id - Discord role ID to assign to approved applicants
 */
export interface DiscordConfig {
  // ...
}
```

---

### 🎫 TICKET #9: Replace Console Logging with Structured Logger
**Priority:** 🟢 MEDIUM
**Severity:** MEDIUM
**Component:** All files (50+ console.log statements)
**Estimated Effort:** 1 hour

#### Description
Production code contains 50+ `console.log` statements that:
- Create performance overhead
- Expose internal logic in browser
- Clutter server logs
- May leak PII/sensitive data
- Can't be filtered by severity
- Don't work with log aggregation tools

#### Current Issues
```typescript
// Exposes internal data structures
console.log('[Settings] User query result:', { userData, userError });

// Clutters logs with debug info in production
console.log('[Discord Bot Callback] Decoded organization ID from state:', organizationId);

// No severity levels - everything is equal importance
console.log('[Applications] Error updating application status:', error);
console.log('[Applications] Application status updated successfully');
```

#### Required Changes

**Step 1: Create logging library**

```typescript
// lib/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  redactFields: string[];
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
      enableConsole: process.env.NODE_ENV !== 'production',
      enableRemote: process.env.NODE_ENV === 'production',
      remoteEndpoint: process.env.LOG_ENDPOINT,
      redactFields: ['password', 'token', 'secret', 'api_key'],
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private redactSensitive(context: LogContext): LogContext {
    const redacted = { ...context };

    for (const field of this.config.redactFields) {
      if (field in redacted) {
        redacted[field] = '[REDACTED]';
      }
    }

    return redacted;
  }

  private formatMessage(
    level: LogLevel,
    component: string,
    message: string,
    context?: LogContext
  ) {
    const timestamp = new Date().toISOString();
    const redactedContext = context ? this.redactSensitive(context) : undefined;

    return {
      timestamp,
      level,
      component,
      message,
      context: redactedContext,
      environment: process.env.NODE_ENV,
    };
  }

  private log(
    level: LogLevel,
    component: string,
    message: string,
    context?: LogContext
  ) {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(level, component, message, context);

    // Console output (development)
    if (this.config.enableConsole) {
      const color = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m', // Green
        warn: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
      }[level];
      const reset = '\x1b[0m';

      console[level === 'debug' ? 'log' : level](
        `${color}[${logEntry.timestamp}] [${level.toUpperCase()}] [${component}]${reset}`,
        message,
        context ? redactedContext : ''
      );
    }

    // Remote logging (production)
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      // Fire and forget - don't block execution
      fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      }).catch((err) => {
        console.error('Failed to send log to remote endpoint:', err);
      });
    }
  }

  debug(component: string, message: string, context?: LogContext) {
    this.log('debug', component, message, context);
  }

  info(component: string, message: string, context?: LogContext) {
    this.log('info', component, message, context);
  }

  warn(component: string, message: string, context?: LogContext) {
    this.log('warn', component, message, context);
  }

  error(component: string, message: string, context?: LogContext) {
    this.log('error', component, message, context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export factory for component-specific loggers
export function createLogger(component: string) {
  return {
    debug: (message: string, context?: LogContext) =>
      logger.debug(component, message, context),
    info: (message: string, context?: LogContext) =>
      logger.info(component, message, context),
    warn: (message: string, context?: LogContext) =>
      logger.warn(component, message, context),
    error: (message: string, context?: LogContext) =>
      logger.error(component, message, context),
  };
}
```

**Step 2: Update Settings.tsx**

```typescript
// app/(authenticated)/dashboard/settings/Settings.tsx
import { createLogger } from '@/lib/logger';

const log = createLogger('Settings');

const Settings = () => {
  // Replace: console.log('[Settings] User query result:', { userData, userError });
  // With:
  log.debug('User query completed', { userId: userData?.id, hasError: !!userError });

  // Replace: console.error('[Settings] Error loading user:', userError);
  // With:
  log.error('Failed to load user', { error: userError?.message, code: userError?.code });

  // Replace: console.log('[Settings] Disconnecting bot...');
  // With:
  log.info('Disconnecting Discord bot', { organizationId: organization.id });
};
```

**Step 3: Update bot-callback/route.ts**

```typescript
// app/api/discord/bot-callback/route.ts
import { createLogger } from '@/lib/logger';

const log = createLogger('DiscordBotCallback');

export async function GET(request: NextRequest) {
  // Replace: console.log('[Discord Bot Callback] Decoded organization ID from state:', organizationId);
  // With:
  log.debug('State decoded', { organizationId });

  // Replace: console.error('[Discord Bot Callback] State verification failed:', error);
  // With:
  log.error('State verification failed', { error: error.message });

  // Replace: console.log('[Discord Bot Callback] Connection completed successfully');
  // With:
  log.info('Bot connection completed', {
    organizationId,
    guildId: guild.id,
    roleId: approvedRole.id
  });
}
```

**Step 4: Update applications.ts**

```typescript
// lib/applications.ts
import { createLogger } from '@/lib/logger';

const log = createLogger('Applications');

export const updateApplicationStatus = async (id: string, status: string, reviewedBy: string) => {
  // Replace: console.error('[Applications] Error updating application status:', error);
  // With:
  log.error('Failed to update application status', {
    applicationId: id,
    targetStatus: status,
    error: error.message
  });

  // Replace: console.error('[Applications] Failed to assign Discord role:', errorData);
  // With:
  log.error('Discord role assignment failed', {
    applicationId: id,
    discordUserId,
    error: errorData.error
  });
};
```

**Step 5: Add environment configuration**

```bash
# .env.local (development)
LOG_LEVEL=debug
NODE_ENV=development

# .env.production (production)
LOG_LEVEL=info
LOG_ENDPOINT=https://your-log-service.com/ingest
NODE_ENV=production
```

**Step 6: Add log filtering utility**

```typescript
// lib/logger.ts (add to class)

/**
 * Create a child logger that adds default context to all logs
 */
withContext(defaultContext: LogContext) {
  return {
    debug: (message: string, context?: LogContext) =>
      this.debug({ ...defaultContext, ...context }, message),
    info: (message: string, context?: LogContext) =>
      this.info({ ...defaultContext, ...context }, message),
    warn: (message: string, context?: LogContext) =>
      this.warn({ ...defaultContext, ...context }, message),
    error: (message: string, context?: LogContext) =>
      this.error({ ...defaultContext, ...context }, message),
  };
}

// Usage:
const userLogger = logger.withContext({ userId: session.user.id });
userLogger.info('User action performed', { action: 'approve_application' });
// Logs: { userId: '123', action: 'approve_application', message: 'User action performed' }
```

#### Acceptance Criteria
- [ ] All `console.log` replaced with logger calls
- [ ] All `console.error` replaced with `logger.error`
- [ ] Log levels appropriate (debug/info/warn/error)
- [ ] Sensitive fields automatically redacted
- [ ] Production logs sent to remote service
- [ ] Development logs remain in console
- [ ] Log format is consistent and structured
- [ ] Component names are standardized

#### Testing Steps
1. **Development Logs:**
   ```bash
   LOG_LEVEL=debug npm run dev
   ```
   - Verify: Debug logs appear in console
   - Verify: Logs are colored and readable

2. **Production Logs:**
   ```bash
   LOG_LEVEL=info NODE_ENV=production npm run build && npm start
   ```
   - Verify: Debug logs don't appear
   - Verify: Only info/warn/error appear

3. **Sensitive Data Redaction:**
   ```typescript
   log.debug('Token received', { token: 'secret123' });
   // Should output: { token: '[REDACTED]' }
   ```

4. **Log Filtering:**
   ```bash
   # Only show errors
   LOG_LEVEL=error npm run dev
   ```
   - Verify: Only error logs appear

5. **Remote Logging:**
   - Set up test endpoint: https://webhook.site
   - Set LOG_ENDPOINT environment variable
   - Trigger log event
   - Verify: Log appears on webhook.site

#### Migration Script
```bash
# Find all console.log statements
grep -r "console\.log" --include="*.ts" --include="*.tsx" app/ lib/

# Find all console.error statements
grep -r "console\.error" --include="*.ts" --include="*.tsx" app/ lib/

# Replace patterns (use with caution, review changes):
# console.log('[Component] message', data) -> log.info('message', data)
```

#### Log Aggregation Integration
For production, integrate with services like:
- **Datadog:** Add Datadog API key to LOG_ENDPOINT
- **Sentry:** Use Sentry.captureMessage() for errors
- **CloudWatch:** Send to AWS CloudWatch Logs
- **LogDNA/Mezmo:** HTTP ingestion endpoint

```typescript
// Example Sentry integration
import * as Sentry from '@sentry/nextjs';

error(message: string, context?: LogContext) {
  this.log('error', message, context);

  if (this.config.enableRemote) {
    Sentry.captureMessage(message, {
      level: 'error',
      extra: context,
    });
  }
}
```

---

### 🎫 TICKET #10: Extract Magic Numbers to Named Constants
**Priority:** 🟢 LOW
**Severity:** LOW
**Component:** Multiple files
**Estimated Effort:** 30 minutes

#### Description
Code contains hardcoded magic numbers and strings that make it difficult to understand intent and maintain consistency. Values like Discord permissions, timeouts, and colors should be named constants.

#### Current Issues

```typescript
// bot-callback/route.ts:192
const permissions = '268435456'; // What does this mean?

// authStore.ts:48
await new Promise(resolve => setTimeout(resolve, 500)); // Why 500ms?

// Settings.tsx:92
setTimeout(() => reject(...), 10000); // Why 10 seconds?

// bot-callback/route.ts:148
color: 0x00D9FF, // What color is this?
```

#### Required Changes

**Step 1: Create constants file**

```typescript
// lib/constants/discord.ts

/**
 * Discord API Constants
 * Documentation: https://discord.com/developers/docs/topics/permissions
 */

/**
 * Discord Permission Bitflags
 * @see https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
 */
export const DISCORD_PERMISSIONS = {
  CREATE_INSTANT_INVITE: '0x1',
  KICK_MEMBERS: '0x2',
  BAN_MEMBERS: '0x4',
  ADMINISTRATOR: '0x8',
  MANAGE_CHANNELS: '0x10',
  MANAGE_GUILD: '0x20',
  ADD_REACTIONS: '0x40',
  VIEW_AUDIT_LOG: '0x80',
  PRIORITY_SPEAKER: '0x100',
  STREAM: '0x200',
  VIEW_CHANNEL: '0x400',
  SEND_MESSAGES: '0x800',
  SEND_TTS_MESSAGES: '0x1000',
  MANAGE_MESSAGES: '0x2000',
  EMBED_LINKS: '0x4000',
  ATTACH_FILES: '0x8000',
  READ_MESSAGE_HISTORY: '0x10000',
  MENTION_EVERYONE: '0x20000',
  USE_EXTERNAL_EMOJIS: '0x40000',
  VIEW_GUILD_INSIGHTS: '0x80000',
  CONNECT: '0x100000',
  SPEAK: '0x200000',
  MUTE_MEMBERS: '0x400000',
  DEAFEN_MEMBERS: '0x800000',
  MOVE_MEMBERS: '0x1000000',
  USE_VAD: '0x2000000',
  CHANGE_NICKNAME: '0x4000000',
  MANAGE_NICKNAMES: '0x8000000',
  MANAGE_ROLES: '0x10000000', // 268435456 in decimal
  MANAGE_WEBHOOKS: '0x20000000',
  MANAGE_EMOJIS_AND_STICKERS: '0x40000000',
  USE_APPLICATION_COMMANDS: '0x80000000',
  REQUEST_TO_SPEAK: '0x100000000',
  MANAGE_EVENTS: '0x200000000',
  MANAGE_THREADS: '0x400000000',
  CREATE_PUBLIC_THREADS: '0x800000000',
  CREATE_PRIVATE_THREADS: '0x1000000000',
  USE_EXTERNAL_STICKERS: '0x2000000000',
  SEND_MESSAGES_IN_THREADS: '0x4000000000',
  USE_EMBEDDED_ACTIVITIES: '0x8000000000',
  MODERATE_MEMBERS: '0x10000000000',
} as const;

/**
 * Combined permissions for bot setup
 * Includes: Manage Roles, View Channels, Send Messages
 */
export const BOT_REQUIRED_PERMISSIONS =
  '0x10000C00'; // MANAGE_ROLES | VIEW_CHANNEL | SEND_MESSAGES

/**
 * Brand colors for Discord roles
 */
export const DISCORD_COLORS = {
  APPROVED_ROLE: 0x00D9FF, // Cyan
  REJECTED_ROLE: 0xFF0000, // Red
  PENDING_ROLE: 0xFFA500, // Orange
  ADMIN_ROLE: 0x9B59B6, // Purple
  MEMBER_ROLE: 0x3498DB, // Blue
} as const;

/**
 * Default role configuration
 */
export const DEFAULT_ROLE_CONFIG = {
  hoist: false, // Don't display separately in member list
  mentionable: false, // Can't be @mentioned
  position: 1, // Role hierarchy position
} as const;

/**
 * Discord API Rate Limits
 * @see https://discord.com/developers/docs/topics/rate-limits
 */
export const DISCORD_RATE_LIMITS = {
  ROLE_ASSIGNMENTS_PER_10_MIN: 50,
  ROLE_CREATIONS_PER_HOUR: 250,
  API_REQUESTS_PER_SECOND: 50,
} as const;

/**
 * Discord ID validation
 */
export const DISCORD_ID_REGEX = /^\d{17,19}$/;

/**
 * Default role name (can be overridden by env var)
 */
export const getDefaultRoleName = () =>
  process.env.DISCORD_APPROVED_ROLE_NAME || 'Approved';
```

**Step 2: Create timing constants**

```typescript
// lib/constants/timing.ts

/**
 * Timeout and delay constants
 * All values in milliseconds
 */
export const TIMEOUTS = {
  // Auth & Session
  SESSION_CHECK_TIMEOUT: 10_000, // 10 seconds
  AUTH_INITIALIZATION_RETRY: 500, // 0.5 seconds

  // API Requests
  DISCORD_API_TIMEOUT: 10_000, // 10 seconds
  DATABASE_QUERY_TIMEOUT: 5_000, // 5 seconds
  WEBHOOK_TIMEOUT: 5_000, // 5 seconds

  // Locks & Retries
  CONNECTION_LOCK_STALE: 120_000, // 2 minutes
  CONNECTION_LOCK_HEARTBEAT: 30_000, // 30 seconds
  RETRY_BACKOFF_BASE: 2_000, // 2 seconds base for exponential backoff

  // UI Debouncing
  SEARCH_DEBOUNCE: 300, // 0.3 seconds
  AUTOSAVE_DEBOUNCE: 1_000, // 1 second
  TOAST_DURATION: 5_000, // 5 seconds

  // Polling Intervals
  CONNECTION_STATE_POLL: 2_000, // 2 seconds
  APPLICATION_STATUS_POLL: 5_000, // 5 seconds
} as const;

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 5,
  EXPONENTIAL_BASE: 2,
  INITIAL_DELAY: TIMEOUTS.RETRY_BACKOFF_BASE,
} as const;

/**
 * Calculate exponential backoff delay
 * @param attempt - Current attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
export function calculateBackoff(attempt: number): number {
  return RETRY_CONFIG.INITIAL_DELAY * Math.pow(RETRY_CONFIG.EXPONENTIAL_BASE, attempt);
}

// Example: attempt 0 = 2s, attempt 1 = 4s, attempt 2 = 8s, attempt 3 = 16s
```

**Step 3: Update bot-callback/route.ts**

```typescript
// app/api/discord/bot-callback/route.ts
import {
  BOT_REQUIRED_PERMISSIONS,
  DISCORD_COLORS,
  DEFAULT_ROLE_CONFIG,
  getDefaultRoleName,
} from '@/lib/constants/discord';
import { TIMEOUTS } from '@/lib/constants/timing';

// Replace: const permissions = '268435456';
// With:
const permissions = BOT_REQUIRED_PERMISSIONS;

// Replace: color: 0x00D9FF,
// With:
color: DISCORD_COLORS.APPROVED_ROLE,

// Replace: hoist: false, mentionable: false,
// With:
...DEFAULT_ROLE_CONFIG,

// Replace: const roleName = process.env.DISCORD_APPROVED_ROLE_NAME || 'Approved';
// With:
const roleName = getDefaultRoleName();
```

**Step 4: Update authStore.ts**

```typescript
// lib/auth/authStore.ts
import { TIMEOUTS } from '@/lib/constants/timing';

// Replace: await new Promise(resolve => setTimeout(resolve, 500));
// With:
await new Promise(resolve => setTimeout(resolve, TIMEOUTS.AUTH_INITIALIZATION_RETRY));
```

**Step 5: Update Settings.tsx**

```typescript
// app/(authenticated)/dashboard/settings/Settings.tsx
import { TIMEOUTS } from '@/lib/constants/timing';

// Replace: setTimeout(() => reject(...), 10000);
// With:
setTimeout(() => reject(new Error('Session timeout')), TIMEOUTS.SESSION_CHECK_TIMEOUT);
```

**Step 6: Update applications.ts**

```typescript
// lib/applications.ts
import { TIMEOUTS } from '@/lib/constants/timing';

// Replace: const timeout = setTimeout(() => controller.abort(), 10000);
// With:
const timeout = setTimeout(() => controller.abort(), TIMEOUTS.DISCORD_API_TIMEOUT);
```

**Step 7: Add validation constants**

```typescript
// lib/constants/validation.ts

/**
 * Input validation constants
 */
export const VALIDATION = {
  // Organization
  ORG_NAME_MIN_LENGTH: 3,
  ORG_NAME_MAX_LENGTH: 100,

  // User
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 8,

  // Application
  APPLICATION_NOTE_MAX_LENGTH: 1000,

  // File Uploads
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_FILE_TYPES: ['image/png', 'image/jpeg', 'application/pdf'],
} as const;

/**
 * Regex patterns
 */
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  DISCORD_USER_ID: /^\d{17,19}$/,
  DISCORD_GUILD_ID: /^\d{17,19}$/,
  DISCORD_ROLE_ID: /^\d{17,19}$/,
  HEX_COLOR: /^#[0-9A-F]{6}$/i,
} as const;
```

#### Acceptance Criteria
- [ ] All magic numbers replaced with named constants
- [ ] Constants organized by domain (discord, timing, validation)
- [ ] Constants have JSDoc comments explaining purpose
- [ ] Constants use appropriate types (`as const`, enums)
- [ ] Related constants grouped together
- [ ] Documentation links provided where applicable
- [ ] No hardcoded strings for important values

#### Testing Steps
1. **Verify Functionality:**
   - Run full test suite
   - Verify: All features work identically
   - Verify: No behavioral changes

2. **Code Readability:**
   - Review updated code
   - Verify: Intent is clear from constant names
   - Verify: Easy to change values in one place

3. **Type Safety:**
   ```typescript
   const color = DISCORD_COLORS.APPROVED_ROLE;
   // color is type: 0x00D9FF (literal type, not just 'number')

   const timeout = TIMEOUTS.SESSION_CHECK_TIMEOUT;
   // timeout is type: 10000 (literal type)
   ```

4. **Documentation:**
   - Hover over constant in IDE
   - Verify: JSDoc comment appears
   - Verify: Links are clickable

#### Benefits
- **Maintainability:** Change value in one place
- **Readability:** Code documents itself
- **Discoverability:** IDE autocomplete shows all options
- **Type Safety:** Literal types prevent invalid values
- **Consistency:** Same values used everywhere

#### Example Usage Patterns

```typescript
// ❌ Bad: Magic numbers
setTimeout(callback, 10000);
if (attempts < 5) retry();
const color = 0x00D9FF;

// ✅ Good: Named constants
setTimeout(callback, TIMEOUTS.SESSION_CHECK_TIMEOUT);
if (attempts < RETRY_CONFIG.MAX_ATTEMPTS) retry();
const color = DISCORD_COLORS.APPROVED_ROLE;
```

---

## PHASE 4: ARCHITECTURE IMPROVEMENTS

### 🎫 TICKET #11: Remove Duplicate Data Loading Logic
**Priority:** 🟡 MEDIUM
**Severity:** MEDIUM
**Component:** Settings.tsx, authStore.ts
**Estimated Effort:** 2 hours

#### Description
Settings component re-implements 75 lines of user/organization loading logic that AuthStore already provides. This causes:
- Code duplication
- Inconsistent error handling
- Double database queries
- Maintenance burden
- Potential race conditions between two loading mechanisms

#### Current Duplication

**AuthStore (lib/auth/authStore.ts:31-150):**
```typescript
initialize: async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const { data: userData } = await supabase.from('users').select(...).single();
  const { data: orgData } = await supabase.from('organizations').select(...).single();
  set({ user: userData, organization: orgData });
}
```

**Settings Component (app/(authenticated)/dashboard/settings/Settings.tsx:86-161):**
```typescript
const loadOrganizationData = async () => {
  const { data: { session } } = await supabase.auth.getSession(); // DUPLICATE!
  const { data: { user } } = await supabase.auth.getUser(); // DUPLICATE!
  const { data: userData } = await supabase.from('users').select(...).single(); // DUPLICATE!
  const { data: org } = await supabase.from('organizations').select(...).single(); // DUPLICATE!
  setOrganization(org);
};
```

#### Problems
1. **Performance:** Two separate queries to load same data
2. **Race conditions:** AuthStore and Settings load simultaneously
3. **Inconsistency:** Different error handling in each place
4. **Maintenance:** Changes must be made in two places
5. **Complexity:** Harder to understand data flow

#### Required Changes

**Step 1: Update Settings component to use AuthStore**

```typescript
// app/(authenticated)/dashboard/settings/Settings.tsx

import { useAuthStoreInitialized } from '@/lib/auth/authStore';
import { createLogger } from '@/lib/logger';

const log = createLogger('Settings');

const Settings = () => {
  // ✅ Use AuthStore instead of local state
  const {
    user,
    organization,
    initialized,
    isInitializing,
    error: authError,
    refresh: refreshAuth
  } = useAuthStoreInitialized();

  // Only track Discord-specific state locally
  const [discordConfig, setDiscordConfig] = useState<DiscordConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Discord config only (NOT user/org data)
  useEffect(() => {
    const loadDiscordConfig = async () => {
      // Wait for auth to initialize first
      if (!initialized || !organization) {
        return;
      }

      try {
        setLoading(true);
        log.debug('Loading Discord config', { organizationId: organization.id });

        const supabase = createClient();
        const { data, error } = await supabase
          .from('discord_configs')
          .select('*')
          .eq('organization_id', organization.id)
          .maybeSingle(); // Use maybeSingle() - returns null if not found, no error

        if (error) {
          throw error;
        }

        setDiscordConfig(data);
        log.debug('Discord config loaded', { hasConfig: !!data });

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        log.error('Failed to load Discord config', { error: message });
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadDiscordConfig();
  }, [initialized, organization]);

  // Handle auth loading
  if (isInitializing || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <p>Loading settings...</p>
      </div>
    );
  }

  // Handle auth errors
  if (authError) {
    return (
      <Alert variant="error">
        <AlertTitle>Failed to Load User Data</AlertTitle>
        <AlertDescription>{authError.message}</AlertDescription>
        <Button onClick={refreshAuth}>Retry</Button>
      </Alert>
    );
  }

  // Handle no organization
  if (!organization) {
    return (
      <Alert variant="warning">
        <AlertTitle>No Organization</AlertTitle>
        <AlertDescription>
          You need to create or join an organization before configuring Discord integration.
        </AlertDescription>
        <Button onClick={() => router.push('/dashboard/organization/new')}>
          Create Organization
        </Button>
      </Alert>
    );
  }

  // Handle Discord config errors
  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Failed to Load Discord Configuration</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Render settings UI
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Discord Integration Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Organization: {organization.name}</CardTitle>
          <CardDescription>Configure Discord bot integration</CardDescription>
        </CardHeader>

        <CardContent>
          {discordConfig ? (
            <ConnectedBotView
              config={discordConfig}
              onDisconnect={handleDisconnectBot}
            />
          ) : (
            <DisconnectedBotView onConnect={handleConnectBot} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
```

**Step 2: Remove duplicate loading logic**

Delete these functions from Settings.tsx:
- `loadOrganizationData()` - Lines 86-161 (75 lines)
- `useEffect` hook that calls it
- Local `organization` state
- Local `user` state
- All session timeout logic (handled by AuthStore)

**Step 3: Add refresh capability to AuthStore**

```typescript
// lib/auth/authStore.ts

// Add method to refresh data without full re-initialization
refresh: async () => {
  const state = get();

  if (!state.user) {
    console.warn('[AuthStore] Cannot refresh - no user logged in');
    return;
  }

  try {
    log.debug('Refreshing user data', { userId: state.user.id });
    set({ isInitializing: true, error: null });

    const supabase = createClient();

    // Reload user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', state.user.id)
      .single();

    if (userError) throw userError;

    // Reload organization data if user has one
    let organizationData = null;
    if (userData.organization_id) {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userData.organization_id)
        .single();

      if (!orgError) {
        organizationData = orgData;
      }
    }

    log.debug('User data refreshed', { userId: userData.id, hasOrg: !!organizationData });

    set({
      user: userData,
      organization: organizationData,
      isInitializing: false,
      error: null,
    });

  } catch (error) {
    log.error('Failed to refresh user data', { error: error.message });
    set({
      isInitializing: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    });
    throw error;
  }
},
```

**Step 4: Update other components using duplicate logic**

Search for similar patterns:
```bash
grep -r "supabase.auth.getSession()" app/
grep -r "from('users').select" app/
grep -r "from('organizations').select" app/
```

Replace with AuthStore usage:
```typescript
// ❌ Before
const [user, setUser] = useState(null);
const [org, setOrg] = useState(null);

useEffect(() => {
  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data: userData } = await supabase.from('users')...
    setUser(userData);
  };
  loadData();
}, []);

// ✅ After
const { user, organization } = useAuthStoreInitialized();
```

**Step 5: Add helper hooks for common patterns**

```typescript
// lib/auth/hooks.ts

import { useAuthStoreInitialized } from './authStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Ensures user is authenticated and has an organization
 * Redirects to appropriate page if not
 */
export function useRequireOrganization() {
  const { user, organization, initialized } = useAuthStoreInitialized();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!organization) {
      router.push('/dashboard/organization/new');
      return;
    }
  }, [user, organization, initialized, router]);

  return { user, organization, initialized };
}

/**
 * Checks if user has specific role
 */
export function useHasRole(role: 'admin' | 'member') {
  const { user } = useAuthStoreInitialized();
  return user?.role === role;
}

/**
 * Gets organization ID, throws if not available
 */
export function useOrganizationId(): string {
  const { organization, initialized } = useAuthStoreInitialized();

  if (!initialized) {
    throw new Error('Auth not initialized');
  }

  if (!organization) {
    throw new Error('No organization available');
  }

  return organization.id;
}
```

**Step 6: Update Settings to use helper hooks**

```typescript
// app/(authenticated)/dashboard/settings/Settings.tsx

import { useRequireOrganization } from '@/lib/auth/hooks';

const Settings = () => {
  // This hook handles all auth checks and redirects
  const { organization, initialized } = useRequireOrganization();

  const [discordConfig, setDiscordConfig] = useState<DiscordConfig | null>(null);

  useEffect(() => {
    if (!initialized || !organization) return;

    // Load Discord config only
    loadDiscordConfig(organization.id);
  }, [initialized, organization]);

  // ... rest of component
};
```

#### Acceptance Criteria
- [ ] Settings component no longer loads user/organization data
- [ ] All user/org data comes from AuthStore
- [ ] Duplicate loading functions removed (75 lines deleted)
- [ ] Discord config loading happens after auth initialization
- [ ] No double database queries
- [ ] Consistent error handling across all components
- [ ] Helper hooks created for common auth patterns
- [ ] Other components updated to use AuthStore

#### Testing Steps
1. **Functionality Test:**
   - Visit /dashboard/settings
   - Verify: User and organization data loads correctly
   - Verify: Discord config loads correctly
   - Verify: No functionality changes

2. **Performance Test:**
   - Open browser network tab
   - Visit /dashboard/settings
   - Verify: Only ONE query to `users` table
   - Verify: Only ONE query to `organizations` table
   - Verify: One query to `discord_configs` table

3. **Error Handling Test:**
   - Simulate user query failure
   - Verify: Shows auth error, not Discord error
   - Simulate Discord config query failure
   - Verify: Shows Discord config error specifically

4. **Loading States Test:**
   - Add artificial delay to auth initialization
   - Verify: Shows loading spinner
   - Verify: Discord config doesn't load until auth completes

5. **No Organization Test:**
   - Login as user without organization
   - Visit /dashboard/settings
   - Verify: Shows "Create Organization" prompt
   - Verify: Doesn't attempt to load Discord config

6. **Refresh Test:**
   - Load settings page
   - Change organization name in database
   - Click refresh button (if added)
   - Verify: Updated name appears

#### Migration Checklist
- [ ] Update Settings.tsx
- [ ] Remove `loadOrganizationData()` function
- [ ] Remove `user` and `organization` local state
- [ ] Add `refresh` method to AuthStore
- [ ] Create auth helper hooks
- [ ] Search for other duplicate patterns
- [ ] Update all affected components
- [ ] Update tests
- [ ] Verify no regressions

#### Code Size Comparison
```
Before:
- Settings.tsx: 250 lines
- AuthStore.ts: 150 lines
- Total: 400 lines (with duplication)

After:
- Settings.tsx: 175 lines (-75 lines)
- AuthStore.ts: 170 lines (+20 lines for refresh)
- auth/hooks.ts: 50 lines (new)
- Total: 395 lines

Net result: -5 lines, but more importantly:
- Zero duplication
- Single source of truth
- Better separation of concerns
```

---

### 🎫 TICKET #12: Refactor Frontend-to-Frontend API Calls
**Priority:** 🟡 MEDIUM
**Severity:** MEDIUM
**Component:** applications.ts, assign-role/route.ts
**Estimated Effort:** 2 hours

#### Description
The `applications.ts` client-side code calls `/api/discord/assign-role` frontend API route, which is inefficient and limits reusability. This pattern:
- Adds unnecessary HTTP overhead
- Prevents server-side usage (e.g., background jobs)
- Makes testing harder
- Can cause browser CORS issues
- Couples client logic to API routes

#### Current Architecture

```
Client Component (applications.ts)
    ↓ HTTP POST
API Route (/api/discord/assign-role)
    ↓ HTTP(S)
Discord API
```

**Problem:** Client → HTTP → API Route → HTTP → Discord

#### Target Architecture

```
Shared Service (lib/services/discord-roles.ts)
    ↑                           ↑
Client Component        API Route        Background Job
  (applications.ts)     (assign-role)    (cron-retry-failed)
```

**Solution:** All call shared service directly

#### Current Code

```typescript
// lib/applications.ts (CLIENT-SIDE)
const response = await fetch('/api/discord/assign-role', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    guild_id: discordConfig.guild_id,
    user_id: discordUserId,
    role_id: discordConfig.approved_role_id,
  }),
});

// app/api/discord/assign-role/route.ts (API ROUTE)
export async function POST(request: NextRequest) {
  const { guild_id, user_id, role_id } = await request.json();

  // Role assignment logic here...
  const response = await fetch(
    `https://discord.com/api/guilds/${guild_id}/members/${user_id}/roles/${role_id}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
    }
  );

  return NextResponse.json({ success: true });
}
```

#### Required Changes

**Step 1: Create shared Discord service**

```typescript
// lib/services/discord-roles.ts

import { createLogger } from '@/lib/logger';
import { TIMEOUTS, DISCORD_RATE_LIMITS } from '@/lib/constants';
import {
  isValidDiscordUserId,
  isValidDiscordGuildId,
  isValidDiscordRoleId,
} from '@/lib/validators/discord';

const log = createLogger('DiscordRolesService');

export interface AssignRoleParams {
  guildId: string;
  userId: string;
  roleId: string;
}

export interface AssignRoleResult {
  success: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * Assigns a role to a user in a Discord guild
 * @throws {ValidationError} If input parameters are invalid
 * @throws {RateLimitError} If Discord rate limit is exceeded
 * @throws {DiscordAPIError} If Discord API returns an error
 */
export async function assignRoleToUser(
  params: AssignRoleParams
): Promise<AssignRoleResult> {
  const { guildId, userId, roleId } = params;

  log.debug('Assigning role to user', { guildId, userId, roleId });

  // Validate inputs
  if (!isValidDiscordGuildId(guildId)) {
    log.warn('Invalid guild ID', { guildId });
    return {
      success: false,
      error: 'Invalid guild ID format',
      errorCode: 'INVALID_GUILD_ID',
    };
  }

  if (!isValidDiscordUserId(userId)) {
    log.warn('Invalid user ID', { userId });
    return {
      success: false,
      error: 'Invalid user ID format',
      errorCode: 'INVALID_USER_ID',
    };
  }

  if (!isValidDiscordRoleId(roleId)) {
    log.warn('Invalid role ID', { roleId });
    return {
      success: false,
      error: 'Invalid role ID format',
      errorCode: 'INVALID_ROLE_ID',
    };
  }

  // Check bot token is configured
  if (!process.env.DISCORD_BOT_TOKEN) {
    log.error('Discord bot token not configured');
    return {
      success: false,
      error: 'Discord bot not configured',
      errorCode: 'BOT_NOT_CONFIGURED',
    };
  }

  // Call Discord API with timeout
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    TIMEOUTS.DISCORD_API_TIMEOUT
  );

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    // Success (204 No Content)
    if (response.status === 204) {
      log.info('Role assigned successfully', { guildId, userId, roleId });
      return { success: true };
    }

    // Handle specific error codes
    const errorData = await response.json().catch(() => ({}));

    log.error('Discord API error', {
      status: response.status,
      error: errorData,
      guildId,
      userId,
      roleId,
    });

    switch (response.status) {
      case 401:
        return {
          success: false,
          error: 'Bot authentication failed',
          errorCode: 'UNAUTHORIZED',
        };

      case 403:
        return {
          success: false,
          error: 'Bot lacks permission to assign roles',
          errorCode: 'FORBIDDEN',
        };

      case 404:
        return {
          success: false,
          error: 'User not found in guild or role does not exist',
          errorCode: 'NOT_FOUND',
        };

      case 429:
        const retryAfter = response.headers.get('X-RateLimit-Reset-After');
        return {
          success: false,
          error: `Rate limited. Retry after ${retryAfter} seconds`,
          errorCode: 'RATE_LIMITED',
        };

      case 500:
      case 502:
      case 503:
        return {
          success: false,
          error: 'Discord API is experiencing issues',
          errorCode: 'DISCORD_API_ERROR',
        };

      default:
        return {
          success: false,
          error: errorData.message || `Discord API error: ${response.status}`,
          errorCode: 'UNKNOWN_ERROR',
        };
    }
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof Error && error.name === 'AbortError') {
      log.error('Discord API request timed out', { guildId, userId, roleId });
      return {
        success: false,
        error: `Request timed out after ${TIMEOUTS.DISCORD_API_TIMEOUT}ms`,
        errorCode: 'TIMEOUT',
      };
    }

    log.error('Unexpected error assigning role', {
      error: error instanceof Error ? error.message : 'Unknown',
      guildId,
      userId,
      roleId,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: 'UNEXPECTED_ERROR',
    };
  }
}

/**
 * Removes a role from a user in a Discord guild
 */
export async function removeRoleFromUser(
  params: AssignRoleParams
): Promise<AssignRoleResult> {
  const { guildId, userId, roleId } = params;

  log.debug('Removing role from user', { guildId, userId, roleId });

  // Same validation as assignRoleToUser...

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    TIMEOUTS.DISCORD_API_TIMEOUT
  );

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (response.status === 204) {
      log.info('Role removed successfully', { guildId, userId, roleId });
      return { success: true };
    }

    // Handle errors similar to assignRoleToUser...

  } catch (error) {
    clearTimeout(timeout);
    // Handle errors...
  }
}

/**
 * Batch assign roles to multiple users
 * Respects Discord rate limits (50 per 10 minutes)
 */
export async function batchAssignRoles(
  guildId: string,
  userIds: string[],
  roleId: string
): Promise<Map<string, AssignRoleResult>> {
  log.info('Batch assigning roles', {
    guildId,
    userCount: userIds.length,
    roleId,
  });

  const results = new Map<string, AssignRoleResult>();

  // Process in chunks to respect rate limits
  const CHUNK_SIZE = DISCORD_RATE_LIMITS.ROLE_ASSIGNMENTS_PER_10_MIN;
  const DELAY_BETWEEN_CHUNKS = 10 * 60 * 1000; // 10 minutes

  for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
    const chunk = userIds.slice(i, i + CHUNK_SIZE);

    log.debug('Processing batch chunk', {
      chunkIndex: i / CHUNK_SIZE,
      chunkSize: chunk.length,
    });

    // Process chunk in parallel
    const promises = chunk.map(async (userId) => {
      const result = await assignRoleToUser({ guildId, userId, roleId });
      results.set(userId, result);
    });

    await Promise.all(promises);

    // Wait before next chunk (except for last chunk)
    if (i + CHUNK_SIZE < userIds.length) {
      log.info('Waiting before next chunk due to rate limits', {
        waitTimeMs: DELAY_BETWEEN_CHUNKS,
      });
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_CHUNKS));
    }
  }

  const successCount = Array.from(results.values()).filter((r) => r.success).length;
  log.info('Batch assignment complete', {
    total: userIds.length,
    successful: successCount,
    failed: userIds.length - successCount,
  });

  return results;
}
```

**Step 2: Update applications.ts to use service**

```typescript
// lib/applications.ts

import { assignRoleToUser } from '@/lib/services/discord-roles';
import { createLogger } from '@/lib/logger';

const log = createLogger('Applications');

async function assignDiscordRole(application: any, applicationData: any) {
  const discordUserId =
    application.custom_data.discord_user_id ||
    application.custom_data.discordUserId;

  // Get Discord config
  const supabase = createClient();
  const { data: discordConfig } = await supabase
    .from('discord_configs')
    .select('guild_id, approved_role_id')
    .eq('organization_id', application.organization_id)
    .single();

  if (!discordConfig?.guild_id || !discordConfig?.approved_role_id) {
    return {
      success: false,
      error: 'Discord integration not configured',
    };
  }

  // ✅ Call service directly (no HTTP request!)
  const result = await assignRoleToUser({
    guildId: discordConfig.guild_id,
    userId: discordUserId,
    roleId: discordConfig.approved_role_id,
  });

  if (!result.success) {
    log.error('Failed to assign Discord role', {
      applicationId: application.id,
      error: result.error,
      errorCode: result.errorCode,
    });
  }

  return result;
}
```

**Step 3: Update API route to use service**

```typescript
// app/api/discord/assign-role/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { assignRoleToUser } from '@/lib/services/discord-roles';
import { createLogger } from '@/lib/logger';

const log = createLogger('AssignRoleAPI');

export async function POST(request: NextRequest) {
  try {
    const { guild_id, user_id, role_id } = await request.json();

    log.info('Role assignment requested', { guild_id, user_id, role_id });

    // ✅ Call service directly
    const result = await assignRoleToUser({
      guildId: guild_id,
      userId: user_id,
      roleId: role_id,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          errorCode: result.errorCode,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Unexpected error in assign-role API', {
      error: error instanceof Error ? error.message : 'Unknown',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 4: Add background job for retry**

```typescript
// app/api/cron/retry-failed-role-assignments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/server';
import { assignRoleToUser } from '@/lib/services/discord-roles';
import { createLogger } from '@/lib/logger';

const log = createLogger('RetryFailedRoles');

/**
 * Cron job to retry failed Discord role assignments
 * Run every hour
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  log.info('Starting retry job for failed role assignments');

  const supabase = createServiceRoleClient();

  // Find applications with failed role assignments
  const { data: failedApplications, error } = await supabase
    .from('applications')
    .select('*, organization_id')
    .eq('discord_role_assignment_status', 'failed')
    .lt('discord_role_assignment_retry_count', 5)
    .order('discord_role_assignment_attempted_at', { ascending: true })
    .limit(50); // Process 50 at a time

  if (error) {
    log.error('Failed to fetch applications', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  log.info(`Found ${failedApplications.length} failed assignments to retry`);

  const results = {
    retried: 0,
    succeeded: 0,
    failed: 0,
  };

  for (const app of failedApplications) {
    // Get Discord config
    const { data: discordConfig } = await supabase
      .from('discord_configs')
      .select('guild_id, approved_role_id')
      .eq('organization_id', app.organization_id)
      .single();

    if (!discordConfig) {
      log.warn('No Discord config found', { applicationId: app.id });
      continue;
    }

    const discordUserId =
      app.custom_data.discord_user_id || app.custom_data.discordUserId;

    // ✅ Reuse same service!
    const result = await assignRoleToUser({
      guildId: discordConfig.guild_id,
      userId: discordUserId,
      roleId: discordConfig.approved_role_id,
    });

    results.retried++;

    if (result.success) {
      results.succeeded++;

      await supabase
        .from('applications')
        .update({
          status: 'approved_role_assigned',
          discord_role_assignment_status: 'success',
          discord_role_assignment_error: null,
          discord_role_assignment_attempted_at: new Date().toISOString(),
        })
        .eq('id', app.id);

      log.info('Retry successful', { applicationId: app.id });
    } else {
      results.failed++;

      await supabase
        .from('applications')
        .update({
          discord_role_assignment_status: 'failed',
          discord_role_assignment_error: result.error,
          discord_role_assignment_attempted_at: new Date().toISOString(),
          discord_role_assignment_retry_count:
            app.discord_role_assignment_retry_count + 1,
        })
        .eq('id', app.id);

      log.warn('Retry failed', {
        applicationId: app.id,
        error: result.error,
        retryCount: app.discord_role_assignment_retry_count + 1,
      });
    }
  }

  log.info('Retry job complete', results);

  return NextResponse.json(results);
}
```

**Step 5: Add unit tests for service**

```typescript
// __tests__/services/discord-roles.test.ts

import { assignRoleToUser } from '@/lib/services/discord-roles';

// Mock fetch
global.fetch = jest.fn();

describe('Discord Roles Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DISCORD_BOT_TOKEN = 'test-token';
  });

  it('assigns role successfully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(
      new Response(null, { status: 204 })
    );

    const result = await assignRoleToUser({
      guildId: '123456789012345678',
      userId: '987654321098765432',
      roleId: '111222333444555666',
    });

    expect(result.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('discord.com/api'),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          Authorization: 'Bot test-token',
        }),
      })
    );
  });

  it('handles invalid user ID', async () => {
    const result = await assignRoleToUser({
      guildId: '123456789012345678',
      userId: 'invalid',
      roleId: '111222333444555666',
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('INVALID_USER_ID');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('handles 404 from Discord API', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Unknown Member' }), {
        status: 404,
      })
    );

    const result = await assignRoleToUser({
      guildId: '123456789012345678',
      userId: '987654321098765432',
      roleId: '111222333444555666',
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('NOT_FOUND');
    expect(result.error).toContain('not found');
  });

  it('handles timeout', async () => {
    (fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(new Response()), 20000))
    );

    const result = await assignRoleToUser({
      guildId: '123456789012345678',
      userId: '987654321098765432',
      roleId: '111222333444555666',
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('TIMEOUT');
  });
});
```

#### Acceptance Criteria
- [ ] Shared Discord service created (`discord-roles.ts`)
- [ ] `applications.ts` uses service directly (no HTTP call)
- [ ] API route uses service
- [ ] Background retry job uses service
- [ ] All input validation happens in service
- [ ] Error handling standardized across all callers
- [ ] Unit tests added for service
- [ ] HTTP overhead eliminated for server-side calls
- [ ] Service is framework-agnostic (can be used anywhere)

#### Testing Steps
1. **Functionality Test:**
   - Approve application with Discord user
   - Verify: Role assigned successfully
   - Verify: No behavioral changes

2. **Performance Test (Server-Side):**
   - Time application approval before refactor
   - Time application approval after refactor
   - Verify: Faster (no HTTP overhead)

3. **Reusability Test:**
   - Create test script that imports service
   - Call `assignRoleToUser()` directly
   - Verify: Works without Next.js context

4. **Error Handling Test:**
   - Mock Discord API to return 404
   - Approve application
   - Verify: Same error handling as before

5. **Background Job Test:**
   - Create applications with failed role assignments
   - Trigger cron job: `GET /api/cron/retry-failed-role-assignments`
   - Verify: Failed assignments are retried
   - Verify: Database updated correctly

#### Benefits
- **Performance:** No HTTP overhead for server-side calls
- **Reusability:** Service can be called from anywhere
- **Testability:** Easy to unit test pure functions
- **Maintainability:** Single source of truth for Discord logic
- **Flexibility:** Can be used in API routes, cron jobs, webhooks, etc.
- **Type Safety:** Shared types across all callers

---

### 🎫 TICKET #13: Add Error Boundaries for Settings Component
**Priority:** 🟡 MEDIUM
**Severity:** MEDIUM
**Component:** Settings.tsx
**Estimated Effort:** 1 hour

#### Description
Errors during Discord operations crash the entire Settings component with no recovery option. Unhandled exceptions bubble up and break the entire page, leaving users with a blank screen or error page.

#### Current Issue
```typescript
// Settings.tsx
const handleConnectBot = async () => {
  const response = await fetch(...);

  if (!response.ok) {
    throw new Error('Failed to connect bot'); // ⚠️ Crashes entire component!
  }
};

const handleDisconnectBot = async () => {
  if (!confirm('Are you sure?')) return;

  const response = await fetch(...);
  if (!response.ok) {
    throw new Error('Failed to disconnect'); // ⚠️ Crashes entire component!
  }
};
```

**Problem:** Any error in Settings component takes down the entire page with no way to recover except page refresh.

#### Required Changes

**Step 1: Create reusable Error Boundary component**

```typescript
// components/ErrorBoundary.tsx

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createLogger } from '@/lib/logger';

const log = createLogger('ErrorBoundary');

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { level = 'component', onError } = this.props;

    // Log error
    log.error('Error boundary caught error', {
      level,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Report to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        level: 'error',
        tags: {
          errorBoundary: level,
        },
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.handleReset);
      }

      // Default fallback UI based on level
      return (
        <div className={`error-boundary error-boundary--${level}`}>
          {level === 'page' ? (
            <PageErrorFallback error={error} onReset={this.handleReset} />
          ) : (
            <ComponentErrorFallback
              error={error}
              level={level}
              onReset={this.handleReset}
            />
          )}
        </div>
      );
    }

    return children;
  }
}

/**
 * Full-page error fallback
 */
function PageErrorFallback({
  error,
  onReset,
}: {
  error: Error;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            We encountered an unexpected error. This has been logged and we'll look into it.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription className="mt-2 text-sm font-mono">
            {error.message}
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button onClick={onReset} className="flex-1">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/dashboard')}
            className="flex-1"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && error.stack && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              View stack trace
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * Section/Component error fallback
 */
function ComponentErrorFallback({
  error,
  level,
  onReset,
}: {
  error: Error;
  level: string;
  onReset: () => void;
}) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error Loading {level === 'section' ? 'Section' : 'Component'}</AlertTitle>
      <AlertDescription>
        <p className="mt-2">{error.message}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="mt-3"
        >
          <RefreshCcw className="mr-2 h-3 w-3" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Helper hook to create error boundaries with specific configs
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}
```

**Step 2: Wrap Settings component with Error Boundary**

```typescript
// app/(authenticated)/dashboard/settings/page.tsx

import { ErrorBoundary } from '@/components/ErrorBoundary';
import Settings from './Settings';

export default function SettingsPage() {
  return (
    <ErrorBoundary
      level="page"
      onError={(error, errorInfo) => {
        // Additional error tracking
        console.error('Settings page error:', error);
      }}
      fallback={(error, reset) => (
        <div className="container mx-auto py-8">
          <Alert variant="destructive">
            <AlertTitle>Failed to Load Settings</AlertTitle>
            <AlertDescription>
              {error.message}
              <div className="mt-4 flex gap-2">
                <Button onClick={reset}>Retry</Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    >
      <Settings />
    </ErrorBoundary>
  );
}
```

**Step 3: Add section-level error boundaries within Settings**

```typescript
// app/(authenticated)/dashboard/settings/Settings.tsx

import { ErrorBoundary } from '@/components/ErrorBoundary';

const Settings = () => {
  const { organization } = useAuthStoreInitialized();
  const [discordConfig, setDiscordConfig] = useState<DiscordConfig | null>(null);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Discord Integration Settings</h1>

      {/* Wrap potentially error-prone sections */}
      <ErrorBoundary level="section">
        <OrganizationInfo organization={organization} />
      </ErrorBoundary>

      <ErrorBoundary
        level="section"
        fallback={(error, reset) => (
          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertTitle>Discord Configuration Error</AlertTitle>
                <AlertDescription>
                  {error.message}
                  <Button onClick={reset} className="mt-2">
                    Retry Loading Config
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      >
        <DiscordConfigSection
          config={discordConfig}
          onConnect={handleConnectBot}
          onDisconnect={handleDisconnectBot}
        />
      </ErrorBoundary>
    </div>
  );
};
```

**Step 4: Use try-catch with user-friendly error handling**

```typescript
// Settings.tsx

const [error, setError] = useState<string | null>(null);

const handleConnectBot = async () => {
  try {
    setError(null);
    setLoading(true);

    const response = await fetch(...);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to connect Discord bot');
    }

    // Success
    toast.success('Discord bot connected successfully');

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    log.error('Failed to connect bot', { error: message });
    setError(message);

    // Show user-friendly toast instead of crashing
    toast.error('Failed to connect bot', {
      description: message,
      action: {
        label: 'Retry',
        onClick: handleConnectBot,
      },
    });

    // DON'T re-throw - handle gracefully
  } finally {
    setLoading(false);
  }
};
```

**Step 5: Add global error boundary in layout**

```typescript
// app/layout.tsx

import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary level="page">
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

#### Acceptance Criteria
- [ ] ErrorBoundary component created with page/section/component levels
- [ ] Settings page wrapped in page-level error boundary
- [ ] Discord config section has section-level error boundary
- [ ] Errors show user-friendly messages, not blank screens
- [ ] Reset button allows retry without page refresh
- [ ] Errors logged to console/monitoring service
- [ ] Development mode shows stack traces
- [ ] Production mode hides sensitive error details

#### Testing Steps
1. **Simulated Error Test:**
   ```typescript
   // Add to Settings component temporarily
   if (Math.random() > 0.5) {
     throw new Error('Test error');
   }
   ```
   - Visit settings page multiple times
   - Verify: Shows error UI instead of blank screen
   - Verify: "Try Again" button works

2. **Discord API Error:**
   - Mock Discord API to return 500 error
   - Click "Connect Bot"
   - Verify: Shows error message in section
   - Verify: Rest of page still works
   - Verify: Can retry connection

3. **Network Error:**
   - Disconnect internet
   - Click "Disconnect Bot"
   - Verify: Shows network error message
   - Verify: Can retry when reconnected

4. **Nested Error:**
   - Cause error in OrganizationInfo component
   - Verify: Only that section shows error
   - Verify: Discord config section still renders

5. **Error Logging:**
   - Trigger error
   - Check console/logs
   - Verify: Error details logged
   - Verify: Component stack trace included

#### Benefits
- **User Experience:** Graceful error handling instead of crashes
- **Recovery:** Users can retry without page refresh
- **Debugging:** Errors logged with full context
- **Isolation:** Errors in one section don't break entire page
- **Production Ready:** Hide sensitive details in production

---

## PHASE 5: ERROR HANDLING

### 🎫 TICKET #14: Track and Surface Role Assignment Failures
**Priority:** 🔴 HIGH
**Severity:** HIGH
**Component:** applications.ts
**Estimated Effort:** 1 hour

#### Description
When Discord role assignment fails, the error is only logged to console. Users think the application was approved successfully, but the role was never assigned. There's no indication in the UI that something went wrong.

#### Current Issue
```typescript
// applications.ts:134-140
if (!response.ok) {
  const errorData = await response.json();
  console.error('[Applications] Failed to assign Discord role:', errorData);
  // ⚠️ Error is logged but user never knows!
  // Application still shows "Approved"
}
```

**Scenario:**
1. Admin approves application
2. Discord API returns 403 (insufficient permissions)
3. Error logged to console
4. UI shows "Approved ✅"
5. User never receives role
6. No way to know or retry

#### Required Changes

**Note:** This ticket depends on Ticket #4 (Race Condition in Role Assignment) being completed first, as that ticket adds the database columns needed here.

**Step 1: Database schema (from Ticket #4)**
```sql
-- These columns should already exist from Ticket #4
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS discord_role_assignment_status TEXT,
ADD COLUMN IF NOT EXISTS discord_role_assignment_error TEXT,
ADD COLUMN IF NOT EXISTS discord_role_assignment_attempted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS discord_role_assignment_retry_count INTEGER DEFAULT 0;
```

**Step 2: Update UI to show role assignment status**

```typescript
// components/applications/ApplicationStatusBadge.tsx

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  application: Application;
}

export function ApplicationStatusBadge({ application }: Props) {
  const { status, discord_role_assignment_status, discord_role_assignment_error } = application;

  // Pending/Rejected states (no Discord integration)
  if (status === 'Pending') {
    return (
      <Badge variant="warning">
        <Clock className="mr-1 h-3 w-3" />
        Pending Review
      </Badge>
    );
  }

  if (status === 'Rejected') {
    return (
      <Badge variant="destructive">
        <XCircle className="mr-1 h-3 w-3" />
        Rejected
      </Badge>
    );
  }

  // Approved states with Discord role tracking
  if (status === 'approved_role_assigned' || discord_role_assignment_status === 'success') {
    return (
      <Badge variant="success">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Approved - Role Assigned
      </Badge>
    );
  }

  if (status === 'approved_pending_role' || discord_role_assignment_status === 'pending') {
    return (
      <Badge variant="warning" className="animate-pulse">
        <Clock className="mr-1 h-3 w-3" />
        Approved - Assigning Role...
      </Badge>
    );
  }

  if (status === 'approved_role_failed' || discord_role_assignment_status === 'failed') {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Approved - Role Assignment Failed
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">Error:</p>
          <p className="text-sm">{discord_role_assignment_error || 'Unknown error'}</p>
          <p className="text-xs text-gray-400 mt-1">
            Attempted: {new Date(application.discord_role_assignment_attempted_at).toLocaleString()}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Legacy approved (before role tracking was added)
  if (status === 'Approved') {
    return (
      <Badge variant="success">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Approved
      </Badge>
    );
  }

  return null;
}
```

**Step 3: Add retry button in applications table**

```typescript
// components/applications/ApplicationActions.tsx

import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { retryRoleAssignment } from '@/lib/applications';
import { toast } from 'sonner';

interface Props {
  application: Application;
  onUpdate: () => void;
}

export function ApplicationActions({ application, onUpdate }: Props) {
  const [isRetrying, setIsRetrying] = useState(false);

  const canRetry =
    (application.status === 'approved_role_failed' ||
      application.discord_role_assignment_status === 'failed') &&
    (application.discord_role_assignment_retry_count || 0) < 5;

  const handleRetry = async () => {
    if (!canRetry) return;

    setIsRetrying(true);
    try {
      const result = await retryRoleAssignment(application.id);

      if (result.success) {
        toast.success('Role assigned successfully');
        onUpdate();
      } else {
        toast.error('Retry failed', {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error('Failed to retry', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  if (!canRetry) return null;

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleRetry}
      disabled={isRetrying}
    >
      {isRetrying ? (
        <>
          <Spinner className="mr-2 h-3 w-3" />
          Retrying...
        </>
      ) : (
        <>
          <RefreshCcw className="mr-2 h-3 w-3" />
          Retry ({application.discord_role_assignment_retry_count || 0}/5)
        </>
      )}
    </Button>
  );
}
```

**Step 4: Add admin notification for failed assignments**

```typescript
// components/applications/FailedAssignmentsAlert.tsx

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Props {
  failedCount: number;
}

export function FailedAssignmentsAlert({ failedCount }: Props) {
  const router = useRouter();

  if (failedCount === 0) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Role Assignment Failures</AlertTitle>
      <AlertDescription>
        {failedCount} approved application{failedCount > 1 ? 's' : ''} failed to receive Discord
        roles. These applications show as "Approved" but users don't have access.
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => router.push('/dashboard/applications?filter=failed_roles')}
        >
          View Failed Assignments
        </Button>
      </AlertDescription>
    </Alert>
  );
}

// Usage in applications list page:
const ApplicationsPage = () => {
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    const fetchFailedCount = async () => {
      const { count } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('discord_role_assignment_status', 'failed');

      setFailedCount(count || 0);
    };

    fetchFailedCount();
  }, []);

  return (
    <div>
      <FailedAssignmentsAlert failedCount={failedCount} />
      {/* Rest of page */}
    </div>
  );
};
```

**Step 5: Add email notification for admins**

```typescript
// lib/notifications/role-assignment-failed.ts

import { createServiceRoleClient } from '@/utils/supabase/server';
import { sendEmail } from '@/lib/email';

export async function notifyAdminsOfFailedRoleAssignment(
  applicationId: string,
  error: string
) {
  const supabase = createServiceRoleClient();

  // Get application details
  const { data: application } = await supabase
    .from('applications')
    .select('*, organization:organizations(*)')
    .eq('id', applicationId)
    .single();

  if (!application) return;

  // Get admin emails
  const { data: admins } = await supabase
    .from('users')
    .select('email')
    .eq('organization_id', application.organization_id)
    .eq('role', 'admin');

  if (!admins || admins.length === 0) return;

  // Send email to all admins
  for (const admin of admins) {
    await sendEmail({
      to: admin.email,
      subject: `Discord Role Assignment Failed - ${application.organization.name}`,
      html: `
        <h2>Discord Role Assignment Failed</h2>
        <p>An approved application failed to receive the Discord role:</p>
        <ul>
          <li><strong>Applicant:</strong> ${application.email}</li>
          <li><strong>Application ID:</strong> ${applicationId}</li>
          <li><strong>Error:</strong> ${error}</li>
        </ul>
        <p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/applications">
            View Application
          </a>
        </p>
        <p><em>You can retry the role assignment from the applications dashboard.</em></p>
      `,
    });
  }
}

// Call from applications.ts after failed assignment:
if (!roleResult.success) {
  await notifyAdminsOfFailedRoleAssignment(id, roleResult.error);
}
```

#### Acceptance Criteria
- [ ] UI shows distinct badges for each role assignment state
- [ ] Tooltip displays error message on hover
- [ ] Retry button appears for failed assignments
- [ ] Retry count displayed (X/5)
- [ ] Alert shown when failed assignments exist
- [ ] Admins receive email notifications for failures
- [ ] Filter to view only failed assignments
- [ ] Error messages are user-friendly

#### Testing Steps
1. **Success Flow:**
   - Approve application with valid Discord user
   - Verify: Badge shows "Approved - Role Assigned"
   - Verify: Green checkmark icon

2. **Pending Flow:**
   - Approve application
   - Before role assigned, refresh page
   - Verify: Badge shows "Approved - Assigning Role..."
   - Verify: Badge animates (pulse)

3. **Failure Flow:**
   - Mock Discord API to return 403 error
   - Approve application
   - Verify: Badge shows "Approved - Role Assignment Failed"
   - Verify: Hover shows error message
   - Verify: Retry button appears

4. **Retry Flow:**
   - Create application with failed assignment
   - Click retry button
   - Verify: Button shows "Retrying..." with spinner
   - Verify: Success toast appears
   - Verify: Badge updates to "Role Assigned"

5. **Max Retry Flow:**
   - Create application with 5 failed attempts
   - Verify: Retry button shows "(5/5)" and is disabled
   - Verify: Error message suggests contacting support

6. **Alert Test:**
   - Create 3 applications with failed assignments
   - Visit applications page
   - Verify: Alert shows "3 approved applications failed..."
   - Verify: "View Failed Assignments" button filters list

7. **Email Test:**
   - Approve application that will fail
   - Verify: Admin receives email with error details
   - Verify: Email contains link to application

#### UI Mockup

```
┌──────────────────────────────────────────────────────┐
│ ⚠️ Role Assignment Failures                          │
│ 3 approved applications failed to receive Discord   │
│ roles. [View Failed Assignments]                     │
└──────────────────────────────────────────────────────┘

Applications List:
┌────────────────┬──────────────┬─────────────────────────┬─────────┐
│ Applicant      │ Status       │ Discord Role            │ Actions │
├────────────────┼──────────────┼─────────────────────────┼─────────┤
│ john@test.com  │ ✅ Approved  │ ✅ Approved - Role      │         │
│                │              │    Assigned             │         │
├────────────────┼──────────────┼─────────────────────────┼─────────┤
│ jane@test.com  │ ✅ Approved  │ ⏰ Approved - Assigning │         │
│                │              │    Role...              │         │
├────────────────┼──────────────┼─────────────────────────┼─────────┤
│ bob@test.com   │ ✅ Approved  │ ⚠️ Approved - Role      │ 🔄 Retry│
│                │              │    Assignment Failed    │  (2/5)  │
│                │              │    [Hover for details]  │         │
└────────────────┴──────────────┴─────────────────────────┴─────────┘
```

---

### 🎫 TICKET #15: Standardize API Error Responses
**Priority:** 🟡 MEDIUM
**Severity:** MEDIUM
**Component:** All API routes
**Estimated Effort:** 1 hour

#### Description
API routes return inconsistent error formats. Some redirect with query params, others return JSON, and error structures vary, making client-side error handling difficult and inconsistent.

#### Current Inconsistencies

**1. bot-callback: Redirects with error in query string**
```typescript
return NextResponse.redirect('/dashboard/settings?error=oauth_error');
```

**2. assign-role: Returns JSON error**
```typescript
return NextResponse.json({ error: '...' }, { status: 500 });
```

**3. disconnect: Returns JSON with different structure**
```typescript
return NextResponse.json({ error: '...', details: '...' });
```

**Problems:**
- Frontend can't reliably parse errors
- No error codes for programmatic handling
- No consistent status codes
- Hard to build error handling utilities
- Poor API documentation

#### Required Changes

**Step 1: Define standard error response format**

```typescript
// types/api.ts

/**
 * Standard API error response format
 * Consistent across all API routes
 */
export interface ApiErrorResponse {
  error: {
    /**
     * Machine-readable error code (UPPER_SNAKE_CASE)
     * Examples: 'INVALID_INPUT', 'UNAUTHORIZED', 'DISCORD_API_ERROR'
     */
    code: string;

    /**
     * Human-readable error message
     * Should be safe to display to end users
     */
    message: string;

    /**
     * Additional error details (optional)
     * Use for debugging, not for display
     */
    details?: any;

    /**
     * Field-specific validation errors (optional)
     * Used for form validation
     */
    fields?: Record<string, string>;
  };
}

/**
 * Standard API success response format
 */
export interface ApiSuccessResponse<T = any> {
  data: T;
  message?: string;
}

/**
 * HTTP status codes for common scenarios
 */
export const API_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Standard error codes
 */
export const API_ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Discord Integration
  DISCORD_API_ERROR: 'DISCORD_API_ERROR',
  DISCORD_BOT_NOT_CONFIGURED: 'DISCORD_BOT_NOT_CONFIGURED',
  DISCORD_INVALID_GUILD: 'DISCORD_INVALID_GUILD',
  DISCORD_INSUFFICIENT_PERMISSIONS: 'DISCORD_INSUFFICIENT_PERMISSIONS',
  DISCORD_RATE_LIMITED: 'DISCORD_RATE_LIMITED',

  // OAuth
  OAUTH_STATE_INVALID: 'OAUTH_STATE_INVALID',
  OAUTH_CODE_EXCHANGE_FAILED: 'OAUTH_CODE_EXCHANGE_FAILED',
  OAUTH_MISSING_PARAMETER: 'OAUTH_MISSING_PARAMETER',

  // Generic
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;
```

**Step 2: Create error response utility**

```typescript
// lib/api/responses.ts

import { NextResponse } from 'next/server';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  API_STATUS,
  API_ERROR_CODES,
} from '@/types/api';
import { createLogger } from '@/lib/logger';

const log = createLogger('APIResponses');

/**
 * Create standardized error response
 */
export function errorResponse(
  code: keyof typeof API_ERROR_CODES,
  message: string,
  options: {
    status?: number;
    details?: any;
    fields?: Record<string, string>;
    logLevel?: 'warn' | 'error';
  } = {}
): NextResponse<ApiErrorResponse> {
  const {
    status = API_STATUS.INTERNAL_SERVER_ERROR,
    details,
    fields,
    logLevel = 'error',
  } = options;

  // Log error
  log[logLevel]('API error response', {
    code,
    message,
    status,
    details,
  });

  const response: ApiErrorResponse = {
    error: {
      code: API_ERROR_CODES[code],
      message,
      ...(details && { details }),
      ...(fields && { fields }),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Create standardized success response
 */
export function successResponse<T>(
  data: T,
  options: {
    message?: string;
    status?: number;
  } = {}
): NextResponse<ApiSuccessResponse<T>> {
  const { message, status = API_STATUS.OK } = options;

  const response: ApiSuccessResponse<T> = {
    data,
    ...(message && { message }),
  };

  return NextResponse.json(response, { status });
}

/**
 * Common error responses as shorthand functions
 */
export const apiResponses = {
  // 400 Bad Request
  badRequest: (message: string, fields?: Record<string, string>) =>
    errorResponse('INVALID_INPUT', message, {
      status: API_STATUS.BAD_REQUEST,
      fields,
      logLevel: 'warn',
    }),

  // 401 Unauthorized
  unauthorized: (message = 'Authentication required') =>
    errorResponse('UNAUTHORIZED', message, {
      status: API_STATUS.UNAUTHORIZED,
      logLevel: 'warn',
    }),

  // 403 Forbidden
  forbidden: (message = 'You do not have permission to perform this action') =>
    errorResponse('FORBIDDEN', message, {
      status: API_STATUS.FORBIDDEN,
      logLevel: 'warn',
    }),

  // 404 Not Found
  notFound: (resource: string) =>
    errorResponse('NOT_FOUND', `${resource} not found`, {
      status: API_STATUS.NOT_FOUND,
      logLevel: 'warn',
    }),

  // 409 Conflict
  conflict: (message: string) =>
    errorResponse('CONFLICT', message, {
      status: API_STATUS.CONFLICT,
      logLevel: 'warn',
    }),

  // 500 Internal Server Error
  internalError: (message = 'An unexpected error occurred', details?: any) =>
    errorResponse('INTERNAL_ERROR', message, {
      status: API_STATUS.INTERNAL_SERVER_ERROR,
      details,
    }),

  // Discord-specific errors
  discordApiError: (message: string, details?: any) =>
    errorResponse('DISCORD_API_ERROR', message, {
      status: API_STATUS.BAD_REQUEST,
      details,
    }),

  discordRateLimited: (retryAfter?: number) =>
    errorResponse(
      'DISCORD_RATE_LIMITED',
      'Discord API rate limit exceeded. Please try again later.',
      {
        status: API_STATUS.TOO_MANY_REQUESTS,
        details: { retryAfter },
      }
    ),
};
```

**Step 3: Update bot-callback route**

```typescript
// app/api/discord/bot-callback/route.ts

import { errorResponse, successResponse, apiResponses } from '@/lib/api/responses';
import { API_STATUS } from '@/types/api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Validation errors
  if (!code) {
    // For OAuth, redirect with error
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?error=OAUTH_MISSING_PARAMETER&message=Missing authorization code`
    );
  }

  if (!stateParam) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?error=OAUTH_MISSING_PARAMETER&message=Missing state parameter`
    );
  }

  // Verify state
  try {
    const stateData = await verifyStateToken(stateParam);
    organizationId = stateData.org_id;
  } catch (error) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?error=OAUTH_STATE_INVALID&message=Invalid or expired state token`
    );
  }

  // Authorization check
  const { data: { session } } = await createClient().auth.getSession();
  if (!session) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?error=UNAUTHORIZED&message=Please log in first`
    );
  }

  // Exchange code for token
  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      // ...
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings?error=OAUTH_CODE_EXCHANGE_FAILED&message=Failed to exchange authorization code`
      );
    }

    // ... rest of flow ...

    // Success
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?success=true&message=Discord bot connected successfully`
    );
  } catch (error) {
    log.error('Unexpected error in bot callback', { error });
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?error=INTERNAL_ERROR&message=An unexpected error occurred`
    );
  }
}
```

**Step 4: Update assign-role route**

```typescript
// app/api/discord/assign-role/route.ts

import { errorResponse, successResponse, apiResponses } from '@/lib/api/responses';
import { assignRoleToUser } from '@/lib/services/discord-roles';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guild_id, user_id, role_id } = body;

    // Validation
    if (!guild_id || !user_id || !role_id) {
      return apiResponses.badRequest('Missing required fields', {
        guild_id: !guild_id ? 'Guild ID is required' : undefined,
        user_id: !user_id ? 'User ID is required' : undefined,
        role_id: !role_id ? 'Role ID is required' : undefined,
      });
    }

    // Assign role
    const result = await assignRoleToUser({ guildId: guild_id, userId: user_id, roleId: role_id });

    if (!result.success) {
      // Map error codes to appropriate responses
      switch (result.errorCode) {
        case 'INVALID_USER_ID':
        case 'INVALID_GUILD_ID':
        case 'INVALID_ROLE_ID':
          return apiResponses.badRequest(result.error!);

        case 'UNAUTHORIZED':
          return apiResponses.unauthorized('Bot authentication failed');

        case 'FORBIDDEN':
          return errorResponse(
            'DISCORD_INSUFFICIENT_PERMISSIONS',
            'Bot lacks permission to assign roles',
            { status: API_STATUS.FORBIDDEN }
          );

        case 'NOT_FOUND':
          return apiResponses.notFound('User or role');

        case 'RATE_LIMITED':
          return apiResponses.discordRateLimited();

        case 'TIMEOUT':
          return errorResponse('TIMEOUT', 'Request to Discord API timed out', {
            status: API_STATUS.SERVICE_UNAVAILABLE,
          });

        default:
          return apiResponses.discordApiError(result.error || 'Unknown error', {
            errorCode: result.errorCode,
          });
      }
    }

    // Success
    return successResponse(
      { role_assigned: true },
      { message: 'Role assigned successfully' }
    );
  } catch (error) {
    log.error('Unexpected error in assign-role', { error });
    return apiResponses.internalError('Failed to assign role', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
  }
}
```

**Step 5: Update client-side error handling**

```typescript
// lib/api/client.ts

import { ApiErrorResponse, ApiSuccessResponse } from '@/types/api';

/**
 * Enhanced fetch wrapper with standardized error handling
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as ApiErrorResponse;
      throw new ApiError(
        errorData.error.message,
        errorData.error.code,
        response.status,
        errorData.error.details
      );
    }

    return (data as ApiSuccessResponse<T>).data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or parsing error
    throw new ApiError(
      'Network error or invalid response',
      'NETWORK_ERROR',
      0,
      error
    );
  }
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /**
   * Check if error is specific type
   */
  is(code: string): boolean {
    return this.code === code;
  }

  /**
   * Check if error is user-facing (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is server-side (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }
}

// Usage example:
try {
  const result = await apiRequest<{ role_assigned: boolean }>(
    '/api/discord/assign-role',
    {
      method: 'POST',
      body: JSON.stringify({ guild_id, user_id, role_id }),
    }
  );

  console.log('Role assigned:', result.role_assigned);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.is('DISCORD_RATE_LIMITED')) {
      toast.error('Rate limited', {
        description: `Please wait ${error.details.retryAfter} seconds`,
      });
    } else if (error.is('DISCORD_INSUFFICIENT_PERMISSIONS')) {
      toast.error('Permission error', {
        description: 'Bot needs "Manage Roles" permission',
      });
    } else {
      toast.error(error.message);
    }
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

#### Acceptance Criteria
- [ ] All API routes return consistent JSON error format
- [ ] Error responses include machine-readable codes
- [ ] Status codes are semantically correct
- [ ] Client wrapper parses errors consistently
- [ ] Field validation errors use `fields` property
- [ ] OAuth redirects include error codes in query string
- [ ] Error details hidden in production, visible in development
- [ ] Documentation includes all error codes

#### Testing Steps
1. **Validation Error:**
   - POST to `/api/discord/assign-role` with missing fields
   - Verify: Returns 400 status
   - Verify: Response includes `fields` object with specific errors

2. **Authorization Error:**
   - Call API without session
   - Verify: Returns 401 status
   - Verify: Error code is "UNAUTHORIZED"

3. **Discord API Error:**
   - Mock Discord to return 403
   - Call assign-role endpoint
   - Verify: Returns 403 status
   - Verify: Error code is "DISCORD_INSUFFICIENT_PERMISSIONS"

4. **Rate Limit:**
   - Mock Discord to return 429
   - Call assign-role endpoint
   - Verify: Returns 429 status
   - Verify: Includes `retryAfter` in details

5. **Client Handling:**
   - Use `apiRequest` wrapper
   - Trigger various errors
   - Verify: `ApiError` thrown with correct properties
   - Verify: Can use `.is()` to check error type

#### Error Code Documentation

Create API documentation:
```markdown
## API Error Codes

### Authentication & Authorization
- `UNAUTHORIZED` (401): No valid session
- `FORBIDDEN` (403): Insufficient permissions
- `INVALID_TOKEN` (401): Invalid or expired token

### Validation
- `INVALID_INPUT` (400): Request validation failed
- `MISSING_REQUIRED_FIELD` (400): Required field not provided
- `INVALID_FORMAT` (400): Field format is invalid

### Discord Integration
- `DISCORD_API_ERROR` (400): Discord API returned an error
- `DISCORD_BOT_NOT_CONFIGURED` (400): Bot token not set
- `DISCORD_INSUFFICIENT_PERMISSIONS` (403): Bot lacks required permissions
- `DISCORD_RATE_LIMITED` (429): Hit Discord rate limit

... (full list)
```

---

I'll continue with the remaining tickets in my next response (Performance, UX, and Missing Features - tickets #16-21).