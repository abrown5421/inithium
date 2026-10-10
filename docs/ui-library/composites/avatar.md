---
title: Avatar
description: A circular identifier drawn by DiceBear from a small, storable recipe, with an optional editor.
scope: core
tags: [ui, composite, profiles]
order: 4
decisions: ["0065", "0069", "0075"]
component:
  name: Avatar
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: div
---

# Avatar

Avatar is a circular identifier drawn by [DiceBear](https://www.dicebear.com) ([0075](../../decisions/0075-draw-avatars-with-dicebear-from-a-stored-recipe.md)). The picture comes from a small **recipe** (a style, a seed, and optional background, flip, rotation and scale), so the same recipe always draws the same avatar. That recipe is what gets stored, e.g. as a user's profile avatar.

With `editable`, a pencil button on the circle's edge opens an editor. There you pick a style and step through random avatars in it with ← and →.

## Import

```tsx
import { Avatar } from '@inithium/shared-ui-composites';
```

## The recipe

An `AvatarRecipe` (schema `avatarRecipeSchema` in `@inithium/shared-contracts`):

| Field | Type | Description |
| --- | --- | --- |
| `style` | one of the [styles](#styles) | The DiceBear style. |
| `seed` | string | Picks the avatar within its style. |
| `backgroundColor` | [`Colour`](../style-props.md#colour-value), optional | The circle's colour; `'transparent'` for none. Leave it out for the style's own. |
| `flip` | `'none'` \| `'horizontal'` \| `'vertical'` \| `'both'`, optional | Mirrors the art. Default `'none'`. |
| `rotate` | 0–360, optional | Turns the art, in degrees. Default 0. |
| `scale` | 50–200, optional | Sizes the art within the circle, in percent. Default 100. |

```ts
import type { AvatarRecipe } from '@inithium/shared-contracts';

const avatar: AvatarRecipe = { style: 'bottts', seed: 'k3x9q1za', backgroundColor: { color: 'accent', intensity: 200 } };
```

`createAvatarRecipe()` returns a new initials recipe with a random seed, and `createAvatarSeed()` a random seed. `avatarStyleName(style)` gives a style's display name. All three are exported from `@inithium/shared-ui-composites`; the style list is `avatarStyles` in `@inithium/shared-contracts`.

### Styles

`initials` (the default), `blobs`, `bottts`, `cameo`, `disco`, `gaze`, `glass`, `glyphs`, `landscape`, `loops`, `moods`, `patchwork`, `planets` and `rings`. No other DiceBear styles are offered. Each style's definition loads the first time it's drawn. Until then, the circle shows its background at the same size.

**Initials** draw the initials of [`name`](#name), or of the seed when there's no name. Their circle's colour comes from the seed (a theme token or one of nine Tailwind colours, at 600), so a new seed changes the colour, not the letters.

### Credits

Twelve styles are by DiceBear under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Two need credit, which the editor also shows while they're chosen:

- **Glyphs:** a remix of "[Abstract Avatars for All Creative Profile Use](https://www.figma.com/community/file/1249154526125777853)" by Matt Houser, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- **Bottts:** a remix of "[Bottts](https://bottts.com/)" by Pablo Stanley, free for personal and commercial use.

Every avatar's SVG also carries its style's licence in its metadata.

## Props at a glance

Type names such as `Size`, `Sides` and `Variants<T>` are defined on [Style props](../style-props.md).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`value`, `defaultValue`, `onChange`](#value-defaultvalue-and-onchange) | `AvatarRecipe` | random initials | The recipe |
| [`editable`](#editable) | `boolean` | `false` | Edit button and editor |
| [`name`](#name) | `string` | none | The initials style's letters |
| [`label`](#label) | `string` | none (decorative) | Describes the avatar |
| [`width`, `height`](#width-and-height) | `Variants<Size>` | `40` | Size |
| [`margin`](#margin) | `Variants<Sides>` | none | Spacing, px |
| [`animation`](#animation) | `Animation` | none | Animations |

## Props

#### `value`, `defaultValue` and `onChange`

The recipe. Pass `value` to control it, or `defaultValue` to let the avatar hold its own. Without either, it starts as initials with a random seed, so pass a recipe when it must look the same on the next visit. `onChange` receives the new recipe when the editor is saved, with default values left out. **Type:** `AvatarRecipe`, `(recipe: AvatarRecipe) => void`.

```tsx
const [avatar, setAvatar] = useState<AvatarRecipe>(saved);
<Avatar editable name={user.name} value={avatar} onChange={setAvatar} width={96} height={96} />
```

#### `editable`

Shows a round pencil button on the circle's bottom-right edge, labelled "Edit avatar": 28px, or 24px on avatars under 64px. It opens a [Modal](modal.md) with:

- a 160px preview between **←** and **→**. → shows the next random avatar in the style, and ← goes back through the ones you've seen, starting from the saved one. Changing style keeps the seed, so the arrows still walk the same list;
- **Style:** all 14 styles as thumbnails of the current avatar, chosen with a click or the arrow keys;
- **Background** (the style's own, none, or a colour from a [ColorPicker](color-picker.md)) and **Flip**;
- **Rotate** and **Scale** [Sliders](../components/slider.md);
- **Cancel** and **Save**.

Changes stay in a draft until Save. Cancel, ✕, Escape or clicking outside throw the draft away. **Type:** `boolean`. **Default:** `false`.

#### `name`

The person's name. The initials style draws its initials (e.g. "AL" for "Ada Lovelace"); other styles ignore it. **Type:** `string`.

#### `label`

Describes the avatar to screen readers (`role="img"`), e.g. the person's name. Without it the avatar is decorative and hidden from them. **Type:** `string`.

#### `width` and `height`

A [size](../style-props.md#size). The art is clipped to a circle, so keep the two equal; different values make an oval. **Type:** `Variants<Size>`. **Default:** `40` each.

#### `margin`

[Sides](../style-props.md#sides) in px. **Type:** `Variants<Sides>`.

#### `animation`

The [animation prop](../animations/index.md). **Type:** `{ entrance?, exit?, attention? }`.

## Examples

### Example: Basic

Initials from names, and a robot.

```example
ui-library/avatar/basic
```

### Example: Styles

All 14 styles with the same seed.

```example
ui-library/avatar/styles
```

### Example: Sizes

From 24px to 128px; the edit button shrinks on small avatars.

```example
ui-library/avatar/sizes
```

### Example: Editable

Click the pencil, pick a style and step through avatars; the saved recipe shows beside it.

```example
ui-library/avatar/editable
```

### Example: Background and transforms

The style's own background, a theme colour, none, and flip, rotate and scale.

```example
ui-library/avatar/background-and-transforms
```

### Example: Profile header

An editable Avatar over an editable [PolyBanner](poly-banner.md).

```example
ui-library/avatar/profile-header
```

## Accessibility

- **The avatar** is decorative and hidden from screen readers unless you give a `label`.
- **The edit button** is labelled "Edit avatar" and has a tooltip. The editor is a [Modal](modal.md#accessibility): focus moves into it and back to the button when it closes.
- **In the editor**, the arrows are labelled "Previous avatar" and "Next avatar", and the style thumbnails are a radio group named "Style" (the arrow keys move between them).

## Notes

- **Backgrounds in theme colours** are drawn by the circle, not DiceBear, so they follow a re-brand. Styles without a background of their own sit on surface 200.
- **Rendering:** DiceBear builds each SVG in the browser and escapes everything it writes, including the name's initials. Ids inside each SVG are made unique, so the same avatar can appear many times on a page.
- **Schemas:** `avatarRecipeSchema` (type `AvatarRecipe`, with `avatarStyles`, `avatarFlips` and `avatarLimits`) and `avatarPropsSchema` (type `AvatarSerializableProps`) in `@inithium/shared-contracts`. The recipe isn't part of the stored props; store it as data.
