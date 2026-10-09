---
id: "0060"
title: Draw dividers as native separators, horizontal or vertical, with an optional label
status: accepted
date: "2026-10-09"
scope: core
tags: [ui, components, layout, accessibility]
related: ["0031", "0048", "0056"]
supersedes: []
---

# 0060. Draw dividers as native separators, horizontal or vertical, with an optional label

## Context

Pages and toolbars need lines between content. Divider is a simple component, but it should take the same colour, spacing and animation props as the others.

## Decision

- **Orientation:** `horizontal` (default) fills its container's width; `vertical` stretches to a flex row's height, or is 1em tall inline in text.
- **Line:** `color` (default `surface` 500 at 40% opacity: the theme's border role, softened), `thickness` in px (default 1) and `lineStyle` (`solid`, `dashed` or `dotted`).
- **Label:** `label` puts text between two line segments; `labelAlign` places it in the `center` (default), or 24px from the `start` or `end`. `padding` is the gap around the label (default 12px each side).
- **Semantics:** native, no library ([0056](0056-use-radix-primitives-for-interactive-widgets.md)). A plain horizontal divider is an `<hr>`; a vertical one is an inline `<span role="separator" aria-orientation="vertical">`; a labelled one is a `<div>` whose text is read normally. `decorative` hides it from screen readers.
- **Spacing:** no margin by default; callers add `margin`.
- **Animation:** Divider takes the animation prop like every component ([0048](0048-animate-components-with-animate-css-through-an-animation-prop.md)).
- **Stored props:** `orientation`, `color`, `thickness`, `lineStyle`, `label`, `labelAlign`, `decorative`, margin, padding and animation.

## Alternatives considered

- **No animation prop:** kept for consistency with every other component.
- **A fixed 1px line:** a `thickness` prop was chosen.
- **A default vertical margin:** none, as with every component.

## Consequences

- Divider publishes a fixed stylesheet through `<UiProvider />`.
