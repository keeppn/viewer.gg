/**
 * VIEWER.GG SPRING TRANSITIONS
 * iOS-inspired physics configurations
 * Based on research from Linear and Apple HIG
 */

import { Transition } from 'framer-motion';

/**
 * SNAPPY
 * iOS-style instant feedback
 * Use for: Buttons, toggles, immediate interactions
 * Physics: High stiffness (400), low damping (17)
 */
export const snappy: Transition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 17,
  mass: 1,
};

/**
 * SMOOTH
 * Balanced, professional motion
 * Use for: Cards, modals, page transitions
 * Physics: Medium stiffness (300), medium damping (24)
 */
export const smooth: Transition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 24,
  mass: 1,
};

/**
 * GENTLE
 * Soft, elegant movement
 * Use for: Large panels, drawers, overlays
 * Physics: Lower stiffness (260), higher damping (20)
 */
export const gentle: Transition = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 20,
  mass: 0.8,
};

/**
 * BOUNCY
 * Playful, attention-grabbing
 * Use for: Notifications, badges, success states
 * Physics: High stiffness (500), low damping (15)
 */
export const bouncy: Transition = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 15,
  mass: 1,
};

/**
 * SLOW
 * Deliberate, heavy elements
 * Use for: Large images, full-screen transitions
 * Physics: Low stiffness (200), high damping (25)
 */
export const slow: Transition = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 25,
  mass: 1.2,
};

/**
 * INSTANT
 * No spring, just ease
 * Use for: Opacity fades, color changes
 */
export const instant: Transition = {
  duration: 0.15,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

/**
 * STAGGER CONFIG
 * Timing for staggered children
 */
export const staggerConfig = {
  fast: 0.05,    // 50ms between children
  normal: 0.07,  // 70ms (Linear standard)
  slow: 0.1,     // 100ms between children
};

/**
 * DURATION PRESETS
 * For non-spring animations
 */
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8,
};

/**
 * EASING CURVES
 * Custom bezier curves
 */
export const easings = {
  // Apple's signature easing
  apple: [0.4, 0.0, 0.2, 1] as const,

  // Smooth acceleration
  easeOut: [0.0, 0.0, 0.2, 1] as const,

  // Smooth deceleration
  easeIn: [0.4, 0.0, 1, 1] as const,

  // Symmetric ease
  easeInOut: [0.4, 0.0, 0.6, 1] as const,

  // Snappy exit
  snapOut: [0.4, 0.0, 0.0, 1] as const,
} as const;
