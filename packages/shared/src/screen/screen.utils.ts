import { BREAKPOINTS, type Breakpoint } from './breakpoints.js';

export function getScreenWidth(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth;
}

export function isAtLeast(breakpoint: Breakpoint): boolean {
  return getScreenWidth() >= BREAKPOINTS[breakpoint];
}

export function isBelow(breakpoint: Breakpoint): boolean {
  return getScreenWidth() < BREAKPOINTS[breakpoint];
}

export function isBetween(lower: Breakpoint, upper: Breakpoint): boolean {
  const width = getScreenWidth();
  return width >= BREAKPOINTS[lower] && width < BREAKPOINTS[upper];
}

export function getActiveBreakpoint(): Breakpoint | null {
  const width = getScreenWidth();

  const ascending = Object.entries(BREAKPOINTS)
    .sort(([, a], [, b]) => (a as number) - (b as number)) as [Breakpoint, number][];

  let active: Breakpoint | null = null;

  for (const [bp, minWidth] of ascending) {
    if (width >= minWidth) active = bp;
  }

  return active;
}

export function onBreakpointChange(
  callback: (breakpoint: Breakpoint | null) => void,
): () => void {
  if (typeof window === 'undefined') return () => undefined;

  let previous = getActiveBreakpoint();

  const handler = () => {
    const current = getActiveBreakpoint();
    if (current !== previous) {
      previous = current;
      callback(current);
    }
  };

  window.addEventListener('resize', handler, { passive: true });
  return () => window.removeEventListener('resize', handler);
}

export function watchBreakpoint(
  breakpoint: Breakpoint,
  callback: (isAtLeast: boolean) => void,
): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const query = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);

  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    callback(e.matches);
  };

  handler(query);

  query.addEventListener('change', handler);
  return () => query.removeEventListener('change', handler);
}