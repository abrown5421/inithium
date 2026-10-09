---
id: "0073"
title: Page through lists with arrows and a fixed-length row of page numbers
status: accepted
date: "2026-10-09"
scope: core
tags: [ui, composites, navigation, accessibility]
related: ["0054", "0062", "0072"]
supersedes: []
---

# 0073. Page through lists with arrows and a fixed-length row of page numbers

## Context

Long lists (friends, members, search results) need paging. Pagination is the last planned composite.

## Decision

- **Shape:** page numbers between ← and → arrows that move one page; clicking a number jumps there. `pageCount`, and `page` / `defaultPage` / `onPageChange` (pages count from 1, clamped).
- **Long ranges:** the first and last pages, the current page with `siblingCount` neighbours each side (default 1), and a non-clickable "…" for each gap. The row always has the same number of slots, so buttons don't move as you page; a gap that would hide one page shows that page instead.
- **Look:** square items at least 32px tall and wide, like ghost Buttons in `color` (default `primary`), with the current page filled and its number in the colour's 100 step ([0054](0054-style-buttons-by-variant-from-one-colour.md)). Items have their own stylesheet so they can be buttons or links.
- **Options:** `showFirstLast` (« and »); `compact` ("Page 5 of 20" between the arrows); `pageSizeOptions` with `pageSize` / `onPageSizeChange` (a "Rows per page" Select ([0062](0062-draw-select-as-an-input-field-opening-a-list-below.md)); changing it returns to page 1); `totalItems` ("21–40 of 312").
- **Links:** `getPageHref(page)` makes pages real links; plain clicks still go through `onPageChange`, so the app's router follows them, as with Breadcrumbs ([0072](0072-show-the-navigation-path-as-breadcrumbs.md)). Arrows stay buttons, since they're disabled at the ends.
- **A single page** still renders ("1", arrows disabled), so layouts don't shift.
- **Accessibility:** a `<nav>` named "Pagination"; "Page N" labels with `aria-current` on the current page; labelled arrows with native `disabled`; focus moves to the current page when the arrow you used becomes disabled.
- **Stored props:** `color`, `siblingCount`, `showFirstLast`, `compact`, `pageSizeOptions`, margin, padding and animation.

## Alternatives considered

- **Hiding Pagination when there's one page:** it stays, so layouts don't shift.
- **A clickable "…" that jumps several pages:** not included.
- **Switching to compact automatically on small screens:** it's an option instead.

## Consequences

- The UI library's planned composites are complete; layouts come next.
