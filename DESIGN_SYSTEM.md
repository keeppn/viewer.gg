# viewer.gg Design System

## Design Philosophy

The viewer.gg design system is built on principles of consistency, clarity, and restraint. We use color purposefully—not decoratively—to create a sophisticated, professional interface that puts content first.

---

## Color System

### Brand Colors (Primary Use Only)

These are our core brand colors. Use them sparingly for brand identity, primary actions, and key highlights.

| Color | Hex | Usage |
|-------|-----|-------|
| **Primary Purple** | `#9381FF` | Primary brand color, main CTAs, active states, primary navigation highlights |
| **Secondary Lime** | `#DAFF7C` | Secondary brand accent, success states, positive highlights |
| **Complementary Cyan** | `#00F0FF` | Tertiary accent, informational highlights, links (sparingly) |

**Design Principle**: Brand colors should appear in ~10-15% of the interface, creating visual interest without overwhelming the user.

---

### Semantic Colors (Context-Specific)

These colors have specific meanings and should only be used in their defined contexts.

| Color | Hex | Usage |
|-------|-----|-------|
| **Success Green** | `#22C55E` | Live indicators, approved status, success messages |
| **Error Red** | `#EF4444` | Rejected status, error states, destructive actions, warnings |
| **Warning Amber** | `#F59E0B` | Caution states, pending actions (use sparingly) |
| **Info Blue** | `#3B82F6` | Informational messages, neutral notifications |

**Design Principle**: Semantic colors communicate status and meaning. Never use red for decoration or green for branding.

---

### Neutral Palette (Foundation)

The neutral palette forms the foundation of our interface. 90% of the UI should use these colors.

| Color | Hex | Usage |
|-------|-----|-------|
| **Background Primary** | `#1F1F1F` | Main background, page base |
| **Background Secondary** | `#2A2A2A` | Card backgrounds, elevated surfaces |
| **Background Tertiary** | `#333333` | Hover states, subtle elevated surfaces |
| **Border Default** | `rgba(255,255,255,0.1)` | Default borders, dividers |
| **Border Hover** | `rgba(255,255,255,0.2)` | Hover state borders |
| **Text Primary** | `#FFFFFF` | Primary text, headings |
| **Text Secondary** | `rgba(255,255,255,0.7)` | Secondary text, descriptions |
| **Text Tertiary** | `rgba(255,255,255,0.5)` | Placeholder text, disabled states |

**Design Principle**: Neutrals create visual hierarchy and rhythm. Use opacity variations of white for subtlety.

---

## Typography System

### Font Families

| Purpose | Font | Weights |
|---------|------|---------|
| **Logo** | Geist Sans | 700 (Bold) |
| **Body & UI** | Inter | 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold) |
| **Monospace/Data** | JetBrains Mono | 400 (Regular), 500 (Medium) |

### Type Scale

```
Display (Logo): 24px / 1.5rem - Geist Sans Bold
H1: 32px / 2rem - Inter Bold
H2: 24px / 1.5rem - Inter Semibold
H3: 20px / 1.25rem - Inter Semibold
H4: 18px / 1.125rem - Inter Medium
Body Large: 16px / 1rem - Inter Regular
Body: 14px / 0.875rem - Inter Regular
Body Small: 12px / 0.75rem - Inter Regular
Caption: 11px / 0.6875rem - Inter Regular
```

**Design Principle**: Inter provides excellent readability across all sizes. Reserve Geist Sans exclusively for the logo.

---

## Component Color Usage Guidelines

### Cards
- Background: `#2A2A2A` (Background Secondary)
- Border: `rgba(255,255,255,0.1)` (Border Default)
- Hover Border: `rgba(147,129,255,0.3)` (Purple tint on brand cards only)
- No gradient borders on every card - reserve for special emphasis only

### Buttons
- **Primary**: Purple background, white text
- **Secondary**: Transparent background, purple border, purple text
- **Success**: Green background, white text (for approve/go-live actions)
- **Danger**: Red background, white text (for delete/reject actions)

### Navigation
- **Active state**: Purple accent (left bar + subtle background)
- **Hover state**: Subtle white overlay (`rgba(255,255,255,0.05)`)
- **Inactive**: White/70% opacity text

### Status Badges
- **Live**: Green background, white text, pulsing animation
- **Approved**: Green background, white text
- **Rejected**: Red background, white text
- **Pending**: Neutral gray background, white text

---

## Removed Colors

The following colors have been **removed** from the design system for consistency:

- ❌ Gold `#FFB800` - Replaced with semantic amber when needed
- ❌ Orange `#fd934e` - No brand justification, creates visual noise
- ❌ Multiple red variants - Consolidated to single semantic red

---

## Animation & Effects

### Principles
- Use subtle animations to guide attention
- Respect `prefers-reduced-motion`
- Animation duration: 150-300ms for micro-interactions
- Reserve glow effects for active/interactive states only

### Approved Effects
- ✅ Subtle scale on hover (1.02x)
- ✅ Fade transitions on state changes
- ✅ Slide transitions on navigation
- ✅ Pulse animation for live indicators
- ❌ Rotating gradient borders (too busy)
- ❌ Constant glow effects (too distracting)

---

## Accessibility Standards

- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Focus indicators: 2px solid cyan outline
- Interactive elements: Minimum 44x44px touch targets
- Semantic HTML: Proper heading hierarchy, ARIA labels

---

## Implementation Checklist

- [ ] Update CSS variables in `globals.css`
- [ ] Update Card component to use neutral palette by default
- [ ] Update Button component with semantic variants
- [ ] Replace logo image with Geist Sans text
- [ ] Update Sidebar brand colors usage
- [ ] Review all pages for color consistency
- [ ] Remove unused color variables
- [ ] Test accessibility contrast ratios

---

## References

Inspired by industry-leading design systems:
- **Stripe**: Restrained use of brand color, neutral-first approach
- **Linear**: Subtle purple accent, clean typography
- **Vercel**: Monochrome base with selective color usage
- **GitHub**: Semantic color system, clear meaning

**Last Updated**: 2024-11-22
