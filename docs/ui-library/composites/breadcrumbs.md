---
title: Breadcrumbs
description: The path from the top of a site to the current page, as links separated by chevrons, with the current page last.
scope: core
tags: [ui, composite, navigation]
order: 4
decisions: ["0048", "0050", "0064", "0066", "0072"]
component:
  name: Breadcrumbs
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: nav
---

# Breadcrumbs

Breadcrumbs show where the current page sits in a site, and let the user jump back up ([0072](../../decisions/0072-show-the-navigation-path-as-breadcrumbs.md)). Each step links to its page, separated by a chevron; the last step is the current page, in bold and not a link. This manual's own page headers use them.

The steps are data, `{ label, href?, icon?, iconOnly? }`, from the top down. The links are real links, so middle-click and "open in new tab" work; pass `onNavigate` and a plain click goes through the app's router instead of reloading the page.

## Import

```tsx
import { Breadcrumbs, type BreadcrumbsItem } from '@inithium/shared-ui-composites';
```

## Props at a glance

Type names such as `Colour`, `Sides` and `Variants<T>` are defined on [Style props](../style-props.md). `items` is required.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`items`](#items) | `BreadcrumbsItem[]` | **required** | The steps, top level first |
| [`onNavigate`](#onnavigate) | `(href: string) => void` | normal links | Follows plain clicks |
| [`separator`](#separator) | `string` | `'chevron-right'` | Icon name or text |
| [`maxItems`](#maxitems) | `number` | none | Collapse longer trails |
| [`color`](#color) | `Colour` (not `'transparent'`) | `'primary'` | Link hover and focus |
| [`aria-label`](#aria-label) | `string` | `'Breadcrumb'` | Names the trail |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | none | Spacing, px |
| [`animation`](#animation) | `Animation` | none | Animations |

## Props

#### `items`

The steps, from the top level down to the current page:

- `label`: the step's text.
- `href`: where it links. Without one, a step is plain text (e.g. a section with no page of its own). The last step, the current page, never links.
- `icon`: a [Lucide icon](../components/icon.md#name) before the label.
- `iconOnly`: shows just the icon; the label stays for screen readers and appears in a tooltip. Handy for a Home step.

**Type:** `BreadcrumbsItem[]`. **Required.**

```tsx
<Breadcrumbs
  items={[
    { label: 'Home', href: '/', icon: 'house', iconOnly: true },
    { label: 'Settings', href: '/settings' },
    { label: 'Billing' },
  ]}
/>
```

#### `onNavigate`

Called with a link's `href` on a plain left click, instead of the browser loading the page, e.g. with React Router's `navigate`. Clicks with Ctrl, ⌘, Shift or Alt, and middle-clicks, still open new tabs and windows. Without it, links work like any link. The UI library doesn't know about routing, so the app supplies this, as with [AlertStack](alert-stack.md#onnavigate). **Type:** `(href: string) => void`.

```tsx
const navigate = useNavigate();
<Breadcrumbs items={trail} onNavigate={(href) => navigate(href)} />
```

#### `separator`

What sits between steps: a Lucide icon name (anything written like one, e.g. `'slash'`) or text (e.g. `'/'`, `'›'`). **Type:** `string`. **Default:** `'chevron-right'`.

```tsx
<Breadcrumbs separator="/" items={trail} />
<Breadcrumbs separator="slash" items={trail} />
```

#### `maxItems`

Collapses a trail longer than this to the first step, a "…" button and the last steps, `maxItems` steps in all. Clicking "…" shows the full path, and focus moves to the first step it revealed. Without it, nothing collapses; the trail wraps onto more lines when it doesn't fit. **Type:** `number` (2 or more).

```tsx
<Breadcrumbs maxItems={4} items={longTrail} />   // Home › … › Marketing › Pages › Pricing
```

#### `color`

The links' colour on hover, and the keyboard focus outline. At rest, links are `surface-600` and the current page `surface-900`. **Type:** [`Colour`](../style-props.md#colour-value), except `'transparent'`. **Default:** `'primary'`.

#### `aria-label`

Names the trail for screen readers. **Type:** `string`. **Default:** `'Breadcrumb'`.

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px. **Type:** `Variants<Sides>`.

#### `animation`

The [animation prop](../animations/index.md). **Type:** `{ entrance?, exit?, attention? }`.

## Examples

### Example: Basic

Two links and the current page; the links go through the docs app's router.

```example
ui-library/breadcrumbs/basic
```

### Example: Icons and separators

An icon-only Home step, text and icon separators, a secondary colour, and a step without a link.

```example
ui-library/breadcrumbs/icons-and-separators
```

### Example: Collapsed trail

Seven steps collapsed to four; click "…" to see them all.

```example
ui-library/breadcrumbs/collapsed-trail
```

### Example: Long labels

Labels past 200px are cut short; hover one to read it all.

```example
ui-library/breadcrumbs/long-labels
```

## Accessibility

- **Structure:** a `<nav>` named "Breadcrumb" around an ordered list; separators are hidden from screen readers.
- **The current page** has `aria-current="page"` and isn't a link.
- **Links are real links,** so they work with the keyboard, in new tabs and with assistive technology; Tab moves through them.
- **Icon-only steps** keep their label for screen readers, and show it in a tooltip.
- **The "…" button** is labelled "Show the full path".

## Notes

- **Fixed metrics:** 14px text, 16px icons, 14px separators with 6px either side, labels cut at 200px.
- **Building the trail** is up to the app (e.g. from route data); Breadcrumbs doesn't work it out from the URL.
- **Not yet:** a "‹ Back to parent" mode for small screens.
- **Schemas:** `breadcrumbsPropsSchema` (type `BreadcrumbsSerializableProps`) and `breadcrumbItemSchema` (type `BreadcrumbItem`) in `@inithium/shared-contracts`. `onNavigate` isn't stored.
