---
title: ProfileLayout
description: A profile's full-width frame like the CMS, with a banner, a raised identity sidebar (avatar, name, actions) and the main column.
scope: core
tags: [ui, layout, profiles]
order: 4
decisions: ["0074", "0075", "0081", "0090", "0091", "0092", "0099", "0124"]
component:
  name: ProfileLayout
  layer: layout
  import: '@inithium/shared-ui-layouts'
  element: div
---

# ProfileLayout

ProfileLayout draws a profile's frame at full width, laid out like the CMS frame ([0081](../../decisions/0081-extend-the-profile-page-through-slots-by-viewer.md), [0090](../../decisions/0090-generate-and-show-user-profiles.md), [0091](../../decisions/0091-make-pages-full-width-by-default.md)):

- a full-width [PolyBanner](../composites/poly-banner.md), 140px tall on phones and 220px from 768px;
- under it, a raised **identity sidebar** on the left: surface 100 with the `2xl` [shadow](../style-props.md), 320px wide, drawn above the main column. It starts with the [Avatar](../composites/avatar.md) (96px, or 128px from 768px) in a surface 100 ring, overlapping the banner's bottom edge by half. Then come the name as the page's `<h1>`, any actions, and the sidebar's content;
- the **main column** on the right, surface 200, with 32px padding (24px on phones).

The columns fill the height they're given, so they run down to the Footer. Below 768px the sidebar stacks above the main column, its shadow falling on it. ProfileLayout is built entirely from Containers ([0092](../../decisions/0092-build-ui-from-the-library-before-plain-elements.md)), with no stylesheet of its own.

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
| [`avatarImage`, `bannerImage`](#avatarimage-and-bannerimage) | `{ src: string }` | none | Uploaded pictures shown instead |
| [`onAvatarUpload`, `onBannerUpload`](#onavatarupload-and-onbannerupload) | `() => void` | none | Adds Upload a picture to the editors |
| [`avatarPresence`](#avatarpresence) | `{ color, label }` | none | The avatar's status light |
| [`subtitle`](#subtitle) | `ReactNode` | none | Under the name |
| [`actions`](#actions) | `ReactNode` | none | Buttons under the name |
| [`sidebar`](#sidebar) | `ReactNode` | none | The rest of the sidebar |
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

#### `avatarImage` and `bannerImage`

Uploaded pictures shown instead of the generated avatar and banner, which stay as their fallbacks: the Avatar's and PolyBanner's `image` ([0099](../../decisions/0099-store-cloud-files-in-r2-and-let-members-upload-profile-pictures.md)). **Type:** `{ src: string }`. **Default:** none.

```tsx
<ProfileLayout name={name} avatar={avatar} banner={banner} avatarImage={profileImage(profile.avatarAssetId)} />
```

#### `onAvatarUpload` and `onBannerUpload`

Add **Upload a picture** to the avatar's and the banner's editors (their `onUpload`). The Profile page passes them only to the owner, in the `cloud-all` storage mode. **Type:** `() => void`. **Default:** none.

```tsx
<ProfileLayout {...props} onAvatarChange={saveAvatar} onAvatarUpload={() => setUploading('avatar')} />
```

#### `avatarPresence`

The profile's status light on the avatar, passed to Avatar's [`presence`](../composites/avatar.md#presence) ([0124](../../decisions/0124-show-who-is-online-with-a-status-light-on-avatars.md)). The Profile page passes `useUserPresence(profile.id)`. **Type:** `{ color: SolidColorValue; label: string }`. **Default:** none.

```tsx
<ProfileLayout {...props} avatarPresence={useUserPresence(profile.id)} />
```

#### `subtitle`

Anything under the name, e.g. a short line. **Type:** `ReactNode`.

#### `actions`

Buttons under the name, e.g. "Add friend", wrapping onto more lines when needed. **Type:** `ReactNode`.

```tsx
<ProfileLayout actions={<Button variant="outlined">Add friend</Button>} … />
```

#### `sidebar`

The rest of the identity sidebar, under the name and actions, with 24px between its children. The sidebar is an `<aside>`. **Type:** `ReactNode`.

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
