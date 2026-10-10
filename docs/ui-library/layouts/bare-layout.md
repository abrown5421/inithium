---
title: BareLayout
description: A focused page frame under the Navbar, with the content in a centred card and no Footer, for sign-in pages.
scope: core
tags: [ui, layout, pages]
order: 1
decisions: ["0079"]
component:
  name: BareLayout
  layer: layout
  import: '@inithium/shared-ui-layouts'
  element: div
---

# BareLayout

BareLayout is a focused frame for pages such as Login and Sign up ([0079](../../decisions/0079-route-web-pages-through-a-shell-with-audiences-and-sequential-transitions.md)). It puts the content in a card up to 420px wide, centred in the space under the Navbar, with no Footer. The Navbar stays, so moving between a bare page and any other page animates only what's under it. Pages choose it with the `bare` layout key.

## Import

```tsx
import { BareLayout } from '@inithium/shared-ui-layouts';
```

## Props at a glance

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`children`](#children) | `ReactNode` | none | The card's content |

## Props

#### `children`

The card's content, e.g. a sign-in form. The card is a `<main>` up to 420px wide with 32px padding, a 12px radius, a surface 50 background, a faint border and a medium shadow. **Type:** `ReactNode`.

## Examples

### Example: Sign in

A sign-in form in the card, centred on a tinted page.

```example
ui-library/bare-layout/sign-in
```

## Accessibility

- **Landmarks:** the card is the page's `<main>`.

## Notes

- **Filling the height:** like [DefaultLayout](default-layout.md), it grows to fill a column flex parent and centres the card in it, with 24px around.
