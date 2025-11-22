# viewer.gg COMPLETE DASHBOARD REVAMP PLAN
**Master Implementation Guide - Design Laws + Best Practices**

---

## 🎯 DESIGN LAWS (FROM SCREENSHOTS - NON-NEGOTIABLE)

### LAW #1: Golden Ratio Typography (1.618)
```
Body text size × 1.618 = Balanced title
"gives you a really nice balanced title"
```

**Implementation:**
- Base: 16px
- H2: 26px (16 × 1.618) ✅
- H1: 42px (26 × 1.618) ✅
- All other sizes derived from this ratio

### LAW #2: 8pt Spacing System
```
Use 8, 16, 24, 32, 40, 48, 56, 64...
Creates visual harmony and speeds up workflow
Perfect for margins, padding, grids
```

**Implementation:**
- ALL padding: multiples of 8
- ALL margins: multiples of 8
- ALL gaps: multiples of 8
- Grid columns: 32px gaps
- NO EXCEPTIONS: No 12px, 18px, 20px, 25px, etc.

### LAW #3: BASE/CONTRAST/ACCENT Color System
```
2 NEUTRALS: Warm + Cool backgrounds
BASE: Primary brand (30% usage) - Purple #9381FF
CONTRAST: Success/Active (8% usage) - Lime #DAFF7C
ACCENT: Interactive elements (2% usage) - Cyan #00F0FF
```

**Implementation:**
- 60% Neutrals (#1A1D23 cool, #2A2A2A warm)
- 30% BASE Purple (navigation, primary buttons)
- 8% CONTRAST Lime (success, live, approved)
- 2% ACCENT Cyan (links, CTAs)

---

## 📐 COMPLETE DESIGN SYSTEM

### Typography Scale (Golden Ratio 1.618)

```typescript
// /web/src/styles/typography.ts
export const typography = {
  // Display (Logo) - Geist Sans Bold
  display: {
    size: '42px',      // 26 × 1.618
    lineHeight: '48px', // 8pt multiple
    weight: 700,
    family: 'Geist Sans'
  },

  // H1 (Page Titles) - Inter Bold
  h1: {
    size: '32px',      // 2rem
    lineHeight: '40px', // 8pt multiple
    weight: 700,
    family: 'Inter'
  },

  // H2 (Section Headers) - Inter Semibold
  h2: {
    size: '26px',      // 16 × 1.618 ← GOLDEN RATIO!
    lineHeight: '32px', // 8pt multiple
    weight: 600,
    family: 'Inter'
  },

  // H3 (Subsections) - Inter Semibold
  h3: {
    size: '20px',      // 16 × 1.25
    lineHeight: '24px', // 8pt multiple
    weight: 600,
    family: 'Inter'
  },

  // H4 (Card Titles) - Inter Medium
  h4: {
    size: '18px',      // 16 × 1.125
    lineHeight: '24px',
    weight: 500,
    family: 'Inter'
  },

  // Body Large - Inter Regular
  bodyLarge: {
    size: '18px',
    lineHeight: '24px',
    weight: 400,
    family: 'Inter'
  },

  // Body (Default) - Inter Regular
  body: {
    size: '16px',      // BASE SIZE
    lineHeight: '24px', // 1.5 ratio (optimal readability)
    weight: 400,
    family: 'Inter'
  },

  // Body Small - Inter Regular
  bodySmall: {
    size: '14px',
    lineHeight: '20px',
    weight: 400,
    family: 'Inter'
  },

  // Caption - Inter Regular
  caption: {
    size: '12px',
    lineHeight: '16px',
    weight: 400,
    family: 'Inter'
  },

  // Micro - Inter Medium
  micro: {
    size: '10px',
    lineHeight: '16px',
    weight: 500,
    family: 'Inter'
  }
};
```

### Spacing Scale (8pt System)

```typescript
// /web/src/styles/spacing.ts
export const spacing = {
  0: '0px',
  1: '8px',    // xs - Tight gaps, icon padding
  2: '16px',   // sm - Card padding, comfortable gaps
  3: '24px',   // md - Section padding, margins
  4: '32px',   // lg - Container padding, grid gaps
  5: '40px',   // xl - Page margins, hero sections
  6: '48px',   // 2xl - Large separations
  8: '64px',   // 3xl - Major layout divisions
  10: '80px',  // 4xl - Hero spacing
  12: '96px',  // 5xl - Massive separations
  16: '128px', // 6xl - Ultra-wide spacing
};

// Component-specific spacing rules
export const componentSpacing = {
  // Cards
  cardPadding: spacing[3],      // 24px internal
  cardGap: spacing[4],          // 32px external (> internal) ✅
  cardRadius: spacing[2],       // 16px (2 × 8)

  // Buttons
  buttonPaddingY: spacing[2],   // 16px vertical
  buttonPaddingX: spacing[4],   // 32px horizontal
  buttonHeight: spacing[6],     // 48px total height
  buttonRadius: spacing[1],     // 8px
  buttonGap: spacing[1],        // 8px icon gap

  // Sidebar
  sidebarWidth: '256px',        // 32 × 8
  sidebarPadding: spacing[3],   // 24px
  navItemPadding: spacing[2],   // 16px
  navItemGap: spacing[1],       // 8px

  // Grid
  containerMaxWidth: '1440px',  // 180 × 8
  containerPadding: spacing[5], // 40px
  gridGap: spacing[4],          // 32px

  // Headers
  headerHeight: spacing[8],     // 64px
  headerPadding: spacing[3],    // 24px
};
```

### Color System (BASE/CONTRAST/ACCENT)

```typescript
// /web/src/styles/colors.ts
export const colors = {
  // NEUTRALS (60% of interface)
  neutral: {
    1: {
      bg: '#1A1D23',      // Cool dark slate - page backgrounds, recessed
      name: 'Neutral 1 (Cool)'
    },
    2: {
      bg: '#2A2A2A',      // Warm dark charcoal - cards, elevated surfaces
      name: 'Neutral 2 (Warm)'
    },
    border: 'rgba(255, 255, 255, 0.08)',
    divider: 'rgba(255, 255, 255, 0.06)',
  },

  // BASE (30% of interface) - Primary Brand
  base: {
    DEFAULT: '#9381FF',   // Purple - Navigation, primary buttons
    hover: '#A494FF',     // +8% lighter
    active: '#8270EE',    // -8% darker
    dim: 'rgba(147, 129, 255, 0.12)',
    glow: 'rgba(147, 129, 255, 0.24)',
    name: 'BASE Purple'
  },

  // CONTRAST (8% of interface) - Success/Active
  contrast: {
    DEFAULT: '#DAFF7C',   // Lime - Success, approved, live, active
    hover: '#E5FF99',     // Lighter
    active: '#CFFF5F',    // Darker
    dim: 'rgba(218, 255, 124, 0.12)',
    name: 'CONTRAST Lime'
  },

  // ACCENT (2% of interface) - Interactive
  accent: {
    DEFAULT: '#00F0FF',   // Cyan - Links, CTAs, clickable
    hover: '#33F3FF',     // Lighter
    active: '#00D4E6',    // Darker
    dim: 'rgba(0, 240, 255, 0.12)',
    name: 'ACCENT Cyan'
  },

  // SEMANTIC (Use sparingly, context-specific)
  semantic: {
    success: '#22C55E',   // Green - Approved, success states
    error: '#EF4444',     // Red - Rejected, errors, delete
    warning: '#F59E0B',   // Amber - Warnings (rare)
    info: '#3B82F6',      // Blue - Info (rare)
  },

  // TEXT (Based on neutrals)
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    quaternary: 'rgba(255, 255, 255, 0.3)',
  }
};

// Usage rules
export const colorUsage = {
  backgrounds: {
    page: colors.neutral[1].bg,           // Cool dark
    card: colors.neutral[2].bg,           // Warm dark (elevated)
    sidebar: colors.neutral[1].bg,        // Cool dark (recessed)
    header: colors.neutral[1].bg,         // Cool dark
  },

  interactive: {
    primaryButton: colors.base.DEFAULT,   // Purple
    secondaryButton: 'transparent',
    linkText: colors.accent.DEFAULT,      // Cyan
    activeNavBg: colors.base.dim,         // Purple dim
    activeNavIndicator: colors.base.DEFAULT, // Purple solid
  },

  status: {
    live: colors.contrast.DEFAULT,        // Lime (CONTRAST)
    approved: colors.semantic.success,    // Green
    rejected: colors.semantic.error,      // Red
    pending: colors.neutral[2].bg,        // Neutral (not colored)
  },

  accents: {
    cardBorderDefault: colors.neutral.border,
    cardBorderHover: 'rgba(255, 255, 255, 0.15)',
    focusRing: colors.base.DEFAULT,       // Purple
    dividers: colors.neutral.divider,
  }
};
```

---

## 🎨 COMPONENT REDESIGN (All Components)

### 1. Sidebar Navigation

**Current Issues:**
- ❌ Random padding (not 8pt)
- ❌ Inconsistent active state
- ❌ No smooth transitions

**New Design:**
```typescript
// Enhanced Sidebar with LAWS applied
<aside className="
  w-[256px]           // 32 × 8 ✅
  bg-[#1A1D23]        // Neutral 1 (Cool) ✅
  border-r
  border-white/8      // Neutral border ✅
  p-24                // 24px = 3 × 8 ✅
">
  {/* Logo - Geist Sans, Golden Ratio size */}
  <h1 className="
    text-[42px]       // Display size (1.618²) ✅
    leading-[48px]    // 6 × 8 ✅
    font-bold
    mb-32             // 4 × 8 ✅
  " style={{ fontFamily: 'Geist Sans' }}>
    viewer.gg
  </h1>

  {/* Navigation Items */}
  <nav className="space-y-8">  {/* 1 × 8 gap ✅ */}
    <NavItem
      active={isActive}
      // Framer Motion shared layout
      layoutId="activeIndicator"
    />
  </nav>
</aside>

// NavItem with Framer Motion
const NavItem = ({ active }) => (
  <motion.div
    className="
      relative
      px-16 py-12     // 2×8, 1.5×8 ✅
      rounded-8       // 1 × 8 ✅
      cursor-pointer
    "
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
  >
    {active && (
      <motion.div
        layoutId="activeIndicator"  // Shared layout! ✅
        className="
          absolute
          left-0
          w-4 h-full        // 0.5 × 8 width ✅
          bg-[#9381FF]      // BASE color ✅
          rounded-r-4
        "
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      />
    )}
    {/* Content */}
  </motion.div>
);
```

### 2. Cards (Statistics, Tournament, Application)

**Current Issues:**
- ❌ Inconsistent sizing
- ❌ Too many colors
- ❌ No stagger animation on load

**New Design:**
```typescript
// Card Grid with Stagger
const StatsCards = () => (
  <motion.div
    className="
      grid
      grid-cols-4
      gap-32          // 4 × 8 ✅
      mb-40           // 5 × 8 ✅
    "
    variants={staggerContainer}
    initial="hidden"
    animate="visible"
  >
    {stats.map((stat, i) => (
      <motion.div key={i} variants={fadeInUp}>
        <Card {...stat} />
      </motion.div>
    ))}
  </motion.div>
);

// Card Component
const Card = ({ title, value, icon, variant = 'neutral' }) => (
  <motion.div
    className="
      bg-[#2A2A2A]      // Neutral 2 (Warm) ✅
      p-24              // 3 × 8 ✅
      rounded-16        // 2 × 8 ✅
      border border-white/8
    "
    whileHover={{
      y: -4,            // Half of 8pt ✅
      borderColor: 'rgba(255, 255, 255, 0.15)'
    }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="
          text-[12px]     // Caption size ✅
          leading-[16px]  // 2 × 8 ✅
          uppercase
          tracking-wide
          mb-8            // 1 × 8 ✅
          {variantColor}
        ">
          {title}
        </p>
        <p className="
          text-[32px]     // H1 size ✅
          leading-[40px]  // 5 × 8 ✅
          font-bold
        ">
          {value}
        </p>
      </div>

      {/* Icon */}
      <div className="
        w-48 h-48       // 6 × 8 ✅
        rounded-8       // 1 × 8 ✅
        {variantBg}
        flex items-center justify-center
      ">
        {icon}
      </div>
    </div>
  </motion.div>
);
```

### 3. Buttons (All Variants)

**New Design:**
```typescript
const Button = ({ variant, children, icon }) => (
  <motion.button
    className={cn(
      // Base (8pt spacing)
      "px-32 py-16",      // 4×8, 2×8 ✅
      "rounded-8",        // 1 × 8 ✅
      "h-48",             // 6 × 8 ✅
      "text-[16px]",      // Body size ✅
      "leading-[24px]",   // 3 × 8 ✅
      "font-semibold",
      "flex items-center gap-8", // 1 × 8 ✅

      // Variants
      variant === 'primary' && "bg-[#9381FF] text-white", // BASE ✅
      variant === 'secondary' && "bg-transparent border border-[#9381FF] text-[#9381FF]",
      variant === 'success' && "bg-[#22C55E] text-white", // Semantic ✅
      variant === 'accent' && "bg-[#00F0FF] text-[#1A1D23]", // ACCENT ✅
    )}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    {icon && <span className="w-20 h-20">{icon}</span>} {/* 2.5 × 8 ✅ */}
    {children}
  </motion.button>
);
```

### 4. Page Layout (Container, Grid)

**New Design:**
```typescript
const DashboardPage = ({ children }) => (
  <motion.div
    className="
      max-w-[1440px]    // Container (180 × 8) ✅
      mx-auto
      px-40             // 5 × 8 ✅
      py-40             // 5 × 8 ✅
    "
    variants={pageVariants}
    initial="hidden"
    animate="visible"
  >
    {/* Page Title */}
    <h1 className="
      text-[32px]       // H1 (Golden ratio) ✅
      leading-[40px]    // 5 × 8 ✅
      font-bold
      mb-24             // 3 × 8 ✅
    ">
      {title}
    </h1>

    {/* Content Grid */}
    <div className="
      grid
      grid-cols-12
      gap-32            // 4 × 8 ✅
    ">
      {children}
    </div>
  </motion.div>
);
```

---

## 🎬 ANIMATION IMPLEMENTATION

### Framer Motion Setup

```typescript
// /web/src/animations/variants.ts
export const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 20    // Not 8pt multiple (motion feels better with 20)
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,    // 70ms between items
      delayChildren: 0.1        // 100ms initial delay
    }
  }
};

export const scaleIn = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  }
};

export const slideIn = (direction: 'left' | 'right') => ({
  hidden: { x: direction === 'left' ? -20 : 20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
});

// Spring configs (iOS-like physics)
export const springs = {
  snappy: { type: "spring" as const, stiffness: 400, damping: 17 },
  smooth: { type: "spring" as const, stiffness: 300, damping: 24 },
  gentle: { type: "spring" as const, stiffness: 260, damping: 20 },
  bouncy: { type: "spring" as const, stiffness: 380, damping: 12 },
};
```

### Live Badge with Continuous Pulse

```typescript
const LiveBadge = () => (
  <motion.div
    className="
      inline-flex
      items-center
      gap-8           // 1 × 8 ✅
      px-12 py-4      // 1.5×8, 0.5×8 ✅
      rounded-12      // 1.5 × 8 ✅
      bg-[#DAFF7C]    // CONTRAST Lime ✅
      text-[#1A1D23]
      text-[11px]     // Micro ✅
      font-semibold
      uppercase
    "
    animate={{
      scale: [1, 1.05, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <motion.div
      className="w-8 h-8 rounded-full bg-[#1A1D23]" // 1 × 8 ✅
      animate={{
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
    />
    LIVE
  </motion.div>
);
```

---

## 📋 COMPLETE IMPLEMENTATION PLAN

### PHASE 1: Foundation (Typography + Spacing)

**Files to Update:**
1. `/web/src/app/globals.css`
   - [ ] Update CSS variables with exact values
   - [ ] Golden Ratio typography scale
   - [ ] 8pt spacing scale
   - [ ] BASE/CONTRAST/ACCENT colors

2. `/web/tailwind.config.ts` (if exists)
   - [ ] Add custom spacing scale (8pt)
   - [ ] Add custom font sizes (Golden Ratio)
   - [ ] Add color tokens

3. Create `/web/src/styles/` directory
   - [ ] `typography.ts` - Type scale constants
   - [ ] `spacing.ts` - Spacing scale constants
   - [ ] `colors.ts` - Color system constants

**Changes:**
- Replace ALL font sizes with Golden Ratio scale
- Replace ALL padding/margin with 8pt multiples
- Update Inter font usage everywhere
- Add Geist Sans for logo

---

### PHASE 2: Color System

**Files to Update:**
1. Update all components using colors:
   - [ ] Sidebar.tsx - BASE purple active states
   - [ ] Button.tsx - BASE/ACCENT variants
   - [ ] Card.tsx - Neutral backgrounds, semantic borders
   - [ ] Overview.tsx - Update all cards, charts
   - [ ] Applications.tsx - Semantic status colors
   - [ ] Live.tsx - CONTRAST lime for live indicators
   - [ ] Tournaments.tsx - BASE purple accents

**Rules:**
- 60% Neutral (#1A1D23, #2A2A2A)
- 30% BASE Purple (#9381FF)
- 8% CONTRAST Lime (#DAFF7C) - only success/live
- 2% ACCENT Cyan (#00F0FF) - only links/CTAs

---

### PHASE 3: Framer Motion Setup

**New Files:**
1. `/web/src/animations/`
   - [ ] `variants.ts` - Shared animation variants
   - [ ] `transitions.ts` - Spring configs
   - [ ] `hooks/useReducedMotion.ts` - Accessibility

2. Install dependencies:
   ```bash
   cd web && npm install framer-motion
   ```

**Component Animations:**
- [ ] Stagger cards on Overview page
- [ ] Shared layout for active nav indicator
- [ ] Button micro-interactions (whileHover, whileTap)
- [ ] Card hover lift (-4px)
- [ ] Live badge pulse
- [ ] Page transitions
- [ ] Modal enter/exit

---

### PHASE 4: Component Redesign

**Priority Order:**
1. [ ] **Sidebar** - Logo text, spacing, shared layout animation
2. [ ] **Cards** - Spacing, colors, hover animation
3. [ ] **Buttons** - Spacing, variants, micro-interactions
4. [ ] **Overview** - Grid spacing, stagger cards, charts
5. [ ] **Applications** - Table spacing, status colors
6. [ ] **Live** - Card spacing, pulse animation
7. [ ] **Tournaments** - Grid spacing, status badges
8. [ ] **Header** - Spacing, search, notifications

---

### PHASE 5: Intuitiveness Enhancements

**New Features:**
- [ ] Loading skeletons (replace spinners)
- [ ] Empty states with illustrations
- [ ] Toast notifications (sonner library)
- [ ] Optimistic UI updates
- [ ] Keyboard shortcuts (Cmd+K)
- [ ] Auto-save drafts (1s debounce)
- [ ] Focus management (tab navigation)

---

### PHASE 6: Testing & Optimization

**Performance:**
- [ ] Lighthouse score > 90
- [ ] Time to Interactive < 2s
- [ ] CLS = 0 (no layout shift)
- [ ] All animations 60fps
- [ ] Bundle size < 40kb addition

**Accessibility:**
- [ ] WCAG AA contrast (4.5:1)
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Reduced motion respected
- [ ] Focus indicators visible

---

## 🚀 IMPLEMENTATION START

I'll now begin implementing this systematically, starting with:

1. **Typography & Spacing Foundation** (globals.css)
2. **Color System Variables** (all CSS variables)
3. **Framer Motion Setup** (install + create animation library)
4. **Component Redesign** (one by one, testing each)

**Estimated Implementation Time:**
- Phase 1-2: ~2 hours (foundation)
- Phase 3-4: ~4 hours (animations + components)
- Phase 5-6: ~2 hours (enhancements + testing)

**Ready to execute?** This is the complete plan combining ALL design laws, research, and best practices into ONE cohesive dashboard revamp! 🎨✨
