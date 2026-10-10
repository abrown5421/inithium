---
id: "0079"
title: Route web pages through a shell with audiences and sequential page transitions
status: accepted
date: "2026-10-10"
scope: core
tags: [pages, routing, web, animation, auth, accessibility]
related: ["0048", "0058", "0066", "0076", "0077", "0078", "0080", "0082"]
supersedes: []
---

# 0079. Route web pages through a shell with audiences and sequential page transitions

## Context

Page records ([0078](0078-store-pages-as-records-rendered-by-code-templates.md)) must become React Router routes in `web`, each page drawn in a layout, restricted by who may see it, and animated: each page has its own entrance and exit, and the old page must leave before the new one arrives. The CMS is a separate app with ordinary hand-written routes and none of this.

## Decision

- **Startup:** `web` fetches its site bundle once (site settings ([0082](0082-keep-site-wide-settings-in-one-record.md)) and the published page records) and shows a Loader until it arrives. CMS edits reach visitors on their next full load.
- **Routes** are built from the published records' paths; each renders its template's component inside the record's layout. Unknown paths and unpublished pages render the Not Found page, itself a protected record.
- **Layouts** are code frames in the UI library's layouts layer. The first two are `default` (Navbar, the page, Footer) and `bare` (a centred panel, for sign-in). Planned: `full-width`, `collection-list`, `collection-item` and `profile`.
- **Audiences:** `all`, `signed-out` or `signed-in`.
  - A signed-out visitor on a `signed-in` page goes to `/login` with an alert ("Sign in to view that page"), and returns to the page after signing in.
  - A signed-in user on a `signed-out` page goes to Home, without a message.
  - Profile is `all` and varies its view itself.
- **Transitions:** the Navbar stays; everything under it (banner included) animates.
  - The current page plays its exit; when it ends, the new page plays its entrance.
  - Navigating during an exit doesn't interrupt it; when it ends, the latest destination enters (pages in between are skipped).
  - Animations come from each record, built on `useAnimation` ([0048](0048-animate-components-with-animate-css-through-an-animation-prop.md)); reduced motion is respected.
- **Data readiness:** the shell provides `usePageReady(ready)`. The next page renders out of sight during the exit so its data starts loading; if it isn't ready when the exit ends, the Loader ([0058](0058-show-loading-with-css-loader-variants.md)) shows until it is, then it enters. Pages without data are ready at once.
- **After each change:** the window scrolls to the top and focus moves to the new page's main heading; back and forward restore the earlier scroll position. The document title comes from the record's SEO title (or title) and the site title.
- **Navbar and Footer** ([0076](0076-navigate-with-a-navbar-that-collapses-into-a-drawer.md), [0077](0077-close-pages-with-a-two-row-footer.md)) get their links from the records ([0080](0080-build-menus-from-page-navigation-settings.md)) and their brand and copyright from site settings, and navigate through the router.

## Alternatives considered

- **Cutting the exit short on a new click:** the exit always finishes, then the latest destination enters.
- **Entering immediately and filling data in:** pages wait for their data, behind a Loader, before entering.
- **Showing a sign-in panel in place on signed-in pages:** a redirect to `/login` with an alert was chosen.

## Consequences

- `web` needs the signed-in user (from `GET /api/auth/me`) before deciding audiences, so the site bundle and the session load together.
- Every page template must call `usePageReady` if it loads data.
- The layouts lib (`@inithium/shared-ui-layouts`) is created with the `default` and `bare` layouts.
