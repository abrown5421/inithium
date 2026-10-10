---
title: PolyBanner
description: A low-poly triangle pattern banner drawn from a small, storable recipe, with an optional editor.
scope: core
tags: [ui, composite, profiles]
order: 11
decisions: ["0065", "0069", "0070", "0074"]
component:
  name: PolyBanner
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: div
---

# PolyBanner

PolyBanner draws a low-poly pattern: a jittered grid of triangles coloured by a gradient across and a gradient down ([0074](../../decisions/0074-generate-banners-as-our-own-poly-pattern.md)). It's our own take on Trianglify, which is no longer maintained. The whole pattern comes from a small **recipe** (cell size, variance, colours and a seed), so the same recipe draws the same banner every time. That recipe is what gets stored, e.g. as a user's profile banner.

With `editable`, a pencil button in the top-right corner opens an editor where users change the recipe and see a live preview.

## Import

```tsx
import { PolyBanner } from '@inithium/shared-ui-composites';
```

## The recipe

A `PolyPattern` (schema `polyPatternSchema` in `@inithium/shared-contracts`):

| Field | Type | Description |
| --- | --- | --- |
| `cellSize` | integer, 25–250 | The grid's cell size in px. Larger is coarser. Default 75. |
| `variance` | 0–1 | How far each grid point wanders: 0 is a regular grid, 1 the most random. Default 0.75. The editor moves in steps of 0.05. |
| `xColors` | 1–8 colours | The gradient from left to right. |
| `yColors` | 1–8 colours, optional | The gradient from top to bottom. Leave it out to reuse `xColors`. |
| `seed` | string | Makes the randomness repeatable. The editor's Shuffle button picks a new one. |

Each colour is `{ color, intensity }`: a theme token or Tailwind colour at any intensity, without opacity (see [Colour value](../style-props.md#colour-value)). A triangle's colour is the x gradient at its centre mixed half and half with the y gradient.

```ts
import type { PolyPattern } from '@inithium/shared-contracts';

const banner: PolyPattern = {
  cellSize: 75,
  variance: 0.75,
  xColors: [{ color: 'primary', intensity: 200 }, { color: 'primary', intensity: 800 }],
  seed: 'k3x9q1za',
};
```

`createPolyPattern()` returns the default recipe (cell size 75, variance 0.75, primary 200 → 500 → 800) with a random seed, `createPolySeed()` a random seed, and `DEFAULT_POLY_PATTERN` the defaults without one, all from `@inithium/shared-ui-composites`.

## Props at a glance

Type names such as `Size`, `Sides` and `Variants<T>` are defined on [Style props](../style-props.md).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`value`, `defaultValue`, `onChange`](#value-defaultvalue-and-onchange) | `PolyPattern` | a random default | The recipe |
| [`editable`](#editable) | `boolean` | `false` | Edit button and editor |
| [`children`](#children) | `ReactNode` | none | Content over the pattern |
| [`label`](#label) | `string` | none (decorative) | Describes the banner |
| [`width`, `height`](#width-and-height) | `Variants<Size>` | `'full'`, `200` | Size |
| [`minWidth`, `maxWidth`, `minHeight`, `maxHeight`](#width-and-height) | `Variants<Size>` | none | Size limits |
| [`radius`](#radius) | `Variants<Radius>` | none | Corners |
| [`margin`](#margin) | `Variants<Sides>` | none | Spacing, px |
| [`animation`](#animation) | `Animation` | none | Animations |

## Props

#### `value`, `defaultValue` and `onChange`

The recipe. Pass `value` to control it, or `defaultValue` to let the banner hold its own. Without either, it starts from the default recipe with a random seed (so pass one when the banner must look the same on the next visit). `onChange` receives the new recipe when the editor is saved. **Type:** `PolyPattern`, `(pattern: PolyPattern) => void`.

```tsx
const [banner, setBanner] = useState<PolyPattern>(saved);
<PolyBanner editable value={banner} onChange={setBanner} />
```

#### `editable`

Shows a pencil button in the top-right corner, labelled "Edit banner". It opens a [Modal](modal.md) with:

- a live preview in the banner's shape and density;
- **Cell size** and **Variance** [Sliders](../components/slider.md);
- **X colours**, an [AutoIncrementingList](auto-incrementing-list.md) of [ColorPickers](color-picker.md), and **Y colours** likewise, hidden while **Same as X colours** is on;
- **Shuffle** (a new seed), **Cancel** and **Save**.

Changes stay in a draft until Save. Cancel, ✕, Escape or clicking outside throw the draft away. **Type:** `boolean`. **Default:** `false`.

#### `children`

Anything drawn over the pattern, e.g. a name and an avatar, filling the banner's height. The edit button stays on top. **Type:** `ReactNode`.

#### `label`

Describes the banner to screen readers (`role="img"`). Without it the pattern is decorative and hidden from them. **Type:** `string`.

#### `width` and `height`

A [size](../style-props.md#size), with `minWidth`, `maxWidth`, `minHeight` and `maxHeight`. The pattern is drawn for the banner's real size and redrawn when it changes: a wider banner shows more of the same pattern, and the gradients stretch to fit. **Type:** `Variants<Size>`. **Default:** `'full'` and `200`.

#### `radius`

The corners, as a [radius](../style-props.md#radius); the pattern is clipped to them. **Type:** `Variants<Radius>`.

#### `margin`

[Sides](../style-props.md#sides) in px. **Type:** `Variants<Sides>`.

#### `animation`

The [animation prop](../animations/index.md). **Type:** `{ entrance?, exit?, attention? }`.

## Examples

### Example: Basic

The default recipe with a fixed seed.

```example
ui-library/poly-banner/basic
```

### Example: Editable

Click the pencil to change the pattern; the saved recipe shows underneath.

```example
ui-library/poly-banner/editable
```

### Example: Recipes

A regular grid, a two-gradient wash and big, random cells across five colours.

```example
ui-library/poly-banner/recipes
```

### Example: Cell size and variance

One recipe with a fine and a coarse grid, and with no and full variance.

```example
ui-library/poly-banner/cell-size-and-variance
```

### Example: With content

A profile-style banner with an avatar and a name over it.

```example
ui-library/poly-banner/with-content
```

## Accessibility

- **The pattern** is decorative and hidden from screen readers unless you give a `label`.
- **The edit button** is labelled "Edit banner" and has a tooltip. The editor is a [Modal](modal.md#accessibility): focus moves into it and back to the button when it closes.
- **Contrast:** text over the pattern needs colours that stand out across the whole gradient. A darker or lighter recipe, or a backing behind the text, helps.

## Notes

- **Theme colours stay live:** fills mix theme variables in CSS, so a re-brand or dark mode recolours every banner. Tailwind colours don't change in dark mode.
- **Drawing:** an SVG of triangles from a grid reaching one cell past each edge. Each point moves up to half a cell × `variance`, from a random number tied to the seed and its place in the grid. Each cell splits along the diagonal a Delaunay triangulation would pick.
- **Performance:** a 1200 × 300 banner is about 250 triangles at cell size 75, and about 1,600 at 25.
- **Schemas:** `polyPatternSchema` (type `PolyPattern`, colours `PolyPatternColor`, limits `polyPatternLimits`) and `polyBannerPropsSchema` (type `PolyBannerSerializableProps`) in `@inithium/shared-contracts`. The recipe isn't part of the stored props; store it as data.
