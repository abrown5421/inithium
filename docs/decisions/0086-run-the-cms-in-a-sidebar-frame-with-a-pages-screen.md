---
id: "0086"
title: Run the CMS in a sidebar frame of permission-gated screens, starting with a dashboard and a Pages editor
status: accepted
date: "2026-10-12"
scope: core
tags: [cms, pages, navigation, permissions, ui, forms]
related: ["0076", "0078", "0080", "0083", "0085"]
supersedes: []
---

# 0086. Run the CMS in a sidebar frame of permission-gated screens, starting with a dashboard and a Pages editor

## Context

The CMS had sign-in and a placeholder screen. Clients now need to manage their page records ([0078](0078-store-pages-as-records-rendered-by-code-templates.md)). Earlier client sites used a CMS with a sidebar of screens, a Pages list and an edit dialog with General, Appearance, Access, Navigation and SEO tabs.

## Decision

- **Frame:** `SidebarLayout` (`@inithium/shared-ui-layouts`) puts a top bar (Navbar ([0076](0076-navigate-with-a-navbar-that-collapses-into-a-drawer.md)) with the site title and the user's account menu) over a sticky sidebar of icon-and-label entries, the current one tinted, with "Collapse" to icons only. Below 1024px of its own width the entries move into a left drawer behind a menu button.
- **Screens:** `CmsShell` (`@inithium/cms-shell`) takes a list of screens (`{ path, label, icon, element, permission? }`): each becomes a route and a sidebar entry, shown only to users with its permission. The CMS app lists core's screens; plugin screens arrive through the slot catalogue later.
- **Dashboard:** `/cms` opens an empty Dashboard (a heading and a welcome). It will later show different things to different roles.
- **Pages screen** (`@inithium/cms-pages`, needs `pages.edit`): every page with search (title and path) and sorting (title, path, status); each row shows the title, a "Site page" badge on protected pages, path · layout · status, "View on the site" (published pages without parameters) and Edit.
- **Page editor:** a Modal over a draft, with tabs:
  - **General:** title, the path (read-only, "set by the developer" on protected pages), the layout from the page's allowed layouts, and Published (disabled with a tooltip for users without `pages.publish`);
  - **Appearance:** custom background and text colour (a Switch and a ColorPicker; off means the default) and entrance and exit animations (name and speed, or Default);
  - **Access:** the audience as card radios;
  - **Navigation:** the four menus as checkboxes (those a parameterised page can't use are disabled with the reason, [0080](0080-build-menus-from-page-navigation-settings.md)), label, order, icon (IconPicker, [0085](0085-pick-icons-from-a-searchable-grid.md)) and group;
  - **SEO:** title and description with 70 and 160 character counters.

  Save validates with `pageUpdateSchema` and reports problems like `web`'s forms ([0083](0083-let-visitors-sign-up-for-user-accounts.md)): a red alert, each field's reason, and the first one's tab and field focused. Success shows a green "Page saved"; Cancel discards the draft.
- **Clearing:** `PATCH /api/pages/:id` takes `null` for `bgColor`, `textColor` and `animation`, clearing them so the page falls back to its template's or the site's default.
- **Sign-in:** the CMS's sign-in uses the same dark backdrop, card, alerts and field errors as `web`'s; accounts without `cms.access` are signed back out with an alert.

## Alternatives considered

- **Opening `/cms` on Pages:** the CMS gets a dashboard instead.
- **A typed icon name:** an IconPicker was built for this.

## Consequences

- The form-error helpers (`fieldErrorsFrom`, `readApiFailure`, `focusFirstError`) moved to `@inithium/shared-data-access`, shared by `web` and the CMS; field errors are keyed by dotted path (e.g. `seo.title`).
- The slot catalogue (0015) still needs CMS screen and sidebar-entry slots for plugins.
- "View on the site" opens the page's path on the CMS's origin, which is the site in production; under `nx serve cms` it lands on the CMS dev server.
