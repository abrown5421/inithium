import { createContext, useContext, type ReactNode } from 'react';
import type { ContentBlock, ContentColumn, ContentSection } from '@inithium/shared-contracts';

/**
 * Lets a host (the CMS editor's preview) wrap or replace what the renderer draws, e.g. to outline the selected block
 * or edit rich text in place. `web` passes none, so content draws as it is.
 */
export type ContentDecorators = {
  /** Gets each section as drawn and returns what to show instead (usually a wrapper around it). */
  section?: (section: ContentSection, drawn: ReactNode) => ReactNode;
  /** Gets each column's blocks as drawn (nothing, for an empty column) and returns what to show inside the column. */
  column?: (column: ContentColumn, section: ContentSection, drawn: ReactNode) => ReactNode;
  /** Gets each block's body as drawn and returns what to show instead. */
  block?: (block: ContentBlock, drawn: ReactNode) => ReactNode;
};

const ContentDecoratorsContext = createContext<ContentDecorators>({});

export const ContentDecoratorsProvider = ContentDecoratorsContext.Provider;

export const useContentDecorators = (): ContentDecorators => useContext(ContentDecoratorsContext);
