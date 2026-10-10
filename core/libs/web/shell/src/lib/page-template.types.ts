import type { ComponentType } from 'react';
import type { PublicPage } from '@inithium/shared-contracts';

/** What a template's component receives: its page record and the path's parameters (e.g. `{ id }`). */
export type PageTemplateProps = {
  page: PublicPage;
  params: Readonly<Record<string, string>>;
};

/**
 * Code that draws page records with its key (decision 0078). Core registers its own; plugins and `libs/client/`
 * register theirs through the web registry, where a later template with the same key replaces an earlier one.
 */
export type PageTemplate = {
  /** Matches `template` on page records, e.g. 'home'. */
  key: string;
  component: ComponentType<PageTemplateProps>;
  /** One page (seeded, like Home) or many (created in the CMS). */
  singleUse: boolean;
  /** The layouts it allows; the first is the default. Kept in step with its seed's `layouts`. */
  layouts: readonly [string, ...string[]];
};
