/**
 * VIEWER.GG ANIMATION VARIANTS
 * Based on research from Linear, Vercel, and Maxime Heckel
 * Follows iOS physics: snappy (400/17), smooth (300/24)
 */

import { Variants } from 'framer-motion';

/**
 * STAGGER CONTAINER
 * Progressive reveal for lists and grids
 * 70ms delay between children (Linear standard)
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07, // 70ms between each child
      delayChildren: 0.1,    // 100ms initial delay
    },
  },
};

/**
 * FADE IN UP
 * Smooth entrance from below
 * Used for cards, sections, modals
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

/**
 * SCALE FADE
 * Subtle scale + fade for cards
 * Creates depth perception
 */
export const scaleFade: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 17, // iOS snappy physics
    },
  },
};

/**
 * SLIDE IN FROM RIGHT
 * Sidebar, drawer, modal entries
 */
export const slideInRight: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * HOVER LIFT
 * Card hover interaction
 * -4px lift (half of 8pt grid)
 */
export const hoverLift: Variants = {
  rest: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 17,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: 'spring' as const,
      stiffness: 600,
      damping: 20,
    },
  },
};

/**
 * CONTINUOUS PULSE
 * For LIVE indicators
 * Infinite loop, gentle breathing
 */
export const continuousPulse: Variants = {
  pulse: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

/**
 * SHIMMER LOADING
 * Skeleton loader effect
 */
export const shimmer: Variants = {
  loading: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear' as const,
    },
  },
};

/**
 * ACCORDION EXPAND
 * For expandable sections
 */
export const accordionExpand: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: 0.2,
      },
      opacity: {
        duration: 0.15,
      },
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
      opacity: {
        duration: 0.2,
        delay: 0.05,
      },
    },
  },
};

/**
 * BADGE NOTIFICATION
 * Attention-grabbing entrance
 */
export const badgeNotification: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 15,
    },
  },
};

/**
 * PAGE TRANSITION
 * Smooth page-to-page navigation
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as const, // Custom easing
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
    },
  },
};
