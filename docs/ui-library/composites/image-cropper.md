---
title: ImageCropper
description: Crops an image to a shape, or fits the whole image inside it on a background, before it's uploaded; renderCrop draws the result.
scope: core
tags: [ui, composite, media, forms]
order: 15
decisions: ["0063", "0092", "0098"]
component:
  name: ImageCropper
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: div
---

# ImageCropper

ImageCropper is the step after choosing an image ([0098](../../decisions/0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)). It shows the image under a frame in the shape it will take: a circle for an avatar, a 4:1 strip for a banner, and so on. Drag to move it, scroll or use the Zoom slider to zoom, and the Rotate slider to turn it. In fit mode the image can shrink inside the shape, with a background around it.

It reports what to keep; it doesn't make the image. Call `renderCrop()` with that to draw the result in the browser, then upload it. The upload form in `@inithium/shared-media` does all of this.

It wraps [react-easy-crop](https://github.com/ValentinH/react-easy-crop). Its frame is the library's own; never use react-easy-crop directly.

## Import

```tsx
import { ImageCropper, renderCrop, type ImageCrop } from '@inithium/shared-ui-composites';
```

## Props at a glance

`src`, `aspect` and `onCropChange` are required. ImageCropper takes no style props.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`src`](#src) | `string` | required | The image, e.g. an object URL for a chosen file |
| [`aspect`](#aspect) | `number` | required | The shape's width ÷ height |
| [`shape`](#shape) | `'rect' \| 'round'` | `'rect'` | A rectangle, or a circle |
| [`mode`](#mode) | `'crop' \| 'fit'` | `'crop'` | Fill the shape, or fit the image inside it |
| [`background`](#background) | `Colour` | surface 900 | Around the image in fit mode |
| [`height`](#height) | `number` | `320` | Height of the cropping area, px |
| [`onCropChange`](#oncropchange) | `(crop: ImageCrop) => void` | required | Called with the area to keep and the rotation |

## Props

#### `src`

The image to crop. For a chosen file, `URL.createObjectURL(file)`; revoke it when you're done. **Type:** `string`. **Required.**

```tsx
<ImageCropper src={previewUrl} aspect={1} onCropChange={setCrop} />
```

#### `aspect`

The shape's width divided by its height. **Type:** `number`. **Required.**

```tsx
<ImageCropper src={src} aspect={1} onCropChange={setCrop} />      // square
<ImageCropper src={src} aspect={16 / 9} onCropChange={setCrop} /> // wide
<ImageCropper src={src} aspect={4} onCropChange={setCrop} />      // a banner strip
```

#### `shape`

`'round'` shows a circle (with `aspect={1}`), e.g. for an avatar. The result is still square; the circle shows what an avatar will show. **Type:** `'rect' | 'round'`. **Default:** `'rect'`.

```tsx
<ImageCropper src={src} aspect={1} shape="round" onCropChange={setCrop} />
```

#### `mode`

`'crop'` fills the shape and cuts off whatever doesn't fit. `'fit'` lets the image zoom out to 20% and move freely, so all of it can sit inside the shape, with `background` around it. Switching back to crop zooms in until the image fills the shape again. **Type:** `'crop' | 'fit'`. **Default:** `'crop'`.

```tsx
<ImageCropper src={src} aspect={1} mode="fit" background="surface" onCropChange={setCrop} />
```

#### `background`

The colour shown around the image in fit mode, as a [colour value](../style-props.md). Pass the same colour to `renderCrop()` so the result matches. **Type:** `Colour`. **Default:** surface 900.

```tsx
<ImageCropper src={src} aspect={1} mode="fit" background={{ color: 'surface', intensity: 50 }} onCropChange={setCrop} />
```

#### `height`

The cropping area's height, in px. It fills the width it's given. **Type:** `number`. **Default:** `320`.

```tsx
<ImageCropper src={src} aspect={16 / 9} height={240} onCropChange={setCrop} />
```

#### `onCropChange`

Called whenever a move, zoom or turn settles, with `{ area: { x, y, width, height }, rotation }`: the part to keep, in the image's own pixels, and the rotation in degrees. **Type:** `(crop: ImageCrop) => void`. **Required.**

```tsx
const crop = useRef<ImageCrop | null>(null);
<ImageCropper src={src} aspect={1} onCropChange={(next) => (crop.current = next)} />
```

### `renderCrop(src, crop, options?)`

Draws the crop to a new image in the browser and resolves a WebP blob (PNG where the browser can't write WebP).

- `options.background`: a CSS colour filling anything outside the image (fit mode). Canvases can't read CSS variables, so resolve a theme colour first (`resolveCssColor()` in `@inithium/shared-media` does this).
- `options.maxSide`: the longest side of the result, in px. Default 2560, the most the api keeps.

```tsx
const blob = await renderCrop(previewUrl, crop, { background: '#f8fafc', maxSide: 1024 });
```

## Examples

### Example: Crop and fit

A wide shape, switching between filling it and fitting the whole picture inside, with the area that would be kept.

```example
ui-library/image-cropper/crop-and-fit
```

### Example: Round avatar

A circle, and Crop drawing the result with `renderCrop()`.

```example
ui-library/image-cropper/round-avatar
```

## Accessibility

- The Zoom and Rotate [Sliders](../components/slider.md) work from the keyboard. Moving the image needs a pointer or touch.
- Say what the shape is for near the cropper, e.g. a "Shape" field, since the frame alone isn't announced.

## Notes

- SVG, ICO and GIF files aren't cropped: SVGs would lose their vectors, and GIFs their animation. The upload form sends them as they are.
- The api re-encodes the result, shrinking it to fit 2 MB, so `renderCrop()` doesn't need to.
