---
id: "0070"
title: Grow and shrink lists one row at a time, around any content
status: accepted
date: "2026-10-09"
scope: core
tags: [ui, composites, forms, accessibility]
related: ["0048", "0054", "0064", "0069"]
supersedes: []
---

# 0070. Grow and shrink lists one row at a time, around any content

## Context

Forms need lists the user extends or trims: several colours for a pattern, several emails to invite. The rows can hold anything (components, composites).

## Decision

- **`AutoIncrementingList` is generic over its item type:** `items` / `defaultItems` / `onItemsChange`, `createItem()` for new items, and `renderItem(item, index, update)` to draw and change each one. The list tracks its own row ids, so items needn't have ids and rows keep their state when others are removed. A list that starts empty gets one item.
- **Buttons:** every row has a minus button (removes that row), hidden when the list is at `min` (default 1); the last row also has a plus button (appends a row), hidden at `max`. Both are square 32px icon Buttons ([0054](0054-style-buttons-by-variant-from-one-colour.md)) in `addColor` (default `primary`) and `removeColor` (default `red`), labelled and tooltipped with `itemLabel` ("Add colour", "Remove colour 2") ([0064](0064-describe-elements-with-tooltips-that-wrap-them.md)).
- **Layout:** content fills the row; buttons follow it, aligned to the row's bottom by default (`align="center"` centres them); rows 8px apart. Optional `label` above, `helperText` and a self-clearing `error` below.
- **Motion:** added rows fade in from above; removed rows fade out, then the gap closes before the item is removed from the array. No motion under reduced motion.
- **Accessibility:** a labelled `<ul>`; focus moves into the new row after adding, and to the neighbouring row after removing; a polite live region announces each change.
- **Stored props:** `label`, `helperText`, `min`, `max`, `addColor`, `removeColor`, `itemLabel`, `align`, margin, padding and animation. Items and `renderItem` are runtime only.

## Alternatives considered

- **Requiring item ids:** the list tracks ids itself, so plain values (strings, colours) work.
- **Drag to reorder:** left for later.

## Consequences

- A removal reaches `onItemsChange` after the exit animation and collapse (about 0.4s), not on the click.
