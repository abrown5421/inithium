import { useEffect } from 'react';

/**
 * Shows the site's favicon (decision 0101) in place of the default one in the app's index.html. Without an address
 * (no favicon set, or settings still loading), the default comes back. The default's address and type are kept on the
 * <link> itself, so switching back and forth always restores them.
 */
export function useFavicon(href: string | undefined): void {
  useEffect(() => {
    for (const link of document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]')) {
      if (link.dataset['defaultHref'] === undefined) {
        link.dataset['defaultHref'] = link.getAttribute('href') ?? '';
        link.dataset['defaultType'] = link.getAttribute('type') ?? '';
      }
      if (href) {
        link.setAttribute('href', href);
        // Let the browser read the type from the file: the site's favicon may be ICO, PNG or SVG.
        link.removeAttribute('type');
      } else {
        link.setAttribute('href', link.dataset['defaultHref'] ?? '');
        if (link.dataset['defaultType']) link.setAttribute('type', link.dataset['defaultType']);
      }
    }
  }, [href]);
}
