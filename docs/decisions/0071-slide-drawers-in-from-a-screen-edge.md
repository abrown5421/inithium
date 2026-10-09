---
id: "0071"
title: Slide drawers in from a screen edge, sharing Modal's dialog and global state
status: accepted
date: "2026-10-09"
scope: core
tags: [ui, composites, overlays, state, accessibility]
related: ["0048", "0056", "0065"]
supersedes: []
---

# 0071. Slide drawers in from a screen edge, sharing Modal's dialog and global state

## Context

Some content belongs beside the page rather than over its middle: a cart, filters, settings, a share sheet. Modal ([0065](0065-open-modals-by-id-from-global-state.md)) already solves the dialog part: overlay, focus trap, Escape, scroll lock, focus return, global state and exit animations.

## Decision

- **Drawer reuses Modal's dialog:** both are built on an internal `DialogFrame` (Radix Dialog ([0056](0056-use-radix-primitives-for-interactive-widgets.md)), the fading overlay, staying open until the panel's exit ends, dismissal and focus return). Modal was refactored onto it without changing its behaviour.
- **Global state is shared:** drawers use the `modals` slice and `useModal(id)`, so one modal or drawer is open at a time.
- **Side and size:** `side` is `right` (default), `left`, `top` or `bottom`. Left and right drawers are full height and `size` wide (default 400px), never closer than 48px to the far edge; top and bottom drawers are full width and fit their content up to 80% of the screen, or `size` tall.
- **Animation:** slides in from and out to its side by default (`fast`); the animation prop overrides it. No motion under reduced motion.
- **Layout:** a pinned header (title, optional description, ✕), a scrolling body, and an optional pinned `footer`, separated by lines. The panel is `surface-50` with an `xl` shadow and a 12px radius only on the corners away from the screen edge, and takes Container's style props.
- **Same options as Modal:** `title` (required, or screen-reader-only with `hideTitle`), `description`, `dismissible`, `closeButton`, `overlayColor`; z-index 40.
- **Stored props:** `title`, `description`, `hideTitle`, `side`, `size`, `dismissible`, `closeButton`, `overlayColor`, `animation` and the panel's style props.

## Alternatives considered

- **A separate `drawers` slice,** so a drawer and a modal could be open together: not chosen; one overlay at a time.
- **A non-blocking side panel (no overlay):** left for later.
- **Swipe to close:** left for later.

## Consequences

- Fixes for the dialog behaviour apply to both Modal and Drawer through `DialogFrame`.
