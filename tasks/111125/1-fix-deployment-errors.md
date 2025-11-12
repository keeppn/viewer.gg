---
status: pending
---

# Fix Deployment Build Errors

## 📊 Description

Fixing two critical deployment build errors preventing successful Vercel deployments:

1. **CSS @import Rule Error**: Google Fonts import statement is not at the top of globals.css, causing PostCSS compilation failure. The @import rule must precede all other rules except @charset and @layer statements.

2. **TypeScript Route Handler Error**: Route handler for application approval endpoint using synchronous params destructuring, but Next.js 15+ requires params to be awaited as they're now Promise-based. This is breaking the build with type errors.

Both issues stem from recent Discord bot integration work and must be resolved to restore deployments.

**Critical Context**: Next.js 15 migration changed route parameters from synchronous objects to Promises, requiring all dynamic route handlers to await params before accessing values.

---

## 🧠 Chain of Thought

### Why This Approach?

**CSS Import Order**:
- PostCSS and modern CSS spec require @import rules at the top of files
- This is a hard requirement, not a warning - builds will fail otherwise
- Moving Google Fonts import before Tailwind import is the correct fix
- Simple reordering maintains all functionality while fixing compilation

**Async Params Pattern**:
- Next.js 15+ made route params async to support better static optimization
- All route handlers with dynamic segments now receive `Promise<{...}>` params
- Must await params before destructuring to access values
- This is a breaking change that affects all `[id]` style routes
- Pattern: `const { id } = await params;` instead of direct destructuring

### Key Logic & Patterns

**Route Handler Update Pattern**:
```typescript
// OLD (Next.js 14 and earlier):
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id; // Direct access
}

// NEW (Next.js 15+):
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Must await first
}
```

### Critical References

- **/web/src/app/globals.css** — Main stylesheet with import order issue
- **/web/src/app/api/applications/[id]/approve/route.ts** — Route handler needing async params fix
- **Next.js 15 Migration Docs** — https://nextjs.org/docs/app/building-your-application/upgrading/version-15

### Expected Side Effects

**Performance**: No impact - these are build-time fixes
**Breaking Changes**: None - maintaining existing functionality
**Security**: No impact
**Database**: No changes needed

### Learning & Insights

- CSS @import rules have strict positioning requirements in modern CSS spec
- Next.js 15's async params change is a common migration issue
- Always check for dynamic route handlers when upgrading Next.js major versions
- Vercel build errors often show exact line numbers and type mismatches

---

## 📚 KNOWLEDGE BASE

### Core System Paths

| Path | Purpose | Dependencies |
|------|---------|--------------|
| `/web/src/app/globals.css` | Global styles with CSS variables | Tailwind CSS, PostCSS |
| `/web/src/app/api/applications/[id]/approve/route.ts` | Application approval endpoint | Supabase, Discord API |
| `/web/src/lib/discord/roleAssignment.ts` | Discord role assignment logic | Discord.js |
| `/web/src/lib/supabase/server.ts` | Server-side Supabase client | Supabase SSR |

### Environment & Configuration

| File | Purpose | Required Variables |
|------|---------|-------------------|
| `/.env.local` | Environment configuration | DISCORD_BOT_TOKEN, SUPABASE_URL |
| `/next.config.js` | Next.js configuration | App routes, build settings |
| `/postcss.config.js` | PostCSS/Tailwind config | CSS processing pipeline |
| `/tsconfig.json` | TypeScript configuration | Path aliases, strict mode |

### External Integrations

| Service | Config Path | Documentation |
|---------|-------------|---------------|
| Discord Bot API | `/web/src/lib/discord/` | https://discord.com/developers/docs |
| Supabase | `/web/src/lib/supabase/` | https://supabase.com/docs |
| Vercel | `/vercel.json` | https://vercel.com/docs |

### Build & Development Tools

| Tool | Config | Command |
|------|--------|---------|
| Next.js | `/next.config.js` | `npm run build` |
| TypeScript | `/tsconfig.json` | `npm run type-check` |
| PostCSS | `/postcss.config.js` | Part of build |

---

## 🎯 Task Groups

### Fix CSS Import Order
- [ ] **Move Google Fonts import to top** — Reorder @import statements in globals.css so Google Fonts import comes before Tailwind import, satisfying PostCSS requirements

### Fix Route Handler Type Error
- [ ] **Update params type signature** — Change params from `{ params: { id: string } }` to `{ params: Promise<{ id: string }> }` in approve route handler
- [ ] **Add await for params destructuring** — Add `const { id } = await params;` at start of POST function to properly handle async params
- [ ] **Update all references** — Replace all `params.id` references with the awaited `id` variable throughout the function

### Test & Deploy
- [ ] **Test local build** — Run `npm run build` locally to verify both fixes resolve the compilation errors
- [ ] **Commit changes** — Commit fixes with descriptive message referencing both issues
- [ ] **Push to GitHub** — Push to main branch to trigger Vercel deployment
- [ ] **Verify deployment** — Confirm Vercel build succeeds and application is deployed

---

## 📂 FILES CHANGED

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| /web/src/app/globals.css | Modified | Moved Google Fonts @import to top of file |
| /web/src/app/api/applications/[id]/approve/route.ts | Modified | Updated to async params pattern for Next.js 15 |

---

## 🔗 Previously Related Tasks

- /tasks/101125/2-implement-discord-bot-integration.md — Initial Discord bot implementation that introduced these route handlers
- /tasks/101125/1-migrate-to-nextjs-15.md — Next.js 15 migration that changed params API
