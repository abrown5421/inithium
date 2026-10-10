---
title: DefaultLayout
description: The standard page frame under the Navbar, with centred content and the Footer at the bottom.
scope: core
tags: [ui, layout, pages]
order: 2
decisions: ["0077", "0079"]
component:
  name: DefaultLayout
  layer: layout
  import: '@inithium/shared-ui-layouts'
  element: div
---

# DefaultLayout

DefaultLayout is the standard frame a `web` page sits in, under the Navbar ([0079](../../decisions/0079-route-web-pages-through-a-shell-with-audiences-and-sequential-transitions.md)). It centres the content at up to 1200px wide, with the [Footer](../composites/footer.md) underneath. It fills the height it's given, so the Footer sits at the bottom of short pages. Pages choose it with the `default` layout key; the web shell renders it and fills in the Footer from the site's menus.

## Import

```tsx
import { DefaultLayout } from '@inithium/shared-ui-layouts';
```

## Props at a glance

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`children`](#children) | `ReactNode` | none | The page's content |
| [`footer`](#footer) | `FooterProps` | none | The Footer under the content |

## Props

#### `children`

The page's content, in a `<main>` up to 1200px wide with 24px either side and 32px above and below. **Type:** `ReactNode`.

#### `footer`

The [Footer](../composites/footer.md)'s props; leave it out for no footer. In `web`, the shell passes the site's footer menus and copyright. **Type:** `FooterProps`.

```tsx
<DefaultLayout footer={{ links, secondaryLinks, copyright: 'The Studio' }}>…</DefaultLayout>
```

## Examples

### Example: Basic

Short content with the Footer at the bottom of the frame.

```example
ui-library/default-layout/basic
```

### Example: Without footer

Just the content area, on a tinted page.

```example
ui-library/default-layout/without-footer
```

## Accessibility

- **Landmarks:** the content is the page's `<main>`; the Footer adds its `<footer>` and navigation.

## Notes

- **Filling the height:** DefaultLayout grows to fill a column flex parent; the web shell gives it the space under the Navbar. The page's background and text colours come from the page record, set by the shell around the layout.
