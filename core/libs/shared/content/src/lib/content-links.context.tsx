import { createContext, useContext, type MouseEvent, type ReactNode } from 'react';
import type { ContentLink } from '@inithium/shared-contracts';

export type ContentLinks = {
  /** A page's path by its id, or undefined when it isn't on the site (e.g. unpublished or deleted). */
  pagePath: (pageId: string) => string | undefined;
  /** Goes to a path on the site, through the app's router. */
  onNavigate: (path: string) => void;
  /** A preview (the CMS editor): links and buttons show as usual but go nowhere when clicked. */
  preview?: boolean;
};

const ContentLinksContext = createContext<ContentLinks>({ pagePath: () => undefined, onNavigate: () => undefined });

/** Hands the content renderer the site's page paths and router (decision 0093). */
export function ContentLinksProvider({ links, children }: { links: ContentLinks; children?: ReactNode }) {
  return <ContentLinksContext.Provider value={links}>{children}</ContentLinksContext.Provider>;
}

/** What a content link points at, ready for an anchor or a button. */
export type ResolvedLink = {
  /** The address, or undefined when the link's page isn't on the site. */
  href: string | undefined;
  /** Opens in a new tab. */
  newTab: boolean;
  /** Follows the link: page links through the router, others as a normal navigation. */
  follow: () => void;
  /** For an anchor: plain left clicks on page links go through the router instead of reloading. */
  onClick: (event: MouseEvent) => void;
};

/** Resolves content links against the site's pages. */
export function useContentLinks(): (link: ContentLink) => ResolvedLink {
  const { pagePath, onNavigate, preview } = useContext(ContentLinksContext);
  return (link) => {
    if (preview) {
      const href = link.type === 'page' ? pagePath(link.pageId) : link.href;
      return { href, newTab: link.type === 'url' && Boolean(link.newTab), follow: () => undefined, onClick: (event) => event.preventDefault() };
    }
    if (link.type === 'page') {
      const href = pagePath(link.pageId);
      return {
        href,
        newTab: false,
        follow: () => (href ? onNavigate(href) : undefined),
        onClick: (event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          if (href) onNavigate(href);
        },
      };
    }
    const newTab = Boolean(link.newTab);
    return {
      href: link.href,
      newTab,
      follow: () => (newTab ? window.open(link.href, '_blank', 'noopener,noreferrer') : window.location.assign(link.href)),
      onClick: () => undefined,
    };
  };
}
