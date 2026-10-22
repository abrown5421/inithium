---
id: "0123"
title: Open the CMS's narrow-screen drawer from a round button in the bottom left
status: accepted
date: "2026-10-22"
scope: core
tags: [ui, layout, cms, navigation]
related: ["0076", "0086", "0094"]
supersedes: []
---

# 0123. Open the CMS's narrow-screen drawer from a round button in the bottom left

## Context

[0086](0086-run-the-cms-in-a-sidebar-frame-with-a-pages-screen.md) moves SidebarLayout's entries into a left drawer below 1024px, opened from a menu button in the top bar. The top bar is a Navbar ([0076](0076-navigate-with-a-navbar-that-collapses-into-a-drawer.md)), whose avatar already opens a right drawer with the account links. On a phone the bar held two buttons opening two drawers, and the user judged the menu button clunky.

## Decision

- **Narrow screens:** below 1024px of the layout's width, the section drawer opens from a 48px round button fixed to the bottom left of the screen (16px in, above the safe area), filled with the accent colour (primary by default) with its icon in the colour's 100 step. It toggles the drawer: `panel-left-open` while closed, `panel-left-close` while open. The top bar keeps only the avatar.
- **Layering:** the button is rendered in a portal at the end of the page, at z-index 39: above all content and the Navbar, under overlays (40), so any open modal or drawer covers it. While its own drawer is open it rises to 45 and moves beside the 280px panel, so it can close it. The bottom right stays free for alerts.
- **Content:** on narrow screens the content gets 88px of bottom padding, so the button never covers its end.
- **`fill` screens on wide windows** (full-screen tools such as the content editor, [0094](0094-edit-content-pages-in-a-cms-screen-that-fills-the-frame.md)) keep the menu button in the top bar, so a floating button never covers the tool's own panels.

## Alternatives considered

- **Keep the top bar's menu button:** the original design; replaced by this decision.
- **A floating button on `fill` screens too:** it would sit over the content editor's Layers panel. Rejected for that reason.

## Consequences

- One way into the section drawer on phones, out of the way of the top bar and the alerts.
- SidebarLayout draws a plain round `<button>`, since Button is a fixed 32px row.
