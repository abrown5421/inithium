import { createContext, useContext, type ReactNode } from 'react';
import type { ContainerElement, ContentElement } from '@inithium/shared-contracts';

/**
 * Lets a host (the CMS editor's preview) wrap or replace what the renderer draws, e.g. to outline the selected element
 * or show a placeholder for an empty Container. `web` passes none, so content draws as it is.
 */
export type ContentDecorators = {
  /**
   * Gets each element as drawn and returns what to show instead (usually a wrapper around it). An element the site
   * can't draw (a plugin's that isn't installed or is inactive) arrives drawn as null.
   */
  element?: (element: ContentElement, drawn: ReactNode) => ReactNode;
  /** Gets a Container's children as drawn (none, when it's empty) and returns what to show inside it. */
  children?: (container: ContainerElement, drawn: ReactNode) => ReactNode;
};

const ContentDecoratorsContext = createContext<ContentDecorators>({});

export const ContentDecoratorsProvider = ContentDecoratorsContext.Provider;

export const useContentDecorators = (): ContentDecorators => useContext(ContentDecoratorsContext);
