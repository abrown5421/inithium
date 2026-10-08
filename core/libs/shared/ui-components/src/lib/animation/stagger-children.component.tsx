import { Children, isValidElement, type ReactNode } from 'react';
import { StaggerContext } from './stagger.context';

/**
 * Gives each direct child element an entrance offset of index × step. With no step, resets the offset to 0,
 * so a parent's stagger never leaks past its direct children.
 */
export function StaggerChildren({ step, children }: { step?: number; children: ReactNode }) {
  if (!step) return <StaggerContext.Provider value={0}>{children}</StaggerContext.Provider>;

  let index = 0;
  return Children.map(children, (child) =>
    isValidElement(child) ? <StaggerContext.Provider value={index++ * step}>{child}</StaggerContext.Provider> : child,
  );
}
