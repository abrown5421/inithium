---
title: ProfileLayout
description: A profile's frame, with a full-width banner, an overlapping avatar beside the name, an identity sidebar and the main column.
scope: core
tags: [ui, layout, profiles]
order: 4
decisions: ["0074", "0075", "0081", "0090"]
component:
  name: ProfileLayout
  layer: layout
  import: '@inithium/shared-ui-layouts'
  element: div
---

# ProfileLayout

ProfileLayout draws a profile's frame ([0081](../../decisions/0081-extend-the-profile-page-through-slots-by-viewer.md), [0090](../../decisions/0090-generate-and-show-user-profiles.md)):

- a full-width [PolyBanner](../composites/poly-banner.md), 140px tall on phones and 220px from 768px;
- the [Avatar](../composites/avatar.md) (96px, or 128px from 768px) in a surface 50 ring, overlapping the banner's bottom edge by half;
- the name as the page's `<h1>` beside it, and any actions to the right;
- an identity sidebar (280px) on the left and the main column on the right. They stack below 768px.

It holds no data of its own: the page supplies the recipes, the edit callbacks and the columns' content. Core's Profile page uses it inside [FullWidthLayout](full-width-layout.md).

## Import

```tsx
import { ProfileLayout } from '@inithium/shared-ui-layouts';
```

## Props at a glance

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`name`](#name) | `string` | required | The heading, and the avatar's initials |
| [`avatar`](#avatar) | `AvatarRecipe` | required | The avatar's recipe |
| [`banner`](#banner) | `PolyPattern` | required | The banner's recipe |
| [`onAvatarChange`](#onavatarchange) | `(recipe) => void` | none | Makes the avatar editable |
| [`onBannerChange`](#onbannerchange) | `(pattern) => void` | none | Makes the banner editable |
| [`subtitle`](#subtitle) | `ReactNode` | none | Under the name |
| [`actions`](#actions) | `ReactNode` | none | Buttons beside the name |
| [`sidebar`](#sidebar) | `ReactNode` | none | The left column |
| [`children`](#children) | `ReactNode` | none | The right column |

## Props

#### `name`

The profile's name: the page's `<h1>`, and the initials the `initials` avatar style draws. It also labels the avatar and banner for screen readers ("Ada Lovelace's avatar"). **Type:** `string`.

#### `avatar`

The avatar's [recipe](../composites/avatar.md#value-defaultvalue-and-onchange). **Type:** `AvatarRecipe`.

#### `banner`

The banner's [recipe](../composites/poly-banner.md#value-defaultvalue-and-onchange). **Type:** `PolyPattern`.

#### `onAvatarChange`

With it, the avatar shows its pencil button and editor; it receives the recipe when the editor is saved. Leave it out for a read-only avatar. **Type:** `(recipe: AvatarRecipe) => void`.

```tsx
<ProfileLayout onAvatarChange={(avatar) => save({ avatar })} … />
```

#### `onBannerChange`

With it, the banner shows its edit button and editor; it receives the recipe when the editor is saved. **Type:** `(pattern: PolyPattern) => void`.

#### `subtitle`

Anything under the name, e.g. a short line. **Type:** `ReactNode`.

#### `actions`

Buttons to the right of the name, e.g. "Add friend". They wrap under the name when there's no room. **Type:** `ReactNode`.

```tsx
<ProfileLayout actions={<Button variant="outlined">Add friend</Button>} … />
```

#### `sidebar`

The identity sidebar's content, in an `<aside>`, with 20px between its children. **Type:** `ReactNode`.

#### `children`

The main column, e.g. the profile's [Tabs](../composites/tabs.md). **Type:** `ReactNode`.

## Examples

### Example: Basic

An editable avatar and banner, an action, a sidebar line and two tabs.

```example
ui-library/profile-layout/basic
```

## Accessibility

- **Heading:** the name is the page's `<h1>`.
- **Landmarks:** the sidebar is an `<aside>` labelled "About this profile". Put ProfileLayout inside a `<main>`, as FullWidthLayout provides.
- **Images:** the avatar and banner are labelled with the name.

## Notes

- **Breakpoint:** the sizes and the stacking switch at 768px of the viewport, like the `md` style-prop breakpoint.
- **Profiles:** core's Profile page, its viewers and its slots are described in [Profiles](../../backend/profiles.md).
