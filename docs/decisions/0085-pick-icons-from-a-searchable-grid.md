---
id: "0085"
title: Pick icons from a field that opens a searchable grid of Lucide icons
status: accepted
date: "2026-10-12"
scope: core
tags: [ui, composites, icons, forms, accessibility]
related: ["0050", "0055", "0069"]
supersedes: []
---

# 0085. Pick icons from a field that opens a searchable grid of Lucide icons

## Context

The CMS needs to choose icons, starting with a page's menu icon. Lucide has over 2,000 icons ([0050](0050-render-icons-from-lucide-by-name.md)), each loaded on demand, so showing them all at once isn't practical.

## Decision

- **IconPicker** (`@inithium/shared-ui-composites`) works like ColorPicker ([0069](0069-pick-colours-from-swatches-and-an-intensity-slider.md)): a read-only Input ([0055](0055-build-input-as-a-native-field-with-a-floating-label.md)) showing the chosen icon and its name, which opens a panel below it.
- **The panel** has a search box (focused when it opens), a grid of matching icons 8 to a row, a count, and "No icon" to clear the choice.
- **Search** matches every word of the query against icon names, best first (names starting with it). At most 60 icons show at once, with "Showing 60 of N. Keep typing to narrow."; no categories.
- **Keyboard:** Enter, Space or the down arrow open it from the field; the down arrow moves from the search box into the grid (a listbox, one tab stop); arrow keys move 1 or 8, Home and End jump; Enter, Space or a click picks and closes; Enter in the search box picks the first match.
- **Value:** a Lucide icon name, or undefined for none, through `value` / `defaultValue` / `onValueChange`; `name` submits it in forms. Label, placeholder (default 'No icon'), helper text, required, disabled, error (hidden once an icon is chosen) and Input's style props.

## Alternatives considered

- **Every icon in one scrolling grid:** too many to load and scan.
- **Categories:** not included.

## Consequences

- Lucide's `iconNames` list is bundled with the picker; the icons themselves still load only when shown.
