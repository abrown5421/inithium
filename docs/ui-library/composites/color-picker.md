---
title: ColorPicker
description: A field for choosing a colour, theme or Tailwind, at any intensity, from swatches and a slider in a panel below it.
scope: core
tags: [ui, composite, forms, colour]
order: 4
decisions: ["0055", "0056", "0067", "0068", "0069"]
component:
  name: ColorPicker
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: input
---

# ColorPicker

ColorPicker lets the user choose a colour ([0069](../../decisions/0069-pick-colours-from-swatches-and-an-intensity-slider.md)). It's an [Input](../components/input.md) field showing the colour's name ("Emerald 500") with a swatch of it at the end. Clicking the field opens a panel below it with two [tabs](tabs.md): **Theme**, the six theme tokens; and **More colours**, Tailwind's 26 colours. Under them, a [slider](../components/slider.md) sets the intensity from 50 to 950. Every swatch shows its colour at the current intensity.

Its value is a [colour value](../style-props.md#colour-value), `{ color, intensity }`, so a picked colour goes straight into any colour prop: `bgColor={picked}`. Theme colours are stored as references, so they follow the theme when it changes ([0067](../../decisions/0067-colour-values-with-the-full-palette-in-cms-controls.md)).

Use it in the web app (e.g. an avatar or banner colour) and in the CMS's page editor. The theme's own colours aren't picked here; they're set as hex codes in the theme settings.

## Import

```tsx
import { ColorPicker, type PickedColor } from '@inithium/shared-ui-composites';
```

## Props at a glance

Type names such as `Colour`, `Sides`, `Size` and `Variants<T>` are defined on [Style props](../style-props.md). No prop is required, but every ColorPicker needs a `label` or an `aria-label`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`value`, `defaultValue`, `onValueChange`](#value-defaultvalue-and-onvaluechange) | `PickedColor` | none chosen | The colour |
| [`palette`](#palette) | `'all' \| 'theme'` | `'all'` | Which colours are offered |
| [`label`, `placeholder`, `helperText`](#label-placeholder-and-helpertext) | `string` | none | As on Input |
| [`error`, `required`, `disabled`](#error-required-and-disabled) | | | As on Input |
| [`name`](#name) | `string` | none | Form submission |
| [`variant`, `color`](#variant-and-color) | | `'outlined'`, `'primary'` | The field's look, the panel's accent |
| [`margin`, `padding`, `width`, `minWidth`, `maxWidth`](#spacing-and-sizing) | | width `'full'` | As on Input |
| [`animation`](#animation) | `Animation` | none | Animations |

## Props

#### `value`, `defaultValue` and `onValueChange`

The chosen colour: `{ color, intensity }`, where `color` is a theme token or Tailwind colour and `intensity` one of 50, 100, …, 950. Pass `value` to control the picker, or `defaultValue` to let it hold its own. `onValueChange` fires on every pick and every intensity change. **Type:** `PickedColor`, `(value: PickedColor) => void`. **Default:** nothing chosen.

```tsx
const [background, setBackground] = useState<PickedColor>({ color: 'violet', intensity: 500 });
<ColorPicker label="Avatar background" value={background} onValueChange={setBackground} />
<Container bgColor={background} … />
```

Picking a swatch keeps the current intensity; moving the slider keeps the current colour. Before anything is chosen, the slider sets the intensity the first pick will use (500 to start).

#### `palette`

`'all'` shows both tabs: Theme and More colours. `'theme'` shows the theme tokens alone, with no tab bar. **Type:** `'all' | 'theme'`. **Default:** `'all'`.

```tsx
<ColorPicker label="Brand colour" palette="theme" />
```

#### `label`, `placeholder` and `helperText`

As on [Input](../components/input.md#label): the floating label (it floats once a colour is chosen), the text shown while nothing is chosen, and a line of guidance under the field. **Type:** `string`.

#### `error`, `required` and `disabled`

As on [Input](../components/input.md#error). The error hides itself when a colour is picked, and shows again when `error` changes. A disabled picker doesn't open. **Type:** `boolean | string`, `boolean`, `boolean`.

#### `name`

Inside a form, the colour submits under `name` as `color-intensity`, e.g. `emerald-500`. **Type:** `string`.

#### `variant` and `color`

The field's [variant](../components/input.md#variant) (`outlined`, `filled` or `standard`), and the accent: the field's focus colour, the tab underline, the slider, and the ring around the chosen swatch. **Type:** `'outlined' | 'filled' | 'standard'`, `Colour`. **Default:** `'outlined'`, `'primary'`.

#### Spacing and sizing

`margin`, `padding`, `width`, `minWidth` and `maxWidth`, as on Input. The panel is always as wide as the field. **Default:** `width: 'full'`.

#### `animation`

The [animation prop](../animations/index.md), for the field. **Type:** `{ entrance?, exit?, attention? }`.

## Examples

### Example: Basic

A picker with a colour already chosen. Open it, switch tabs, pick, and drag the intensity.

```example
ui-library/color-picker/basic
```

### Example: Live preview

The picked colour drives an avatar's background, and the stored value is shown.

```example
ui-library/color-picker/live-preview
```

### Example: Theme only

`palette="theme"`: the six theme tokens, no tabs.

```example
ui-library/color-picker/theme-only
```

### Example: Variants

The field's three variants.

```example
ui-library/color-picker/variants
```

### Example: Helper text and error

Press Save without a colour to show the error; picking one clears it.

```example
ui-library/color-picker/helper-text-and-error
```

### Example: In a form

The colour submits under the picker's `name`.

```example
ui-library/color-picker/in-a-form
```

## Accessibility

- **The field** is a read-only text field announcing the chosen colour's name, with `aria-haspopup="dialog"` and `aria-expanded`. Click it, or press Enter, Space or the down arrow, to open the panel.
- **The panel** is a dialog named after the field. Tab moves through the tabs, the swatches and the slider; Escape closes it and focus returns to the field.
- **Swatches** are a radio group per tab: Tab reaches the chosen swatch (or the first), the arrow keys move between swatches and pick, wrapping at the ends. Each swatch is named, e.g. "Emerald 500", and shows its name in a tooltip on hover.
- **The slider** announces the intensity (e.g. "500"); the arrow keys step through the eleven intensities.
- **Not colour alone:** the field and each swatch carry the colour's name.

## Notes

- **The panel** opens 4px below the field, as wide as it, at z-index 50 (the popup layer), and closes on an outside click or Escape. Picking doesn't close it, so you can adjust the intensity.
- **Swatches** are 6 to a row, square, with a 6px radius; the chosen one has a 2px ring in `color`.
- **No opacity or transparent** for now.
- **Schemas:** `colorPickerPropsSchema` (type `ColorPickerSerializableProps`) and `colorPickerPaletteSchema` in `@inithium/shared-contracts`. `value`, `error` and `disabled` aren't stored.
