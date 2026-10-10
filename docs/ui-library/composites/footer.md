---
title: Footer
description: The site's footer, with a row of main links over the copyright and secondary links.
scope: core
tags: [ui, composite, navigation]
order: 8
decisions: ["0076", "0077"]
component:
  name: Footer
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: footer
---

# Footer

Footer closes every page ([0077](../../decisions/0077-close-pages-with-a-two-row-footer.md)). It has two rows:

- **Main links,** e.g. Home, Classes, Calendar, Contact.
- **A smaller row** with the copyright, whose year stays current on its own, followed by secondary links such as Privacy Policy, separated by thin rules.

Like [Navbar](navbar.md), it takes data, not routes. Links are real links, and plain clicks go to `onNavigate` for your app's router. The page system will fill it from the pages placed in the primary-footer and secondary-footer menus.

## Import

```tsx
import { Footer } from '@inithium/shared-ui-composites';
```

## Props at a glance

Type names such as `Colour`, `Sides` and `Variants<T>` are defined on [Style props](../style-props.md).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`links`](#links) | `NavItem[]` | `[]` | The main row |
| [`secondaryLinks`](#secondarylinks) | `NavLink[]` | `[]` | The smaller row, after the copyright |
| [`copyright`, `copyrightStartYear`](#copyright-and-copyrightstartyear) | `string`, `number` | none | The copyright line |
| [`currentPath`](#currentpath) | `string` | none | Marks the current link |
| [`onNavigate`](#onnavigate) | `(href) => void` | browser navigation | The app's router |
| [`align`](#align) | `'start'` \| `'center'` | `'start'` | How the rows line up |
| [`color`, `bgColor`](#color-and-bgcolor) | `Colour` | `'primary'`, surface 50 | Hover and current link, background |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | none, `{ x: 24, y: 32 }` | Spacing, px |
| [`animation`](#animation) | `Animation` | none | Animations |

## Props

#### `links`

The main row, in Navbar's item shape (`navItemSchema`). Groups are flattened into their links in order, since a footer has no dropdowns. **Type:** `NavItem[]`. **Default:** `[]`.

```tsx
<Footer links={[{ label: 'Home', href: '/' }, { label: 'Offerings', children: [{ label: 'Classes', href: '/classes' }] }]} />
// Home   Classes
```

#### `secondaryLinks`

The smaller row's links, after the copyright and separated by thin rules. **Type:** `NavLink[]`. **Default:** `[]`.

#### `copyright` and `copyrightStartYear`

`copyright` is the holder's name; the line reads "© 2026 The Dance & Movement Workshop. All rights reserved." with the current year, so it never needs a yearly edit. `copyrightStartYear` turns the year into a range. Without `copyright` the line is left out. **Type:** `string`, `number`.

```tsx
<Footer copyright="Peak Outfitters" copyrightStartYear={2019} />
// © 2019–2026 Peak Outfitters. All rights reserved.
```

`copyrightText(holder, startYear?)`, exported with Footer, returns the same line.

#### `currentPath`

The current address, e.g. `location.pathname`. The matching link is marked in `color` with `aria-current="page"`, matched as on [Navbar](navbar.md#currentpath). **Type:** `string`.

#### `onNavigate`

Takes plain left clicks on links so your app's router can follow them; other clicks open new tabs as usual. Without it, the browser loads the page. **Type:** `(href: string) => void`.

#### `align`

How the rows line up. **Type:** `'start' | 'center'`. **Default:** `'start'`.

#### `color` and `bgColor`

`color` is link hover, focus and the current page; `bgColor` the background. Link text uses surface 900 and 600, so keep the background light. **Type:** [`Colour`](../style-props.md#colour-value). **Default:** `'primary'`, and surface 50.

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px. **Type:** `Variants<Sides>`. **Default:** padding `{ x: 24, y: 32 }`.

#### `animation`

The [animation prop](../animations/index.md). **Type:** `{ entrance?, exit?, attention? }`.

## Examples

### Example: Basic

Both rows, with a group flattened into its links; click the links.

```example
ui-library/footer/basic
```

### Example: Centred

Centred rows, a copyright range and a tinted background.

```example
ui-library/footer/centred
```

### Example: Narrow

Under 640px wide, the rows stack into columns.

```example
ui-library/footer/narrow
```

### Example: Copyright only

Just the copyright line.

```example
ui-library/footer/copyright-only
```

## Accessibility

- **Landmarks:** a `<footer>` with `<nav aria-label="Footer">` for the main links and `<nav aria-label="More links">` for the secondary ones.
- **Current page:** `aria-current="page"` on its link. The rules between links are decorative.

## Notes

- **Fixed metrics:** main links 16px/500 in surface 900, 28px apart; secondary text 14px in surface 600; rows 16px apart; a 1px surface 500 border at 40% along the top.
- **Placement:** not sticky. Keeping it at the bottom of short pages is the page layout's job.
- **Schema:** `footerPropsSchema` (type `FooterSerializableProps`) in `@inithium/shared-contracts`.
