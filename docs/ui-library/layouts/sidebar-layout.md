---
title: SidebarLayout
description: An app frame with a top bar and a collapsible sidebar of sections, used by the CMS.
scope: core
tags: [ui, layout, cms, navigation]
order: 3
decisions: ["0076", "0086"]
component:
  name: SidebarLayout
  layer: layout
  import: '@inithium/shared-ui-layouts'
  element: div
---

# SidebarLayout

SidebarLayout is an app frame for tools such as the CMS ([0086](../../decisions/0086-run-the-cms-in-a-sidebar-frame-with-a-pages-screen.md)):

- **The top bar** is a [Navbar](../composites/navbar.md) with the title and the signed-in user's account menu.
- **The sidebar** runs down the left with an entry per section, the current one tinted. "Collapse" shrinks it to icons, with tooltips.
- **The content** sits beside the sidebar.

Below 1024px of its own width, the sidebar becomes a drawer opened from a menu button in the top bar.

## Import

```tsx
import { SidebarLayout, type SidebarItem } from '@inithium/shared-ui-layouts';
```

## Props at a glance

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`title`, `logo`, `homeHref`](#title-logo-and-homehref) | `string`, `{ src, alt }`, `string` | none, none, `'/'` | The top bar's brand and where it goes |
| [`items`](#items) | `SidebarItem[]` | **required** | The sidebar's entries |
| [`currentPath`](#currentpath) | `string` | none | Marks the current entry |
| [`onNavigate`](#onnavigate) | `(href) => void` | browser navigation | The app's router |
| [`user`, `onLogout`](#user-and-onlogout) | `{ name, avatar? }`, `() => void` | none | The account menu |
| [`defaultCollapsed`](#defaultcollapsed) | `boolean` | `false` | Start with icons only |
| [`color`](#color) | `Colour` | `'primary'` | Current entry, hover and focus |
| [`children`](#children) | `ReactNode` | none | The screen's content |

## Props

#### `title`, `logo` and `homeHref`

The app's name and an optional logo in the top bar, as on the [Navbar](../composites/navbar.md#title-logo-and-homehref), linking to `homeHref`. The title also names the narrow-screen drawer. **Type:** `string`, `{ src: string; alt: string }`, `string`. **Default:** `homeHref` `'/'`.

#### `items`

The entries, in order: `{ label, href, icon, exact? }`. The icon is a Lucide name. An entry is current at its own `href` and anything under it. With `exact`, it's current only at its own address, which suits a dashboard at the app's root. **Type:** `SidebarItem[]`.

```tsx
<SidebarLayout
  title="Studio"
  items={[
    { label: 'Dashboard', href: '/cms/', icon: 'layout-dashboard', exact: true },
    { label: 'Pages', href: '/cms/pages', icon: 'file-text' },
  ]}
/>
```

#### `currentPath`

The current address, compared with each entry's `href`. **Type:** `string`.

#### `onNavigate`

Takes plain left clicks on entries and the title, for your app's router. Other clicks open new tabs as usual. **Type:** `(href: string) => void`.

#### `user` and `onLogout`

The signed-in user, shown as an [Avatar](../composites/avatar.md) in the top bar. It opens the account drawer with Logout, as on the Navbar. **Type:** `{ name: string; avatar?: AvatarRecipe }`, `() => void`.

#### `defaultCollapsed`

Starts with the sidebar collapsed to icons. **Type:** `boolean`. **Default:** `false`.

#### `color`

The current entry's tint, hover and focus, and the Navbar's accent. **Type:** [`Colour`](../style-props.md#colour-value). **Default:** `'primary'`.

#### `children`

The screen's content, in a `<main>` with 32px of padding (16px either side on narrow screens). **Type:** `ReactNode`.

## Examples

### Example: Basic

Three sections, with the account menu. Collapse the sidebar, or narrow the window to see the drawer.

```example
ui-library/sidebar-layout/basic
```

## Accessibility

- **Landmarks:** the top bar's `<header>`, a `<nav aria-label="Sections">` for the sidebar and the content's `<main>`.
- **Current entry:** marked with `aria-current="page"`. Collapsed entries keep their label as their accessible name and show it in a tooltip.
- **Narrow screens:** the menu button ("Open navigation") reports whether the drawer is open. The drawer closes when an entry is chosen.

## Notes

- **Fixed metrics:** a 240px sidebar (64px collapsed), sticky under the Navbar and scrolling on its own; 40px entries with 20px icons. The background is surface 100 behind the content and surface 50 in the sidebar.
- **Sticky sidebar:** it sits at `top: var(--ui-navbar-height, 65px)`.
