import { pathHasParams, type NavGroup, type NavItem, type NavLink, type NavLocation, type PublicPage, type User } from '@inithium/shared-contracts';

export type SiteMenus = {
  primary: NavItem[];
  profile: NavLink[];
  primaryFooter: NavItem[];
  secondaryFooter: NavLink[];
};

/** Whether the visitor may see a page: 'all', or the audience matching their sign-in state (decision 0079). */
export const audienceAllows = (page: PublicPage, signedIn: boolean) =>
  page.audience === 'all' || (page.audience === 'signed-in') === signedIn;

const linkTo = (page: PublicPage, href: string): NavLink => ({
  label: page.navigation.label ?? page.title,
  href,
  ...(page.navigation.icon ? { icon: page.navigation.icon } : {}),
});

/** The pages placed in a menu that the visitor may see, by order (then title). */
function placed(pages: PublicPage[], location: NavLocation, signedIn: boolean) {
  return pages
    .filter((page) => page.navigation.locations.includes(location) && audienceAllows(page, signedIn))
    .sort((a, b) => a.navigation.order - b.navigation.order || a.title.localeCompare(b.title));
}

/** Pages sharing a group become one group, placed where its lowest-ordered page would be (decision 0080). */
function grouped(pages: PublicPage[]): NavItem[] {
  const items: NavItem[] = [];
  const groups = new Map<string, NavGroup>();
  for (const page of pages) {
    if (pathHasParams(page.path)) continue;
    const link = linkTo(page, page.path);
    const name = page.navigation.group;
    if (!name) {
      items.push(link);
      continue;
    }
    let group = groups.get(name);
    if (!group) {
      group = { label: name, children: [] };
      groups.set(name, group);
      items.push(group);
    }
    group.children.push(link);
  }
  return items;
}

const flat = (pages: PublicPage[]) => pages.filter((page) => !pathHasParams(page.path)).map((page) => linkTo(page, page.path));

/**
 * The four menus from the page records (decision 0080). Profile-nav fills ':id' with the signed-in user's id;
 * other pages with parameters never appear in menus.
 */
export function buildMenus(pages: PublicPage[], user: User | null): SiteMenus {
  const signedIn = user !== null;
  const profile = user
    ? placed(pages, 'profile-nav', true).flatMap((page) => {
        const href = page.path.replace(/:id\b/, user.id);
        return pathHasParams(href) ? [] : [linkTo(page, href)];
      })
    : [];
  return {
    primary: grouped(placed(pages, 'primary-nav', signedIn)),
    profile,
    primaryFooter: flat(placed(pages, 'primary-footer', signedIn)),
    secondaryFooter: flat(placed(pages, 'secondary-footer', signedIn)),
  };
}
