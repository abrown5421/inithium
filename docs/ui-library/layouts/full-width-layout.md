---
title: FullWidthLayout
description: A page frame under the Navbar with no width limit or padding, for pages that draw their own frame.
scope: core
tags: [ui, layout, pages]
order: 3
decisions: ["0079", "0084", "0090"]
component:
  name: FullWidthLayout
  layer: layout
  import: '@inithium/shared-ui-layouts'
  element: div
---

# FullWidthLayout

FullWidthLayout is a page frame for pages that draw their own frame from edge to edge, such as the Profile page's full-width banner ([0090](../../decisions/0090-generate-and-show-user-profiles.md)). Unlike [DefaultLayout](default-layout.md), it adds no width limit and no padding. Like DefaultLayout, the Footer starts just below the fold in `web` ([0084](../../decisions/0084-start-the-footer-just-below-the-fold.md)). Pages choose it with the `full-width` layout key.

## Import

```tsx
import { FullWidthLayout } from '@inithium/shared-ui-layouts';
```

## Props at a glance

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`children`](#children) | `ReactNode` | none | The page's content, edge to edge |
| [`footer`](#footer) | `FooterProps` | none | The Footer under the content |

## Props

#### `children`

The page's content, in a full-width `<main>` with no padding: add your own where the content needs it. **Type:** `ReactNode`.

#### `footer`

The [Footer](../composites/footer.md)'s props; leave it out for no footer. In `web`, the shell passes the site's footer menus and copyright. **Type:** `FooterProps`.

```tsx
<FullWidthLayout footer={{ links, copyright: 'The Studio' }}>…</FullWidthLayout>
```

## Examples

### Example: Hero

A banner from edge to edge, with padded content under it.

```example
ui-library/full-width-layout/hero
```

## Accessibility

- **Landmarks:** the content is the page's `<main>`; the Footer adds its `<footer>` and navigation.

## Notes

- **Below the fold:** the same rule as DefaultLayout, using `--ui-navbar-height`. Outside the web shell it simply fills a column flex parent.
