# viewer.gg Animation & Intuitiveness Implementation Plan

**Based on Real-World Research: Linear, Vercel, Mintlify, Maxime Heckel**

---

## 📚 RESEARCH SUMMARY

### What I Found from Industry Leaders

**Linear's Design Principles:**
- **50ms interactions** - Everything feels instant
- **Real-time sync** - No loading states where possible
- **Atomic animations** - Small, coordinated movements instead of big flashy effects
- **Spring physics** - Natural, organic motion (not robotic easing)

**Vercel's Dashboard Performance:**
- Reduced First Meaningful Paint by **1.2 seconds**
- Focus on **perceived performance** through progressive loading
- Stagger animations to show content as it loads
- Hardware-accelerated transforms only (transform, opacity)

**Mintlify's Dashboard Redesign (April 2024):**
- Progressive disclosure - Don't show everything at once
- Micro-interactions for immediate feedback
- Design systems inspired by Linear, Vercel, Airbnb
- **Delight without distraction**

**Maxime Heckel's Advanced Patterns:**
- **Propagation** - Parent variants cascade to children
- **Shared layouts** (`layoutId`) - Seamless element morphing
- **Orchestration** - `staggerChildren`, `delayChildren`
- **Exit animations** - Elements leave gracefully

---

## 🎯 ANIMATION STRATEGY

### Guiding Principles

```
1. PURPOSEFUL - Every animation has a reason (feedback, guidance, delight)
2. PERFORMANT - 60fps, hardware-accelerated, <32kb bundle
3. SUBTLE - Enhance, don't distract (200-400ms max)
4. SPRING-BASED - Organic, natural motion (not linear/ease)
5. ACCESSIBLE - Respect prefers-reduced-motion
```

### Performance Targets

```
✅ First Contentful Paint: <1s
✅ Time to Interactive: <2s
✅ Animation frame rate: 60fps
✅ Bundle size impact: <40kb (Framer Motion ~32kb gzipped)
✅ Layout shift: 0 (prevent CLS)
```

---

## 🎨 SPECIFIC PATTERNS TO IMPLEMENT

### 1. **Stagger Cards on Page Load** (Vercel-style)

**Where:** Overview page, Tournament grids, Application lists

**Code Pattern:**
```typescript
// Container variant
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,  // 70ms between each child
      delayChildren: 0.1      // Wait 100ms before starting
    }
  }
};

// Child variant
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

// Usage
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
  className="grid grid-cols-3 gap-32"
>
  {cards.map((card) => (
    <motion.div key={card.id} variants={cardVariants}>
      <Card {...card} />
    </motion.div>
  ))}
</motion.div>
```

**Why:** Progressive disclosure, shows content as it loads, feels responsive

---

### 2. **Shared Layout Transitions** (Linear-style)

**Where:** Navigation active indicator, Tab switching, Modal expansion

**Code Pattern:**
```typescript
// Navigation active indicator that smoothly moves
const NavItem = ({ isActive, ...props }) => (
  <Link {...props}>
    <div className="relative">
      {children}
      {isActive && (
        <motion.div
          layoutId="activeNav"  // 🔑 Key: Same ID morphs between positions
          className="absolute left-0 top-0 h-full w-1 bg-purple"
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 30
          }}
        />
      )}
    </div>
  </Link>
);

// Modal expansion (card → full screen)
<AnimatePresence>
  {selectedCard && (
    <motion.div
      layoutId={`card-${selectedCard.id}`}  // Morphs from card position
      className="fixed inset-0 z-50"
    >
      <ModalContent card={selectedCard} />
    </motion.div>
  )}
</AnimatePresence>
```

**Why:** Provides visual continuity, users understand spatial relationships

---

### 3. **Micro-Interactions** (Button, Card, Input)

**Where:** All interactive elements

**Code Pattern:**
```typescript
// Button with haptic-like feedback
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  {children}
</motion.button>

// Card with lift on hover
<motion.div
  whileHover={{
    y: -4,
    transition: { duration: 0.2 }
  }}
  className="card"
>
  {content}
</motion.div>

// Input focus with spring
<motion.input
  whileFocus={{
    scale: 1.02,
    boxShadow: "0 0 0 3px rgba(147, 129, 255, 0.2)"
  }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
/>
```

**Why:** Immediate feedback, makes interface feel responsive and alive

---

### 4. **Live Badge Pulse** (Continuous subtle animation)

**Where:** Live streaming indicators

**Code Pattern:**
```typescript
<motion.div
  className="live-badge"
  animate={{
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1]
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  <motion.div
    className="live-dot"
    animate={{
      boxShadow: [
        "0 0 0 0 rgba(34, 197, 94, 0.7)",
        "0 0 0 8px rgba(34, 197, 94, 0)",
      ]
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity
    }}
  />
  LIVE
</motion.div>
```

**Why:** Draws attention without being annoying, indicates real-time status

---

### 5. **Page Transitions** (Next.js App Router)

**Where:** Between dashboard pages

**Code Pattern:**
```typescript
// app/dashboard/layout.tsx
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 }
  }
};

export default function Layout({ children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}  // Key changes trigger animation
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

**Why:** Spatial awareness, shows direction of navigation

---

### 6. **Scroll-Triggered Animations**

**Where:** Long pages (Analytics, Reports)

**Code Pattern:**
```typescript
import { useInView } from 'framer-motion';

const ChartSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Chart />
    </motion.div>
  );
};
```

**Why:** Progressive disclosure, performance (only animate visible content)

---

### 7. **Status Change Animations**

**Where:** Application approval/rejection, Tournament status

**Code Pattern:**
```typescript
// Smooth color/state transitions
<AnimatePresence mode="wait">
  <motion.span
    key={status}  // Re-mount on status change
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.2 }}
    className={getStatusClassName(status)}
  >
    {status}
  </motion.span>
</AnimatePresence>

// Number counter animation (for stats)
<motion.span
  key={value}
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  {value.toLocaleString()}
</motion.span>
```

**Why:** Draws attention to important changes, provides feedback

---

### 8. **Loading Skeletons** (Better than spinners)

**Where:** Data fetching states

**Code Pattern:**
```typescript
const Skeleton = () => (
  <motion.div
    className="bg-white/5 rounded-lg h-20"
    animate={{
      opacity: [0.5, 0.8, 0.5]
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

// Replace with real content
<AnimatePresence mode="wait">
  {loading ? (
    <motion.div key="skeleton" exit={{ opacity: 0 }}>
      <Skeleton />
    </motion.div>
  ) : (
    <motion.div
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <RealContent />
    </motion.div>
  )}
</AnimatePresence>
```

**Why:** Perceived performance, shows progress without blocking

---

### 9. **Drag & Reorder** (Advanced)

**Where:** Tournament priority sorting, Form field reordering

**Code Pattern:**
```typescript
import { Reorder } from 'framer-motion';

const [items, setItems] = useState(initialItems);

<Reorder.Group values={items} onReorder={setItems}>
  {items.map((item) => (
    <Reorder.Item
      key={item.id}
      value={item}
      whileDrag={{ scale: 1.05, zIndex: 1 }}
    >
      <TournamentCard {...item} />
    </Reorder.Item>
  ))}
</Reorder.Group>
```

**Why:** Intuitive reordering, direct manipulation feels powerful

---

### 10. **Gesture Recognition** (Advanced interactions)

**Where:** Swipe to delete, Pinch to zoom (mobile)

**Code Pattern:**
```typescript
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  onDragEnd={(e, { offset, velocity }) => {
    if (offset.x > 100) {
      // Swipe right action
    } else if (offset.x < -100) {
      // Swipe left to delete
      handleDelete();
    }
  }}
>
  {content}
</motion.div>
```

**Why:** Mobile-first interactions, natural gestures

---

## 🏗️ IMPLEMENTATION ARCHITECTURE

### File Structure

```
web/src/
├── animations/
│   ├── variants.ts          # Reusable animation variants
│   ├── transitions.ts       # Spring configs, timing functions
│   ├── hooks/
│   │   ├── useStagger.ts    # Custom stagger hook
│   │   ├── useScrollReveal.ts
│   │   └── useReducedMotion.ts
│   └── components/
│       ├── AnimatedCard.tsx
│       ├── AnimatedButton.tsx
│       └── PageTransition.tsx
├── components/
│   └── ... (existing components, now enhanced)
```

### Shared Variants Library (`variants.ts`)

```typescript
// Centralized animation variants for consistency
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 }
  }
};

export const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 17 }
  }
};

export const slideIn = (direction: 'left' | 'right' | 'up' | 'down') => {
  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const value = direction === 'left' || direction === 'up' ? -20 : 20;

  return {
    hidden: { [axis]: value, opacity: 0 },
    visible: {
      [axis]: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 260, damping: 20 }
    }
  };
};
```

### Spring Configuration (`transitions.ts`)

```typescript
// Based on iOS physics
export const springConfigs = {
  // Snappy (buttons, micro-interactions)
  snappy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 17
  },

  // Smooth (cards, modals)
  smooth: {
    type: "spring" as const,
    stiffness: 300,
    damping: 24
  },

  // Gentle (page transitions)
  gentle: {
    type: "spring" as const,
    stiffness: 260,
    damping: 20
  },

  // Bouncy (playful interactions)
  bouncy: {
    type: "spring" as const,
    stiffness: 380,
    damping: 12
  }
};
```

### Reduced Motion Hook

```typescript
import { useEffect, useState } from 'react';

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

// Usage in components
const MyComponent = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { scale: [1, 1.1, 1] }}
    >
      Content
    </motion.div>
  );
};
```

---

## 🎭 INTUITIVENESS ENHANCEMENTS

Beyond animations, here's how to make the dashboard MORE intuitive:

### 1. **Visual Hierarchy** (Golden Ratio Typography)

```typescript
// Already planned in REDESIGN_RESEARCH.md
// H2 (26px) = Body (16px) × 1.618
// Creates effortless scanning and comprehension
```

### 2. **Progressive Disclosure**

- Don't show everything at once
- Collapse advanced options behind "Show more"
- Use modals for complex forms (not inline)
- Breadcrumbs for navigation context

### 3. **Immediate Feedback**

```typescript
// Toast notifications with animation
import { toast } from 'sonner';  // Lightweight toast library

const handleApprove = async (id: number) => {
  // Optimistic UI update (instant feedback)
  updateLocalState(id, 'Approved');

  try {
    await api.approve(id);
    toast.success('Application approved', {
      duration: 3000,
      // Custom animation
      className: 'toast-success'
    });
  } catch (error) {
    // Rollback on error
    updateLocalState(id, 'Pending');
    toast.error('Failed to approve');
  }
};
```

### 4. **Keyboard Navigation**

```typescript
// Cmd+K command palette (like Linear)
import { useEffect } from 'react';

const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K - Open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
      }

      // Cmd/Ctrl + / - Show shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        showShortcutsModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
```

### 5. **Smart Defaults & Auto-Save**

```typescript
// Auto-save form (like Notion)
import { useDebounce } from '@/hooks/useDebounce';

const TournamentForm = () => {
  const [formData, setFormData] = useState(initial);
  const debouncedData = useDebounce(formData, 1000);  // 1s delay

  useEffect(() => {
    // Auto-save after 1 second of no changes
    if (debouncedData) {
      saveDraft(debouncedData);
      toast.success('Draft saved', { duration: 1000 });
    }
  }, [debouncedData]);
};
```

### 6. **Empty States** (With guidance)

```typescript
const EmptyState = ({ onAction }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-64"
  >
    <IllustrationIcon />
    <h3>No tournaments yet</h3>
    <p>Create your first tournament to get started</p>
    <Button onClick={onAction}>Create Tournament</Button>
  </motion.div>
);
```

### 7. **Loading States** (Skeleton > Spinner)

Always use skeletons instead of spinners - shows structure, reduces perceived wait time.

---

## 📊 PERFORMANCE OPTIMIZATIONS

### 1. **Lazy Load Framer Motion**

```typescript
// Only load on interactive elements
import dynamic from 'next/dynamic';

const MotionDiv = dynamic(() =>
  import('framer-motion').then(mod => mod.motion.div),
  { ssr: false }  // Don't run animations on server
);
```

### 2. **UseCallback for Animation Functions**

```typescript
const handleHoverStart = useCallback(() => {
  // Prevent re-creation on every render
}, []);

<motion.div onHoverStart={handleHoverStart} />
```

### 3. **Will-Change for Heavy Animations**

```css
/* Add to elements that will animate frequently */
.animated-card {
  will-change: transform, opacity;
}

/* Remove after animation completes to free memory */
```

### 4. **Avoid Animating Layout Properties**

```typescript
// ❌ BAD - Causes reflow
animate={{ width: 200, height: 300 }}

// ✅ GOOD - Hardware accelerated
animate={{ scale: 1.2, opacity: 1 }}
```

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Core Foundations (Week 1)
1. ✅ Set up Framer Motion + types
2. ✅ Create shared variants library
3. ✅ Create spring configs
4. ✅ Implement reduced motion hook
5. ✅ Update Button with micro-interactions
6. ✅ Update Card with hover lift

### Phase 2: Navigation & Transitions (Week 1)
7. ✅ Shared layout for active nav indicator
8. ✅ Page transitions
9. ✅ Stagger animations on Overview page
10. ✅ Modal enter/exit animations

### Phase 3: Status & Feedback (Week 2)
11. ✅ Live badge pulse animation
12. ✅ Status change animations
13. ✅ Toast notifications
14. ✅ Loading skeletons

### Phase 4: Advanced Interactions (Week 2)
15. ✅ Scroll-triggered reveals
16. ✅ Drag-to-reorder (optional)
17. ✅ Keyboard shortcuts
18. ✅ Command palette (optional)

---

## ✅ TESTING CHECKLIST

- [ ] All animations run at 60fps (Chrome DevTools Performance)
- [ ] Reduced motion preference is respected
- [ ] No layout shift (CLS = 0)
- [ ] Animations work on mobile (touch gestures)
- [ ] Bundle size impact < 40kb
- [ ] Time to Interactive < 2s
- [ ] Animations don't block interactions
- [ ] Works with React 18 concurrent mode

---

## 🎯 SUCCESS METRICS

**Before (Current State):**
- Static interface, no feedback
- Sudden state changes (jarring)
- No spatial awareness (where did that go?)
- Spinners for loading (blocks perception)

**After (Target State):**
- Responsive micro-interactions (< 50ms perceived)
- Smooth state transitions (spring physics)
- Clear visual continuity (shared layouts)
- Progressive loading (skeletons + stagger)
- Keyboard-first navigation
- Delightful without distraction

---

**Ready to implement this systematically!** 🚀
