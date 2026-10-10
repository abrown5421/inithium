---
id: "0077"
title: Close pages with a data-driven footer of two link rows and a self-updating copyright
status: accepted
date: "2026-10-10"
scope: core
tags: [ui, composites, navigation]
related: ["0072", "0076"]
supersedes: []
---

# 0077. Close pages with a data-driven footer of two link rows and a self-updating copyright

## Context

Sites need a footer with two menus (primary and secondary footer locations), stacked, the second with a copyright that shouldn't need yearly edits. Like Navbar ([0076](0076-navigate-with-a-navbar-that-collapses-into-a-drawer.md)), it's built before the page system and takes data.

## Decision

- **Footer** (`@inithium/shared-ui-composites`) is a full-width `<footer>`:
  - a main row of `links`, which take Navbar's items with groups flattened into their links, in order;
  - under it, a smaller row of the copyright and then `secondaryLinks`, separated by thin vertical rules.
- **Copyright:** `copyright` (the holder) renders "© <year> <holder>. All rights reserved.", with the current year; `copyrightStartYear` makes a range ("© 2024–2026"). Without `copyright` the line is left out.
- **Links** are real links; plain clicks go to `onNavigate` and `currentPath` marks the current one, as on Navbar and Breadcrumbs ([0072](0072-show-the-navigation-path-as-breadcrumbs.md)).
- **Look:** a 1px surface 500 border at 40% along the top, surface 50 by default (`bgColor`), padding 32px by 24px, rows 16px apart; main links 16px/500 in surface 900, secondary text 14px in surface 600, hover and the current page in `color` (default primary). `align` is `start` (default) or `center`.
- **Narrow:** below 640px of its own width, both rows stack into columns and the rules go.
- **Accessibility:** `<nav aria-label="Footer">` for the main links and `<nav aria-label="More links">` for the secondary ones.
- **Stored props:** `links`, `secondaryLinks`, `copyright`, `copyrightStartYear`, `align`, `color`, `bgColor`, margin, padding and animation.

## Alternatives considered

- **A logo, social icons or a `children` slot:** left out for now; social links could become a third row.
- **Sticky or pinned to the bottom:** keeping it at the bottom of short pages is the page layout's job.

## Consequences

- The page system will fill `links` and `secondaryLinks` from pages placed in the primary-footer and secondary-footer locations, and `copyright` from site settings.
