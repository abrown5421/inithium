---
title: Loader
description: A loading indicator in ten variants, from a spinner to a progress bar, in one colour and announced to screen readers.
scope: core
tags: [ui, component, feedback]
order: 7
decisions: ["0042", "0048", "0054", "0058"]
component:
  name: Loader
  layer: component
  import: '@inithium/shared-ui-components'
  element: span
---

# Loader

Loader shows that something is happening ([0058](../../decisions/0058-show-loading-with-css-loader-variants.md)). It plays one of ten animations in a single `color`. Nine are square and sized in pixels, like an [Icon](icon.md); `progress` is a thin bar that slides while the amount is unknown, or fills to a `value` when it is known. Screen readers hear "Loading", or your `label`.

For a button that's busy, use [Button's `loading`](button.md#loading) instead; it uses the same spinner.

## Import

```tsx
import { Loader } from '@inithium/shared-ui-components';
```

## Props at a glance

Type names such as `Colour`, `Sides`, `Size` and `Variants<T>` are defined on [Style props](../style-props.md). No prop is required.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`variant`](#variant) | `'spinner' \| 'dots' \| 'bars' \| 'pulse' \| 'progress' \| 'ring' \| 'orbit' \| 'wave' \| 'grid' \| 'segments'` | `'spinner'` | Which animation plays |
| [`color`](#color) | `Colour` (not `'transparent'`) | `'primary'` | The moving part |
| [`size`](#size) | `number` | `24` | Width and height, px |
| [`value`](#value) | `number` (0–100) | none | Progress, for `progress` |
| [`label`](#label) | `string` | `'Loading'` | Announced to screen readers |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | none | Spacing, px |
| [`width`](#width) | `Variants<Size>` | `'full'` | Width of `progress` |
| [`animation`](#animation) | `Animation` | none | Animations |
| [`show`, `replay`, `onEntranceEnd`, `onExitEnd`](#runtime-props) | | | Runtime animation control |
| [HTML attributes and `ref`](#html-attributes-and-ref) | | | `id`, `aria-*`, `ref` |

## Props

### Look

#### `variant`

Which animation plays. **Type:** `'spinner' | 'dots' | 'bars' | 'pulse' | 'progress' | 'ring' | 'orbit' | 'wave' | 'grid' | 'segments'`. **Default:** `'spinner'`.

| Variant | Looks like |
| --- | --- |
| `spinner` | A faint ring with an arc turning around it |
| `dots` | Three dots growing in turn |
| `bars` | Four bars rising and falling, like an equaliser |
| `pulse` | Rings spreading out from the centre and fading |
| `progress` | A 4px bar: a sliding segment, or filled to `value` |
| `ring` | Two arcs, an outer and an inner one, turning in opposite directions |
| `orbit` | A dot circling a faint track |
| `wave` | Four dots rising and falling in a wave |
| `grid` | A 3×3 grid of squares fading in a diagonal sweep |
| `segments` | Eight short strokes around a circle fading in turn, like the iOS spinner |

```tsx
<Loader />                      // spinner
<Loader variant="dots" />
<Loader variant="bars" />
<Loader variant="pulse" />
<Loader variant="progress" />
<Loader variant="ring" />
<Loader variant="orbit" />
<Loader variant="wave" />
<Loader variant="grid" />
<Loader variant="segments" />
```

#### `color`

The moving part. The spinner's ring, the orbit's track and the progress track use the same colour at 20% opacity. **Type:** [`Colour`](../style-props.md#colour-value), except `'transparent'`. **Default:** `'primary'`.

```tsx
<Loader color="secondary" />
<Loader variant="dots" color="emerald" />
<Loader variant="progress" color={{ color: 'violet', intensity: 700 }} />
```

#### `size`

Width and height in px. Every part (rings, dots, bars, squares, strokes) scales with it. `progress` ignores it. **Type:** `number`. **Default:** `24`.

```tsx
<Loader size={16} />     // inline with text
<Loader size={48} />     // a page or panel loading
```

### Progress

#### `value`

How far along, from 0 to 100, for `variant="progress"`. With a `value` the bar fills to it and is announced as a progress bar with its percentage; without one, a segment slides along the track. Values outside 0–100 are clamped. **Type:** `number`.

```tsx
<Loader variant="progress" />                                    // unknown amount
<Loader variant="progress" value={uploaded} label="Upload progress" />  // known amount
```

#### `width`

The progress bar's width, as a [size](../style-props.md#size); the other variants use `size`. **Type:** `Variants<Size>`. **Default:** `'full'`.

```tsx
<Loader variant="progress" width={240} />
```

### Accessibility

#### `label`

What's loading, announced to screen readers and never shown. **Type:** `string`. **Default:** `'Loading'`.

```tsx
<Loader label="Loading your orders" />
```

### Spacing

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px. **Type:** `Variants<Sides>`.

```tsx
<Text><Loader size={16} margin={{ right: 8 }} />Saving…</Text>
```

### Animation

#### `animation`

The entrance, exit and attention animations every component has ([Animation](../animations/index.md)); they're separate from the loading animation. **Type:** `{ entrance?, exit?, attention? }`.

```tsx
<Loader show={loading} animation={{ entrance: { name: 'fadeIn' }, exit: { name: 'fadeOut' } }} />
```

#### Runtime props

`show`, `replay`, `onEntranceEnd` and `onExitEnd` work as on every component ([Animation: runtime props](../animations/index.md#runtime-props)).

### HTML attributes and `ref`

Other attributes go to the outer `<span>`, and `ref` receives it. There is no `className`, `style` or `children`.

```tsx
<Loader id="orders-loader" data-testid="orders-loader" />
```

## Examples

### Example: Variants

All ten variants at their default size and colour.

```example
ui-library/loader/variants
```

### Example: Colours and sizes

Different sizes and colours, from a 16px inline spinner to a 48px pulse.

```example
ui-library/loader/colours-and-sizes
```

### Example: Progress

A sliding bar while the amount is unknown, and a bar that fills as a simulated upload runs.

```example
ui-library/loader/progress
```

### Example: Loading then content

A loader stands in for content while it's fetched, then the content fades in. Press Reload to see it again.

```example
ui-library/loader/loading-then-content
```

### Example: Inline with text

A small spinner at the start of a line.

```example
ui-library/loader/inline-with-text
```

## Accessibility

- **Announced, not just shown:** a Loader is a `role="status"` live region holding its `label`, so screen readers say "Loading" (or your label) politely, without interrupting.
- **Progress with a `value`** is a `role="progressbar"` with `aria-valuenow`, so screen readers can read its percentage.
- **Label what's loading** when there's more than one loader on a page ("Loading orders", not just "Loading").
- **Reduced motion:** with "reduce motion" turned on, nothing spins, bounces or slides. Each variant fades gently instead, so it still looks busy rather than frozen.
- **Mark the region that's loading** with `aria-busy` if a screen reader user might reach it before it's ready.

## Notes

- **Speeds are fixed:** 0.8s for the spinner and segments, 1s for dots, bars, orbit and wave, 1.2s for pulse, ring, grid and the sliding bar.
- **Inline:** Loader is an inline element and centres on a line of text; `progress` is a block that fills its container.
- **Pure CSS:** the animations are CSS keyframes published by `<UiProvider />`; there's no extra dependency.
- **Not yet:** a delay before showing (to avoid a flash on fast loads) and a full-page overlay. Both can be built from `show` and a [Container](container.md).
- **Schemas:** `loaderPropsSchema` (type `LoaderSerializableProps`) and `loaderStylePropsSchema` in `@inithium/shared-contracts`. `value` isn't part of the stored props.
