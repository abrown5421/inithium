import { createContext, useContext, useMemo, type ComponentType, type ReactNode } from 'react';
import type { PluginElement, PluginElementType } from '@inithium/shared-contracts';

/** What a plugin element's component gets: the element (its props as stored) and its children, already drawn. */
export type ContentElementRendererProps = { element: PluginElement; children?: ReactNode };

/**
 * Draws a plugin's (or libs/client's) content element (decisions 0116, 0118). It lives in the plugin's `shared` layer,
 * so the site and the page builder's preview draw it the same way; `web`'s and the CMS's registries list it.
 */
export type ContentElementRenderer = { type: PluginElementType; component: ComponentType<ContentElementRendererProps> };

const ContentElementRenderersContext = createContext<ReadonlyMap<string, ContentElementRenderer>>(new Map());

/** Gives the content renderer the plugin elements it can draw: the app's registered renderers. */
export function ContentElementRenderersProvider({ renderers, children }: { renderers: readonly ContentElementRenderer[]; children: ReactNode }) {
  const byType = useMemo(() => new Map(renderers.map((renderer) => [renderer.type, renderer])), [renderers]);
  return <ContentElementRenderersContext.Provider value={byType}>{children}</ContentElementRenderersContext.Provider>;
}

/** The renderer for a plugin element's type, if one is registered. */
export const useContentElementRenderer = (type: string): ContentElementRenderer | undefined => useContext(ContentElementRenderersContext).get(type);
