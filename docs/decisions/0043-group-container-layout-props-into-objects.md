---
id: "0043"
title: Group Container's flex, grid, position and overflow props into objects
status: accepted
date: "2026-10-07"
scope: core
tags: [ui, components, props, layout]
related: ["0030", "0036", "0042"]
supersedes: []
---

# 0043. Group Container's flex, grid, position and overflow props into objects

## Context

Container ([0030](0030-organise-the-ui-library-as-theme-components-composites-and-layouts.md)) has to lay out its children with flexbox or grid, support positioning, and control overflow.

## Decision

- Container supports **flex, grid, position and overflow** through props.
- Each concern is **one object prop**, in the same style as the spacing objects:

  ```tsx
  <Container
    flex={{ direction: 'row', align: 'center', justify: 'between', wrap: 'wrap', gap: 16 }}
    position={{ type: 'sticky', top: 0, z: 10 }}
    overflow={{ y: 'auto' }}
  />

  <Container grid={{ columns: { base: 1, md: 3 }, gap: 24 }} />
  ```

- Gap and position offsets are pixel numbers ([0042](0042-size-and-space-in-pixel-numbers.md)). Values inside the objects accept breakpoint keys ([0036](0036-write-state-and-breakpoint-values-as-flat-tailwind-style-keys.md)).

## Alternatives considered

- **Flat props** (`display`, `direction`, `justify`, `gap`, `zIndex` and so on as separate props): not chosen.

## Consequences

- The full list of fields in each object is settled when Container is built (`feat/ui-foundation`), starting from the example above, and documented in the UI reference.
- How a Container is hidden at some breakpoints (e.g. `display: none` on mobile) is settled at the same time.
