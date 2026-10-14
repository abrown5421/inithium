import { describe, expect, it } from 'vitest';
import { navigationAllowed, pageCreateSchema, pagePathSchema, pathFromTitle, pathHasParams } from './pages.schema';

describe('pagePathSchema', () => {
  it.each(['/', '/about', '/about-us/team', '/events/:slug', '/profile/:id'])('accepts %s', (path) => {
    expect(pagePathSchema.safeParse(path).success).toBe(true);
  });

  it.each(['', 'about', '/About', '/about/', '/about us', '//', '/api', '/api/pages', '/cms', '/cms/settings'])('rejects %j', (path) => {
    expect(pagePathSchema.safeParse(path).success).toBe(false);
  });

  it('allows paths that only start like a reserved prefix', () => {
    expect(pagePathSchema.safeParse('/apiary').success).toBe(true);
    expect(pagePathSchema.safeParse('/cmsx').success).toBe(true);
  });
});

describe('pathHasParams', () => {
  it('spots :name segments', () => {
    expect(pathHasParams('/events/:slug')).toBe(true);
    expect(pathHasParams('/events')).toBe(false);
  });
});

describe('navigationAllowed (decision 0080)', () => {
  const menus = (locations: string[]) => ({ locations });

  it('allows any plain page in any menu', () => {
    expect(navigationAllowed({ path: '/about', template: 'content', navigation: menus(['primary-nav', 'primary-footer']) })).toBe(true);
  });

  it('keeps pages with parameters out of menus', () => {
    expect(navigationAllowed({ path: '/events/:slug', template: 'content', navigation: menus(['primary-nav']) })).toBe(false);
    expect(navigationAllowed({ path: '/events/:slug', template: 'content', navigation: menus([]) })).toBe(true);
  });

  it('lets Profile appear only in profile-nav', () => {
    expect(navigationAllowed({ path: '/profile/:id', template: 'profile', navigation: menus(['profile-nav']) })).toBe(true);
    expect(navigationAllowed({ path: '/profile/:id', template: 'profile', navigation: menus(['profile-nav', 'primary-nav']) })).toBe(false);
  });
});

describe('pageCreateSchema', () => {
  it('refuses parameters in a new page’s path', () => {
    expect(pageCreateSchema.safeParse({ title: 'Event', path: '/events/:slug', template: 'content' }).success).toBe(false);
    expect(pageCreateSchema.safeParse({ title: 'Events', path: '/events', template: 'content' }).success).toBe(true);
  });
});

describe('pathFromTitle', () => {
  it.each([
    ['About Us!', '/about-us'],
    ['  Café & Crème  ', '/cafe-creme'],
    ['!!!', '/'],
    ['Ünïcödé Tïtle', '/unicode-title'],
  ])('suggests a path for %j', (title, path) => {
    expect(pathFromTitle(title)).toBe(path);
  });

  it('keeps suggestions to 60 characters without a trailing hyphen', () => {
    const path = pathFromTitle(`${'word '.repeat(30)}`);
    expect(path.length).toBeLessThanOrEqual(61);
    expect(path.endsWith('-')).toBe(false);
    expect(pagePathSchema.safeParse(path).success).toBe(true);
  });
});
