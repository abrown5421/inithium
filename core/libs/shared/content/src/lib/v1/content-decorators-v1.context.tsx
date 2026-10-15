import { createContext, useContext, type ReactNode } from 'react';
import type { ContentBlock, ContentColumn, ContentSection } from '@inithium/shared-contracts';

// Version 1 content (decision 0093): kept for the CMS editor's preview until the editor edits version 2 (0116).

/**
 * Lets a host (the CMS editor's preview) wrap or replace what the renderer draws, e.g. to outline the selected block
 * or edit rich text in place. `web` passes none, so content draws as it is.
 */
export type ContentDecoratorsV1 = {
  /** Gets each section as drawn and returns what to show instead (usually a wrapper around it). */
  section?: (section: ContentSection, drawn: ReactNode) => ReactNode;
  /** Gets each column's blocks as drawn (nothing, for an empty column) and returns what to show inside the column. */
  column?: (column: ContentColumn, section: ContentSection, drawn: ReactNode) => ReactNode;
  /** Gets each block's body as drawn and returns what to show instead. */
  block?: (block: ContentBlock, drawn: ReactNode) => ReactNode;
};

const ContentDecoratorsV1Context = createContext<ContentDecoratorsV1>({});

export const ContentDecoratorsV1Provider = ContentDecoratorsV1Context.Provider;

export const useContentDecoratorsV1 = (): ContentDecoratorsV1 => useContext(ContentDecoratorsV1Context);
