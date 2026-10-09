---
id: "0072"
title: Show the navigation path as Breadcrumbs of real links, with an optional router hook
status: accepted
date: "2026-10-09"
scope: core
tags: [ui, composites, navigation, accessibility]
related: ["0050", "0064", "0066"]
supersedes: []
---

# 0072. Show the navigation path as Breadcrumbs of real links, with an optional router hook

## Context

Pages need to show where they sit in a site and let users jump back up. The UI library doesn't know about the app's router, which AlertStack already handles with an `onNavigate` hook ([0066](0066-show-alerts-from-a-global-queue-in-a-screen-corner.md)).

## Decision

- **Steps are data:** `items={[{ label, href?, icon?, iconOnly? }]}`, top level first. The last step is the current page: bold, not a link, `aria-current="page"`. A step without `href` is plain text.
- **Real links:** linked steps render `<a href>`, so middle-click and new tabs work. With `onNavigate`, a plain left click (no modifier keys) calls it instead of loading the page, so the app's router can follow it.
- **Look:** 14px; links `surface-600`, turning `color` (default `primary`) and underlined on hover; the current page `surface-900` and semibold; separators `surface-400`.
- **`separator`:** a Lucide icon name (default `chevron-right`) or text such as `/`; a value written like an icon name is drawn as an icon.
- **Icons:** any step can have an `icon`; `iconOnly` hides its label visually, keeping it for screen readers and in a tooltip ([0064](0064-describe-elements-with-tooltips-that-wrap-them.md)).
- **Long trails:** with `maxItems`, a longer trail shows the first step, a "…" button and the last steps; "…" expands it in place and moves focus to the first revealed step. Otherwise the trail wraps.
- **Long labels** are cut at 200px, with a tooltip showing the whole label only when it's cut.
- **Accessibility:** a `<nav aria-label="Breadcrumb">` around an ordered list; separators hidden from screen readers.
- **Stored props:** `items`, `separator`, `maxItems`, `color`, margin, padding and animation. `onNavigate` is runtime only.

## Alternatives considered

- **Buttons calling `onNavigate` only:** real links were chosen, so standard link behaviour keeps working.
- **Working out the trail from the URL:** left to the app.
- **A "back to parent" mode on small screens:** left for later.

## Consequences

- The docs app's page headers use Breadcrumbs with React Router.
