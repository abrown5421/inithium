import { createContext, useContext } from 'react';
import type { PublicPage, SiteSettings, User } from '@inithium/shared-contracts';

export type SiteContextValue = {
  settings: SiteSettings;
  /** Every published page. */
  pages: PublicPage[];
  /** The signed-in user, or null. */
  user: User | null;
};

export const SiteContext = createContext<SiteContextValue | null>(null);

/** The site's settings, published pages and signed-in user, inside SiteShell. */
export function useSite(): SiteContextValue {
  const site = useContext(SiteContext);
  if (!site) throw new Error('useSite() must be used inside SiteShell');
  return site;
}
