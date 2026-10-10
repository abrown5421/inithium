---
title: Navbar
description: The application's main navigation bar, which moves its links into a drawer on narrow screens and adapts to sign-in state.
scope: core
tags: [ui, composite, navigation]
order: 9
decisions: ["0071", "0072", "0075", "0076"]
component:
  name: Navbar
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: header
---

# Navbar

Navbar is the application's main navigation ([0076](../../decisions/0076-navigate-with-a-navbar-that-collapses-into-a-drawer.md)): a full-width bar across the top of the screen with four sections.

- **Brand:** an optional logo and application title, linking home.
- **Page links:** links, and groups that open a dropdown.
- **Ancillary:** extras such as a cart or notifications button. Plugins will fill this through a slot.
- **User:** the signed-in user's avatar, or Login.

Below `collapseAt` (1024px by default), the page links move into a [Drawer](drawer.md):

| | Wide | Narrow |
| --- | --- | --- |
| **Signed in** | Links, ancillary, avatar. The avatar opens the drawer with the user's links and Logout. | Ancillary, avatar. The drawer has the page links, a divider, the user's links and Logout. |
| **Signed out** | Links, ancillary, a Login button. | Ancillary, a menu button. The drawer has the page links and Login. |

Navbar takes data, not routes. Links are real links, and plain clicks go to `onNavigate` so your app's router can follow them, as with [Breadcrumbs](breadcrumbs.md#onnavigate). The page system will supply the links from the CMS-managed menu once it's built.

## Import

```tsx
import { Navbar } from '@inithium/shared-ui-composites';
```

## Props at a glance

Type names such as `Colour`, `Sides` and `Variants<T>` are defined on [Style props](../style-props.md).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`title`, `logo`, `homeHref`](#title-logo-and-homehref) | `string`, `{ src, alt }`, `string` | none, none, `'/'` | The brand |
| [`links`](#links) | `NavItem[]` | `[]` | Page links and groups |
| [`user`](#user) | `{ name, avatar? }` | none (signed out) | The signed-in user |
| [`userLinks`](#userlinks) | `NavLink[]` | `[]` | The user's links, in the drawer |
| [`currentPath`](#currentpath) | `string` | none | Marks the current link |
| [`onNavigate`](#onnavigate) | `(href) => void` | browser navigation | The app's router |
| [`loginHref`, `onLogout`](#loginhref-and-onlogout) | `string`, `() => void` | `'/login'` | Login and Logout |
| [`ancillary`](#ancillary) | `ReactNode` | none | Extras before the user section |
| [`collapseAt`](#collapseat) | `'sm'` … `'2xl'` | `'lg'` | Where links move into the drawer |
| [`linksAlign`](#linksalign) | `'start'` \| `'center'` \| `'end'` | `'end'` | Where the links sit |
| [`sticky`](#sticky) | `boolean` | `true` | Stays at the top while scrolling |
| [`color`, `bgColor`](#color-and-bgcolor) | `Colour` | `'primary'`, surface 50 | Current link and background |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | none, `{ x: 24 }` | Spacing, px |
| [`animation`](#animation) | `Animation` | none | Animations |

## Props

#### `title`, `logo` and `homeHref`

The brand at the left: a logo image 40px tall and the application's name in the display font, cut off with "…" when space runs out. Both are optional and link to `homeHref`. With only a logo, its `alt` names the link. `src` is a URL for now and becomes an asset id once assets are built. **Type:** `string`, `{ src: string; alt: string }`, `string`. **Default:** `homeHref` `'/'`.

```tsx
<Navbar logo={{ src: '/logo.svg', alt: 'Peak Outfitters' }} title="Peak Outfitters" homeHref="/" />
```

#### `links`

The page links, in order (`navItemSchema` in `@inithium/shared-contracts`). Each is a link `{ label, href, icon? }` or a group `{ label, icon?, children }` of links. Groups go one level deep and aren't links themselves. On wide screens a group opens a dropdown below it on click or hover. In the drawer it's a small uppercase heading with its links indented. **Type:** `NavItem[]`. **Default:** `[]`.

```tsx
<Navbar
  links={[
    { label: 'Home', href: '/' },
    { label: 'Offerings', children: [{ label: 'Classes', href: '/classes' }, { label: 'Events', href: '/events' }] },
    { label: 'Contact', href: '/contact', icon: 'mail' },
  ]}
/>
```

#### `user`

The signed-in user, from `GET /api/auth/me`; leave it out when signed out. The bar shows their [Avatar](avatar.md), 36px, which opens the drawer. `avatar` is their avatar's recipe; without one, it shows initials from `name`. **Type:** `{ name: string; avatar?: AvatarRecipe }`.

#### `userLinks`

The signed-in user's links, e.g. Profile and Settings, listed in the drawer above Logout. **Type:** `NavLink[]`. **Default:** `[]`.

#### `currentPath`

The current address, e.g. `location.pathname`. The matching link is marked in `color` with `aria-current="page"`. A link matches its own path and anything under it; `'/'` matches only itself. A group is marked when one of its links is. **Type:** `string`.

#### `onNavigate`

Takes plain left clicks on links, the brand and Login, so your app's router can follow them. Ctrl-, Cmd- and middle-clicks still open new tabs. Without it, the browser loads the page. **Type:** `(href: string) => void`.

```tsx
const navigate = useNavigate();
const { pathname } = useLocation();
<Navbar links={links} currentPath={pathname} onNavigate={(href) => navigate(href)} />
```

#### `loginHref` and `onLogout`

Where Login goes, and what the drawer's Logout button calls. Signed out, Login is a filled Button in the bar on wide screens, and at the bottom of the drawer on narrow ones. Logout is a full-width red Button at the bottom of the drawer. **Type:** `string`, `() => void`. **Default:** `'/login'`.

#### `ancillary`

Anything shown before the user section at every width, such as icon [Buttons](../components/button.md) for a cart or notifications. Plugins will add theirs through a slot once the slot catalogue is decided. **Type:** `ReactNode`.

```tsx
<Navbar
  ancillary={
    <Tooltip content="Cart">
      <Button variant="ghost" color={{ color: 'surface', intensity: 800 }} leadingIcon="shopping-cart" aria-label="Cart" padding={{ x: 6 }} />
    </Tooltip>
  }
/>
```

#### `collapseAt`

The [breakpoint](../style-props.md#variants) below which the page links move into the drawer. Navbar measures its own width, which is the screen's when it's full width. **Type:** `'sm' | 'md' | 'lg' | 'xl' | '2xl'`. **Default:** `'lg'` (1024px).

#### `linksAlign`

Where the page links sit between the brand and the right-hand sections. **Type:** `'start' | 'center' | 'end'`. **Default:** `'end'`.

#### `sticky`

Keeps the bar at the top of the screen while the page scrolls. It sits at z-index 30, below overlays (40) and popups (50). **Type:** `boolean`. **Default:** `true`.

#### `color` and `bgColor`

`color` marks the current link, hover, focus and the Login button. `bgColor` is the bar's background. Link text uses surface 900, so keep the background light. **Type:** [`Colour`](../style-props.md#colour-value). **Default:** `'primary'`, and surface 50.

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px. **Type:** `Variants<Sides>`. **Default:** padding `{ x: 24 }`.

#### `animation`

The [animation prop](../animations/index.md). **Type:** `{ entrance?, exit?, attention? }`.

## Examples

The manual's column is narrower than 1024px, so the wide examples set `collapseAt="md"` (768px).

### Example: Basic

Signed out, with a group: click the links and the Offerings dropdown.

```example
ui-library/navbar/basic
```

### Example: Signed in

Ancillary buttons and the user's avatar; switch between signed in and out, and log out from the drawer.

```example
ui-library/navbar/signed-in
```

### Example: Narrow

The same bar in a 480px box: the links move into the drawer.

```example
ui-library/navbar/narrow
```

### Example: Brand and alignment

A logo with a title and links at the start; a logo alone with centred links; a tinted bar.

```example
ui-library/navbar/brand-and-alignment
```

## Accessibility

- **Landmarks:** a `<header>` with a `<nav aria-label="Main">` for the page links. The drawer has its own `<nav>`.
- **Menus:** the menu button ("Open menu") and the avatar button ("<name>: account menu") report whether the drawer is open. The drawer is a [Drawer](drawer.md#accessibility), so focus moves into it and back when it closes.
- **Dropdowns** (Radix Navigation Menu) open with Enter, Space or the down arrow, and close with Escape.
- **Current page:** `aria-current="page"` on its link.

## Notes

- **Fixed metrics:** a 64px row; links 16px/500 in 40px-tall pills (44px rows in the drawer); a 1px surface 500 border at 40% along the bottom; a 360px drawer, full width on phones.
- **Not yet:** count badges, an online-status dot on the avatar, and a "Skip to content" link, which needs the page system.
- **Schemas:** `navItemSchema`, `navLinkSchema` and `navGroupSchema` (types `NavItem`, `NavLink`, `NavGroup`) and `navbarPropsSchema` (type `NavbarSerializableProps`) in `@inithium/shared-contracts`. `isCurrentPath(href, currentPath)` is exported with Navbar.
