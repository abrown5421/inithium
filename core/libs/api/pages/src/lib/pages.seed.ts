import { loadEnv } from '@inithium/api-config';
import type { ContentDocument, PageAudience, PageNavigation, PageSeo } from '@inithium/shared-contracts';
import { PageModel } from './pages.model';
import { privacyPolicyContent } from './privacy-policy.seed';

/** A page that code ships and a seed keeps in the database (decisions 0078, 0097). */
export type PageSeed = {
  /**
   * Identifies the seeded page on later runs. Pages from a single-use template are found by their template; pages
   * from a reusable one (e.g. a content page) need their own key, since many pages share the template.
   */
  seedKey?: string;
  template: string;
  path: string;
  title: string;
  /** The layouts its template allows; the first is the default. */
  layouts: [string, ...string[]];
  audience: PageAudience;
  navigation: PageNavigation;
  seo?: PageSeo;
  /** A content page's starting blocks, written once when the page is created and published as they are. */
  content?: () => ContentDocument;
};

/** Core's pages: Home, Profile, Login, Sign up, Not Found, and the privacy policy (a content page). */
export const corePageSeeds: PageSeed[] = [
  {
    template: 'home',
    path: '/',
    title: 'Home',
    layouts: ['default'],
    audience: 'all',
    navigation: { locations: ['primary-nav', 'primary-footer'], order: 0 },
  },
  {
    template: 'profile',
    path: '/profile/:id',
    title: 'Profile',
    layouts: ['full-width'],
    audience: 'all',
    navigation: { locations: ['profile-nav'], order: 0 },
  },
  { template: 'login', path: '/login', title: 'Login', layouts: ['bare'], audience: 'signed-out', navigation: { locations: [], order: 0 } },
  { template: 'sign-up', path: '/sign-up', title: 'Sign up', layouts: ['bare'], audience: 'signed-out', navigation: { locations: [], order: 0 } },
  { template: 'not-found', path: '/404', title: 'Page not found', layouts: ['default'], audience: 'all', navigation: { locations: [], order: 0 } },
  {
    seedKey: 'privacy-policy',
    template: 'content',
    path: '/privacy-policy',
    title: 'Privacy policy',
    layouts: ['full-width', 'default', 'bare'],
    audience: 'all',
    navigation: { locations: ['secondary-footer'], order: 0 },
    seo: { description: 'What this site collects when you visit or create an account, the cookies it uses, and your choices.' },
    content: () => {
      const env = loadEnv();
      return privacyPolicyContent({ accessMinutes: env.JWT_ACCESS_TTL_MINUTES, refreshDays: env.JWT_REFRESH_TTL_DAYS, today: new Date() });
    },
  },
];

/**
 * Creates each seeded page if it doesn't exist, as a published, protected page; a content page starts with its seed's
 * blocks, published. On later runs it only brings the fields its code owns (path and layouts) up to date, and never
 * touches what the CMS edits, content included. Runs on every api start.
 */
export async function seedPages(seeds: PageSeed[]): Promise<void> {
  for (const seed of seeds) {
    const name = seed.seedKey ?? seed.template;
    const existing = await PageModel.findOne(seed.seedKey ? { seedKey: seed.seedKey } : { template: seed.template, protected: true });
    if (!existing) {
      if (await PageModel.exists({ path: seed.path })) {
        // Never take over a page someone made: they can move or delete it, and the seed runs on the next start.
        console.warn(`[ seed ] page '${name}' not created: another page already uses ${seed.path}`);
        continue;
      }
      const { content, seo, ...fields } = seed;
      const blocks = content?.();
      await PageModel.create({
        ...fields,
        layout: seed.layouts[0],
        status: 'published',
        protected: true,
        seo: seo ?? {},
        ...(blocks ? { content: { draft: blocks, published: blocks, publishedAt: new Date().toISOString() } } : {}),
      });
      console.log(`[ seed ] created page '${name}' at ${seed.path}`);
      continue;
    }

    existing.path = seed.path;
    existing.layouts = [...seed.layouts];
    if (!seed.layouts.includes(existing.layout)) existing.layout = seed.layouts[0];
    if (existing.isModified()) {
      await existing.save();
      console.log(`[ seed ] updated page '${name}' to match its code`);
    }
  }
}

/** Seeds core's own pages. */
export const seedCorePages = () => seedPages(corePageSeeds);
