import type { PageAudience, PageNavigation } from '@inithium/shared-contracts';
import { PageModel } from './pages.model';

/** A single-use page that code ships and a seed keeps in the database (decision 0078). */
export type PageSeed = {
  template: string;
  path: string;
  title: string;
  /** The layouts its template allows; the first is the default. */
  layouts: [string, ...string[]];
  audience: PageAudience;
  navigation: PageNavigation;
};

/** Core's pages: Home, Profile, Login, Sign up and Not Found. */
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
    layouts: ['default'],
    audience: 'all',
    navigation: { locations: ['profile-nav'], order: 0 },
  },
  { template: 'login', path: '/login', title: 'Login', layouts: ['bare'], audience: 'signed-out', navigation: { locations: [], order: 0 } },
  { template: 'sign-up', path: '/sign-up', title: 'Sign up', layouts: ['bare'], audience: 'signed-out', navigation: { locations: [], order: 0 } },
  { template: 'not-found', path: '/404', title: 'Page not found', layouts: ['default'], audience: 'all', navigation: { locations: [], order: 0 } },
];

/**
 * Creates each seeded page if it doesn't exist, as a published, protected page. On later runs it only brings the
 * fields its code owns (path and layouts) up to date, and never touches what the CMS edits. Runs on every api start.
 */
export async function seedPages(seeds: PageSeed[]): Promise<void> {
  for (const seed of seeds) {
    const existing = await PageModel.findOne({ template: seed.template, protected: true });
    if (!existing) {
      if (await PageModel.exists({ path: seed.path })) {
        console.warn(`[ seed ] page '${seed.template}' not created: another page already uses ${seed.path}`);
        continue;
      }
      await PageModel.create({ ...seed, layout: seed.layouts[0], status: 'published', protected: true, seo: {} });
      console.log(`[ seed ] created page '${seed.template}' at ${seed.path}`);
      continue;
    }

    existing.path = seed.path;
    existing.layouts = [...seed.layouts];
    if (!seed.layouts.includes(existing.layout)) existing.layout = seed.layouts[0];
    if (existing.isModified()) {
      await existing.save();
      console.log(`[ seed ] updated page '${seed.template}' to match its code`);
    }
  }
}

/** Seeds core's own pages. */
export const seedCorePages = () => seedPages(corePageSeeds);
