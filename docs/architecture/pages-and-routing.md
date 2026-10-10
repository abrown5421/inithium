---
title: Pages and routing
description: How web pages are stored as records, drawn by code templates, routed, restricted, animated and placed in menus.
scope: core
tags: [pages, routing, navigation, cms, plugins]
order: 5
decisions: ["0078", "0079", "0080", "0081", "0082"]
---

# Pages and routing

> **Being built.** This page describes the agreed design. The pieces arrive in phases; [what exists today](#build-status) is listed at the end.

`web`'s pages are **database records drawn by code**. The CMS manages the records: titles, appearance, who can see a page, which menus it's in, and SEO. Core, plugins and client libs supply the code that draws them as **templates**. Complex pages such as a catalogue, a checkout or a profile are written in TSX. Clients can't create pages from nothing yet; a block-based "content page" template for simple marketing pages comes later ([0078](../decisions/0078-store-pages-as-records-rendered-by-code-templates.md)).

The CMS is a separate app with its own hand-written routes. Nothing on this page applies to it.

## Page records

Every page is a record in the `pages` collection, with Zod contracts in `@inithium/shared-contracts`:

| Group | Fields |
| --- | --- |
| General | `title`; `path` (unique, may have parameters, e.g. `/events/:slug`); `status` (`published` or `unpublished`); `template` (a key); `layout` (one the template allows) |
| Appearance | `bgColor` and `textColor` (default surface 50 and surface 950); `animation` `{ entrance, exit }` (default a fast fadeIn and fadeOut) |
| Access | `audience`: `all`, `signed-out` or `signed-in` |
| Navigation | menu locations, label, order, icon and group ([below](#menus)) |
| SEO | `seo` `{ title?, description? }` |
| System | `protected`: can't be deleted; path and template are fixed |

Core's own pages are seeded on first start: Home (`/`), Profile (`/profile/:id`), Login (`/login`), Sign up (`/sign-up`) and Not Found. All are protected. Plugins seed their pages on install, and their unseed removes them on eject.

## Templates

A template is code registered in `web` under a key. It declares:

- its component;
- whether it's **single-use** (one page, like Home) or **reusable** (many pages, like a future content page);
- which layouts it allows (the first is the default);
- optionally, **defaults** for its pages' background, text colour and animation. A page record's own values (set in the CMS) win; without either, pages use surface 50, surface 950 and a fast fadeIn and fadeOut. Core's Login and Sign up default to a surface 950 background with `fadeInUp` and `fadeOutDown`, so their card rises from the dark backdrop and sinks away.

Core registers its templates directly. Plugins and client libs register theirs through the web registry. A client can replace a core page's look by registering its own component under the core key (e.g. `home`) from `libs/client/`, without touching core.

In the CMS, "New page" offers only reusable templates. Until one exists, pages can be edited but not created.

### Writing a template

Templates live in `@inithium/web-shell`'s contract (`PageTemplate`), and core's are in `@inithium/web-pages`:

```tsx
import { usePageReady, useSite, type PageTemplate, type PageTemplateProps } from '@inithium/web-shell';

function ClassesPage({ page, params }: PageTemplateProps) {
  const { data, isLoading } = useGetClassesQuery();
  usePageReady(!isLoading);          // hold the entrance (behind a Loader) until the data has arrived
  const { settings, user } = useSite(); // site settings, published pages and the signed-in user
  return <Text as="h1">{page.title}</Text>;
}

export const classesTemplate: PageTemplate = {
  key: 'classes-list',
  component: ClassesPage,
  singleUse: true,
  layouts: ['default'],
  defaults: { animation: { entrance: { name: 'fadeInUp', speed: 'fast' } } }, // optional
};
```

- **Props:** a template gets its `page` record (`PublicPage`) and the path's `params` (e.g. `{ id }` for `/profile/:id`).
- **Heading:** give it one `h1`; focus moves there when it enters.
- **Seeding:** its seed (`seedPages()` in `@inithium/api-pages`) must list the same layouts.
- **Registering:** `apps/web/src/app/plugins.registry.ts` (owned by the install/eject tooling; core ships it empty) holds plugin and `libs/client/` templates. They come after core's, so a template there replaces core's with the same key.

## Layouts

Layouts are frames from the UI library's layouts layer that a page sits in:

| Layout | Shape | Status |
| --- | --- | --- |
| `default` | Navbar, the page, Footer: [DefaultLayout](../ui-library/layouts/default-layout.md) | Built |
| `bare` | Navbar and a centred card, no Footer, for sign-in pages: [BareLayout](../ui-library/layouts/bare-layout.md) | Built |
| `full-width` | Content edge to edge, e.g. a calendar | Planned |
| `collection-list` | A heading, search and filters, and a paginated grid of cards | Planned |
| `collection-item` | A full-width PolyBanner under the Navbar, breadcrumbs, a title with badges, then content | Planned |
| `profile` | A full-width banner, an overlapping avatar, an identity sidebar and tabbed content | Planned |

## Routing in `web`

- **Startup:** `web` loads its site bundle once (site settings and the published page records), with a Loader until it arrives, and builds its routes from the records ([0079](../decisions/0079-route-web-pages-through-a-shell-with-audiences-and-sequential-transitions.md)). CMS changes reach visitors on their next full load.
- **Not Found:** unknown paths and unpublished pages render the Not Found page.
- **Audiences:**
  - A signed-out visitor on a `signed-in` page is sent to `/login` with an alert ("Sign in to view that page"), then back after signing in.
  - A signed-in user on a `signed-out` page (Login, Sign up) is sent to Home, without a message.
- **Transitions:** the Navbar stays put; everything under it animates. The current page plays its exit, then the next page plays its entrance. Clicking again during an exit doesn't cut it short: when the exit ends, the latest destination enters.
- **Backdrop:** pages sit on their own background over a surface 950 backdrop. The page area clips anything sliding past its edges (`overflow: clip`, which keeps sticky content working) (dark in light mode, light in dark mode), so each exit fades into it and each entrance comes out of it. The startup screen uses it too.
- **Data:** a page that loads data calls `usePageReady(ready)`. The next page starts loading during the exit, and if it isn't ready when the exit ends, a Loader shows until it is.
- **Footer below the fold:** the Navbar and the content area together are at least the screen's height, so the Footer starts just below the fold and longer pages push it further down ([0084](../decisions/0084-start-the-footer-just-below-the-fold.md)). The shell publishes the Navbar's height as `--ui-navbar-height` for layouts to use.
- **After each change:** the window scrolls to the top, focus moves to the new page's heading, and the document title updates. Back and forward restore scroll positions.

## Menus

Each page record says which menus it appears in ([0080](../decisions/0080-build-menus-from-page-navigation-settings.md)):

| Location | Shown in |
| --- | --- |
| `primary-nav` | [Navbar](../ui-library/composites/navbar.md) links |
| `profile-nav` | the Navbar drawer's user links |
| `primary-footer` | the [Footer](../ui-library/composites/footer.md)'s main row |
| `secondary-footer` | the Footer's smaller row |

- **Placement:** a page also sets its menu label (default: its title), order, an icon and a group. `primary-nav` pages sharing a group form one dropdown, placed where its lowest-ordered page would be.
- **Parameters:** pages with parameters in their path can't go in menus, except Profile in `profile-nav`, which links to the signed-in user's own profile.
- **Visibility:** menus show only published pages the visitor's audience allows.

## The profile page

Profile (`/profile/:id`) shows different things to a signed-out **visitor**, a signed-in **member** and the profile's **owner** ([0081](../decisions/0081-extend-the-profile-page-through-slots-by-viewer.md)).

- **What visitors see:** name, avatar, banner and join date. The email, and editing, are for the owner only.
- **Plugin slots:** core and plugins add **tabs** (right column), **sidebar sections** (left column) and **header actions** (by the avatar). Each declares which viewers see it.
- **Tabs in the URL:** tabs are addressable, e.g. `/profile/:id?tab=orders`.

## Site settings

One `settings` record holds the site title, logo and copyright holder for the Navbar and Footer, edited on the CMS Settings screen ([0082](../decisions/0082-keep-site-wide-settings-in-one-record.md)). Theme colours, fonts and SEO defaults come later.

## Permissions

| Permission | Roles |
| --- | --- |
| `pages.edit` | owner, admin, editor |
| `pages.publish`, `pages.delete` | owner, admin |
| `settings.edit` | owner, admin |

## Build status

Built so far: the [Navbar](../ui-library/composites/navbar.md) and [Footer](../ui-library/composites/footer.md) composites, and phases 1 and 2. The phases, in order:

1. **Contracts and API (built):** page and settings contracts, permissions, the [pages](../backend/pages.md) and [settings](../backend/site-settings.md) endpoints, and the seeded core pages and default settings. Not Found lives at `/404`, and each record carries the `layouts` its template allows.
2. **`web` shell (built):** `SiteShell` in `@inithium/web-shell` (routes from records, audiences, transitions, `usePageReady`, scroll, focus and the document title; Navbar and Footer from the records and settings), the layouts lib with `default` and `bare`, the web registry, and core's templates in `@inithium/web-pages`: real Login and Sign up (with a red alert and per-field errors, [0083](../decisions/0083-let-visitors-sign-up-for-user-accounts.md)), and placeholder Home, Profile (showing who's viewing) and Not Found.
3. **CMS:** a sidebar layout, the Pages list with an edit dialog (General, Appearance, Access, Navigation, SEO) and the Settings screen.
4. **Later:**
   - the real profile page (after end-user auth and profiles);
   - the collection layouts (with the first plugin that needs them);
   - the content-page template and its block editor.
