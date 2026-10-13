---
title: Image
description: A picture, as a native img with the UI library's size, corner, border and shadow props, how it fits its box, and an aspect ratio.
scope: core
tags: [ui, component, media]
order: 15
decisions: ["0048", "0092", "0098"]
component:
  name: Image
  layer: component
  import: '@inithium/shared-ui-components'
  element: img
---

# Image

Image draws a picture ([0098](../../decisions/0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)). It's a native `<img>` that takes the UI library's sizing, margin, corner, border and shadow props, so you never need a plain `<img>` ([0092](../../decisions/0092-build-ui-from-the-library-before-plain-elements.md)). For an uploaded file, pass its address from `assetUrl(id)` (`@inithium/shared-contracts`); documents store the asset id, never the address.

Images load lazily by default, so pictures further down the page wait until they're near the screen.

## Import

```tsx
import { Image } from '@inithium/shared-ui-components';
```

## Props at a glance

Type names such as `Size`, `Sides`, `Radius`, `Colour` and `Variants<T>` are defined on [Style props](../style-props.md). Only `src` is required, and `alt` unless the image is `decorative`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`src`](#src) | `string` | required | The picture's address |
| [`alt`](#alt) | `string` | `''` | What the picture shows, for screen readers |
| [`decorative`](#decorative) | `boolean` | `false` | Hide it from screen readers |
| [`fit`](#fit) | `'cover' \| 'contain' \| 'fill' \| 'none'` | `cover` with both sides set | How it fills its box |
| [`aspectRatio`](#aspectratio) | `number` | none | Width ÷ height to keep while loading |
| [`loading`](#loading) | `'lazy' \| 'eager'` | `'lazy'` | When the browser fetches it |
| [`width`, `height`, `min*`, `max*`](#sizing) | `Variants<Size>` | none | Size |
| [`margin`](#margin) | `Variants<Sides>` | none | Space around it, px |
| [`radius`](#radius) | `Variants<Radius>` | none | Rounded corners, px |
| [`borderWidth`, `borderColor`, `borderStyle`](#borders) | see Style props | none | A border |
| [`shadow`](#shadow) | `Variants<ShadowSize>` | none | A shadow |
| [`animation`](#animation) | `Animation` | none | Animations |

## Props

### The picture

#### `src`

The picture's address. **Type:** `string`. **Required.**

```tsx
<Image src={assetUrl(logo.assetId)} alt={logo.alt} />
<Image src="/favicon.ico" alt="" decorative />
```

#### `alt`

What the picture shows, read by screen readers and shown if it fails to load. **Type:** `string`. **Default:** `''`.

```tsx
<Image src={src} alt="The team outside the studio" />
```

#### `decorative`

Marks a purely visual picture: it gets an empty `alt` and `aria-hidden`, so screen readers skip it. **Type:** `boolean`. **Default:** `false`.

```tsx
<Image src={pattern} decorative />
```

#### `fit`

How the picture fills its box when the box has a different shape (CSS `object-fit`). **Type:** `'cover' | 'contain' | 'fill' | 'none'`. **Default:** `'cover'` when both `width` and `height` are set, otherwise none (the picture keeps its own shape).

```tsx
<Image src={src} alt="" decorative width={200} height={200} />               // cover: fills, cutting off the edges
<Image src={src} alt="" decorative width={200} height={200} fit="contain" /> // the whole picture, with space around it
```

#### `aspectRatio`

The width divided by the height, held while the picture loads so the page doesn't jump. **Type:** `number`. **Default:** none.

```tsx
<Image src={src} alt="" decorative width="full" aspectRatio={16 / 9} />
```

#### `loading`

When the browser fetches the picture. Use `'eager'` for pictures at the top of the page, such as a logo. **Type:** `'lazy' | 'eager'`. **Default:** `'lazy'`.

```tsx
<Image src={logo} alt="Studio" height={40} loading="eager" />
```

### Sizing

`width`, `height`, `minWidth`, `maxWidth`, `minHeight` and `maxHeight` take a [size](../style-props.md) with variant keys. Images never grow wider than their container (`max-width: 100%`).

```tsx
<Image src={src} alt="" decorative width={320} />
<Image src={src} alt="" decorative width={{ base: 'full', md: 480 }} />
<Image src={logo} alt="Studio" height={40} width="auto" />
```

### Spacing

#### `margin`

Space around the picture, in px. **Type:** `Variants<Sides>`.

```tsx
<Image src={src} alt="" decorative margin={{ bottom: 16 }} />
```

### Borders and shadow

#### `radius`

Rounded corners, in px. **Type:** `Variants<Radius>`.

```tsx
<Image src={src} alt="" decorative radius={{ all: 12 }} />
<Image src={src} alt="" decorative width={96} height={96} radius={{ all: 999 }} /> // a circle
```

#### Borders

`borderWidth`, `borderColor` and `borderStyle`, as on [Container](container.md).

```tsx
<Image src={src} alt="" decorative borderWidth={{ all: 2 }} borderColor="primary" />
```

#### `shadow`

A shadow, by Tailwind's size names. **Type:** `Variants<ShadowSize>`.

```tsx
<Image src={src} alt="" decorative shadow="lg" />
```

### Animation

#### `animation`

Entrance, exit and attention animations, as on every component ([Animations](../animations/index.md)).

```tsx
<Image src={src} alt="" decorative animation={{ entrance: { name: 'fadeIn', when: 'inView' } }} />
```

## Examples

### Example: Basic

A picture at a fixed width, with rounded corners.

```example
ui-library/image/basic
```

### Example: Fit and aspect ratio

The same picture in square boxes, covering, contained and stretched.

```example
ui-library/image/fit-and-aspect-ratio
```

### Example: Styled

A circle with a border and a shadow, full width on phones, zooming in as it scrolls into view.

```example
ui-library/image/styled
```

## Accessibility

- Give every meaningful picture an `alt` that says what it shows. Leave it out only for `decorative` pictures.
- Uploaded assets carry a default alt text, and each use may change it: the Image block and the logo keep their own.

## Notes

- Other `<img>` attributes (`onError`, `onLoad`, `srcSet`, `sizes`, …) pass through. `className` and `style` don't.
- `decoding="async"` is always set.
