---
id: "0117"
title: Open lists of actions from a Menu composite
status: accepted
date: "2026-10-15"
scope: core
tags: [ui, composites, menu, radix]
related: ["0056", "0062", "0092", "0116"]
supersedes: []
---

# 0117. Open lists of actions from a Menu composite

## Context

The page builder's Layers give each element a "⋯" menu of actions ([0116](0116-build-content-pages-from-a-tree-of-library-elements.md)). The UI library had no menu: Select chooses a value, and Navbar's dropdowns hold links. Interactive widgets take their behaviour from one Radix package each ([0056](0056-use-radix-primitives-for-interactive-widgets.md)), and apps build from the library rather than plain elements ([0092](0092-build-ui-from-the-library-before-plain-elements.md)).

## Decision

- **Menu** is a composite in `@inithium/shared-ui-composites`, built on `@radix-ui/react-dropdown-menu`, whose API it doesn't expose.
- **It opens from a trigger** passed as its child (any element that takes a ref and events, usually a Button), on `side` and `align` of it. It can be controlled with `open` and `onOpenChange`.
- **Items are data:** `{ label, onSelect, icon?, shortcut?, disabled?, danger? }`, or `'separator'`. `shortcut` is a hint only; the caller handles the keys. `danger` draws the row in red.
- **Layering:** it renders in a portal at the popup layer (z-index 50), like Select and Tooltip ([0062](0062-draw-select-as-an-input-field-opening-a-list-below.md)).
- **Its look** is fixed: a surface 50 panel with a border, an 8px radius and the `lg` shadow, 32px rows, the highlighted row on surface 200. Its stylesheet is rendered once by the composite, as other composites do.
- **Not modal:** the rest of the page stays usable while it's open.
- **Not included:** submenus, checkable items, and opening on right-click.

## Alternatives considered

None recorded.

## Consequences

- A new dependency, `@radix-ui/react-dropdown-menu`.
- Menu has its own manual page and examples, like every composite.
- Menus elsewhere (e.g. actions on Media or Users rows) can reuse it.
