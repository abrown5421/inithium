import { useLayoutEffect, type RefObject } from 'react';

/**
 * Publishes where a text field's text starts as --ui-input-text-x on its outer element, so a resting floating
 * label sits after a start adornment (decisions 0055 and 0062). Re-measures when the adornment resizes.
 * `getRoot` must be stable; `active` is false while the field isn't mounted.
 */
export function useTextStart(
  getRoot: () => HTMLElement | null,
  text: RefObject<HTMLElement | null>,
  start: RefObject<HTMLElement | null>,
  active: boolean,
  hasStart: boolean,
) {
  useLayoutEffect(() => {
    const root = getRoot();
    const element = text.current;
    if (!active || !root || !element) return;
    const update = () => root.style.setProperty('--ui-input-text-x', `${element.offsetLeft}px`);
    update();
    const observer = new ResizeObserver(update);
    if (start.current) observer.observe(start.current);
    return () => observer.disconnect();
  }, [getRoot, text, start, active, hasStart]);
}
