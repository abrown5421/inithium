import type { AnimationDelay, AnimationSpeed } from '@inithium/shared-contracts';

/** animate.css's default duration. */
export const DEFAULT_DURATION_MS = 1000;

const speeds: Record<Exclude<AnimationSpeed, number>, number> = { faster: 500, fast: 800, slow: 2000, slower: 3000 };
const delays: Record<Exclude<AnimationDelay, number>, number> = { '1s': 1000, '2s': 2000, '3s': 3000, '4s': 4000, '5s': 5000 };

export const durationMs = (speed?: AnimationSpeed) =>
  speed === undefined ? DEFAULT_DURATION_MS : typeof speed === 'number' ? speed : speeds[speed];

export const delayMs = (delay?: AnimationDelay) => (delay === undefined ? 0 : typeof delay === 'number' ? delay : delays[delay]);

/** How much of an element must be visible for a `when: 'inView'` entrance to start. */
export const IN_VIEW_THRESHOLD = 0.2;

/**
 * Extra time after an animation should have ended before it's treated as ended anyway. animationend never
 * fires for an element that isn't rendered (e.g. display: none), and sequences like the page shell's must
 * still complete.
 */
export const END_FALLBACK_MS = 150;
