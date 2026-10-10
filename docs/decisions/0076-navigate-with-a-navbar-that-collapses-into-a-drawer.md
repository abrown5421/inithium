---
id: "0076"
title: Navigate with a data-driven Navbar that collapses into a drawer by width and sign-in state
status: accepted
date: "2026-10-10"
scope: core
tags: [ui, composites, navigation, accessibility, auth]
related: ["0015", "0071", "0072", "0075"]
supersedes: []
---

# 0076. Navigate with a data-driven Navbar that collapses into a drawer by width and sign-in state

## Context

Every app needs a main navigation bar. The page system (routes, pages and the CMS-managed menu) isn't designed yet, and plugins will add entries such as a cart or notifications through slots ([0015](0015-slot-catalogue.md), still open). The bar's layout follows a matrix already used on a client site.

## Decision

- **Navbar** (`@inithium/shared-ui-composites`) is a full-width `<header>` with four sections: brand (optional `logo` `{ src, alt }` and `title`, linking to `homeHref`), page links, `ancillary` (any elements, e.g. icon buttons; plugins will fill it through a slot) and the user section.
- **Data, not routes:** `links` are `{ label, href, icon? }` or groups `{ label, icon?, children }` one level deep (`navItemSchema`); `userLinks` are flat. Links are real `<a href>`s, and plain left clicks go to `onNavigate` for the app's router, as with Breadcrumbs ([0072](0072-show-the-navigation-path-as-breadcrumbs.md)). `currentPath` marks the current link (its path or anything under it; `/` only itself) with `aria-current`.
- **Sign-in state comes from the app:** `user={{ name, avatar? }}` (from `GET /api/auth/me`); UI libraries can't read auth state. The avatar falls back to initials from the name ([0075](0075-draw-avatars-with-dicebear-from-a-stored-recipe.md)).
- **Matrix**, collapsing below `collapseAt` (default `lg`, 1024px), measured by the bar's own width:

  | | Wide | Narrow |
  | --- | --- | --- |
  | **Signed in** | Links, ancillary, avatar; the avatar opens the drawer with `userLinks` and Logout | Ancillary, avatar; the drawer has the page links, a Divider, `userLinks` and Logout |
  | **Signed out** | Links, ancillary, a Login button | Ancillary, a menu button; the drawer has the page links and Login |

- **Drawer:** the Drawer composite ([0071](0071-slide-drawers-in-from-a-screen-edge.md)) from the right, 360px (full width on phones), titled "Menu"; Login (filled, `color`) or Logout (filled red) fill its footer; following a link closes it. Groups show as small uppercase headings with their links indented.
- **Bar:** 64px tall, surface 50 by default (`bgColor`), a 1px surface 500 border at 40% along the bottom, sticky at the top by default (`sticky`), z-index 30 (below overlays at 40). Links are right-aligned by default (`linksAlign`); groups open a dropdown below on click or hover (Radix Navigation Menu). `color` (default primary) marks the current link, hover and focus.
- **Accessibility:** a `<nav aria-label="Main">` in the bar; the menu button ("Open menu") and the avatar button ("<name>: account menu") report `aria-expanded`.
- **Stored props:** `title`, `logo`, `homeHref`, `loginHref`, `links`, `userLinks`, `collapseAt`, `sticky`, `linksAlign`, `color`, `bgColor`, margin, padding and animation. `user`, `currentPath`, `ancillary` and the callbacks aren't stored.

## Alternatives considered

- **A menu button with only Login in the drawer on wide screens, when signed out:** a Login button in the bar is one click instead of two.
- **Collapsing by screen width:** the bar's own width is the same for a full-width bar, and also works in narrower containers.
- **Waiting for the page system:** Navbar only needs data, so the page system will produce its `links` instead.
- **Count badges and an online-status dot on the avatar:** left out until notifications and realtime exist.
- **A "Skip to content" link:** needs the page's main area, so it waits for the page system.

## Consequences

- The page system will produce `links` (from the CMS-managed menu, plus plugin entries through a slot), and the CMS will edit the brand. `logo.src` becomes an asset id when assets are built.
- `web` and `cms` add Navbar when the page system wires routes.
- The slot catalogue (0015) needs navigation-entry and navbar-ancillary slots.
