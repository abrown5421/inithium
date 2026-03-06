import { useEffect, useState } from 'react';
import { type Breakpoint, BREAKPOINTS } from './breakpoints.js';
import { getActiveBreakpoint, isAtLeast } from './screen.utils.js';

export function useBreakpoint(): Breakpoint | null {
  const [breakpoint, setBreakpoint] = useState<Breakpoint | null>(() =>
    getActiveBreakpoint(),
  );

  useEffect(() => {
    const queries = Object.entries(BREAKPOINTS).map(([bp, minWidth]) => {
      const mql = window.matchMedia(`(min-width: ${minWidth}px)`);
      const handler = () => setBreakpoint(getActiveBreakpoint());
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    });

    return () => queries.forEach((unsub) => unsub());
  }, []);

  return breakpoint;
}

export function useIsAtLeast(breakpoint: Breakpoint): boolean {
  const [matches, setMatches] = useState(() => isAtLeast(breakpoint));

  useEffect(() => {
    const mql = window.matchMedia(
      `(min-width: ${BREAKPOINTS[breakpoint]}px)`,
    );
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);

  return matches;
}