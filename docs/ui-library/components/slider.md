---
title: Slider
description: A slider for picking a number or a range, with a filled track in one colour, a value bubble, optional tick marks and a label row showing the value.
scope: core
tags: [ui, component, forms]
order: 11
decisions: ["0048", "0056", "0057", "0063"]
component:
  name: Slider
  layer: component
  import: '@inithium/shared-ui-components'
  element: span
---

# Slider

Slider picks a number, or a range between two numbers, by dragging ([0063](../../decisions/0063-pick-numbers-and-ranges-with-a-slider.md)). Pass a number for one thumb (`defaultValue={40}`) or `[low, high]` for a range (`defaultValue={[20, 80]}`); the value you get back has the same shape. Its behaviour comes from [Radix](https://www.radix-ui.com/primitives/docs/components/slider) ([0056](../../decisions/0056-use-radix-primitives-for-interactive-widgets.md)).

The track is filled in `color` up to the thumb (or between the thumbs). A bubble shows the value above the thumb while it's hovered, focused or dragged, and the label row shows it at the right. Tick marks, with optional labels, can mark the steps. The track sits in a 32px row, so a slider lines up with the other form controls.

## Import

```tsx
import { Slider, type SliderValue } from '@inithium/shared-ui-components';
```

## Props at a glance

Type names such as `Colour`, `Sides`, `Size` and `Variants<T>` are defined on [Style props](../style-props.md). No prop is required, but every Slider needs a `label` or an `aria-label`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`value`, `defaultValue`, `onValueChange`, `onValueCommit`](#value-defaultvalue-onvaluechange-and-onvaluecommit) | `number \| [number, number]` | `min` | The value or range |
| [`min`, `max`, `step`](#min-max-and-step) | `number` | `0`, `100`, `1` | The scale |
| [`minStepsBetweenThumbs`](#minstepsbetweenthumbs) | `number` | `0` | Range thumbs' minimum gap |
| [`marks`](#marks) | `true \| { value, label? }[]` | none | Tick marks |
| [`valueLabel`](#valuelabel) | `'auto' \| 'always' \| 'off'` | `'auto'` | When the bubble shows |
| [`formatValue`](#formatvalue) | `(value: number) => string` | `String` | How values are written |
| [`color`](#color) | `Colour` (not `'transparent'`) | `'primary'` | Fill, thumbs, focus |
| [`label`](#label) | `string` | none | Name, with the value at the right |
| [`helperText`](#helpertext) | `string` | none | Guidance under the slider |
| [`error`](#error) | `boolean \| string` | none | Invalid state and message |
| [`required`](#required) | `boolean` | `false` | Asterisk on the label |
| [`disabled`](#disabled) | `boolean` | `false` | Can't be used |
| [`name`](#name) | `string` | none | Form submission |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | none | Spacing, px |
| [`width`, `minWidth`, `maxWidth`](#width-minwidth-and-maxwidth) | `Variants<Size>` | `'full'` | Width |
| [`animation`](#animation) | `Animation` | none | Animations |
| [`show`, `replay`, `onEntranceEnd`, `onExitEnd`](#runtime-props) | | | Runtime animation control |
| [`id`, `aria-label`, `aria-describedby` and `ref`](#id-aria-and-ref) | | | |

## Props

### Value

#### `value`, `defaultValue`, `onValueChange` and `onValueCommit`

A number for one thumb, or `[low, high]` for a range. Pass `value` to control the slider, or `defaultValue` to let it hold its own. `onValueChange` fires on every change, including while dragging; `onValueCommit` fires once when a change ends (the thumb is let go, or a key is released), which suits saving. Both receive the same shape you passed. **Type:** `number | [number, number]`. **Default:** uncontrolled, at `min`.

```tsx
<Slider label="Volume" defaultValue={40} />
<Slider label="Price" defaultValue={[20, 80]} />

const [brightness, setBrightness] = useState(70);
<Slider label="Brightness" value={brightness} onValueChange={setBrightness} onValueCommit={save} />
```

#### `min`, `max` and `step`

The scale: the lowest and highest values, and the step between allowed values. **Type:** `number`. **Default:** `0`, `100` and `1`.

```tsx
<Slider label="Rating" min={1} max={5} />
<Slider label="Price" max={200} step={5} defaultValue={[20, 80]} />
```

#### `minStepsBetweenThumbs`

For a range: how many steps apart the two thumbs must stay. **Type:** `number`. **Default:** `0`.

```tsx
<Slider label="Price" step={5} minStepsBetweenThumbs={2} defaultValue={[20, 80]} />   // at least 10 apart
```

### Marks and labels

#### `marks`

Tick marks on the track: `true` for one at every step, or a list of `{ value, label? }`. Labels appear under the track. Ticks on the filled part are light. **Type:** `true | { value: number; label?: string }[]`.

```tsx
<Slider label="Progress" step={25} marks />
<Slider label="Size" min={0} max={2} marks={[{ value: 0, label: 'Small' }, { value: 1, label: 'Medium' }, { value: 2, label: 'Large' }]} />
```

#### `valueLabel`

When the value bubble shows above each thumb: `auto` while it's hovered, focused or dragged; `always`; or `off`. **Type:** `'auto' | 'always' | 'off'`. **Default:** `'auto'`.

```tsx
<Slider aria-label="Opacity" valueLabel="always" />
```

#### `formatValue`

How values are written in the label row, the bubble and for screen readers. It's code, so it isn't part of the stored props. **Type:** `(value: number) => string`. **Default:** `String`.

```tsx
<Slider label="Price" formatValue={(value) => `$${value}`} />
<Slider label="Size" max={2} formatValue={(value) => ['Small', 'Medium', 'Large'][value]} />
```

### Look

#### `color`

The filled part of the track, the thumbs and the keyboard focus outline. **Type:** [`Colour`](../style-props.md#colour-value), except `'transparent'`. **Default:** `'primary'`.

```tsx
<Slider aria-label="Volume" color="secondary" />
```

### Content

#### `label`

The slider's name, above it, with the current value (formatted) at the right of the same row. **Type:** `string`.

#### `helperText`

A line of guidance under the slider, linked to it for screen readers. **Type:** `string`.

### State

#### `error`

Marks the slider invalid: the fill, thumbs and helper text turn `red-500`, whatever `color` is, and the thumbs are announced as invalid. A string is the message, shown in place of `helperText`. Like [Checkbox's](checkbox.md#error), **the error clears itself** when the value changes, and shows again when `error` changes or the form is submitted. **Type:** `boolean | string`.

```tsx
<Slider label="Seats" error="Team plans start at 5 seats" />
```

#### `required`

Adds an asterisk to the label. A slider always has a value, so nothing else changes. **Type:** `boolean`. **Default:** `false`.

#### `disabled`

The slider can't be focused or moved, and is drawn at 50% opacity. **Type:** `boolean`. **Default:** `false`.

### Forms

#### `name`

Inside a `<form>`, the value submits under `name`; a range submits two values under `name[]`. **Type:** `string`.

```tsx
<Slider name="rating" min={1} max={5} />                 // FormData.get('rating') → '4'
<Slider name="hours" defaultValue={[9, 17]} />           // FormData.getAll('hours[]') → ['9', '17']
```

### Spacing and sizing

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px, around the whole slider. **Type:** `Variants<Sides>`.

#### `width`, `minWidth` and `maxWidth`

A [size](../style-props.md#size). A slider fills its container by default. **Type:** `Variants<Size>`. **Default:** `width: 'full'`.

### Animation

#### `animation`

See [Animation](../animations/index.md). **Type:** `{ entrance?, exit?, attention? }`.

#### Runtime props

`show`, `replay`, `onEntranceEnd` and `onExitEnd` work as on every component ([Animation: runtime props](../animations/index.md#runtime-props)).

### `id`, ARIA and `ref`

`id` goes to the slider element, and `ref` receives it. `aria-label` names the slider when there's no `label` (a range's thumbs get "… minimum" and "… maximum"). `aria-describedby` is added to the thumbs. There is no `className` or `style`.

## Examples

### Example: Basic

One thumb, with the value in the label row and the bubble.

```example
ui-library/slider/basic
```

### Example: Range

Two thumbs, in dollars, kept at least $10 apart.

```example
ui-library/slider/range
```

### Example: Steps and marks

Steps of 25 with a tick at each, and labelled marks with words instead of numbers.

```example
ui-library/slider/steps-and-marks
```

### Example: Value label

The bubble on hover and focus, always, and never.

```example
ui-library/slider/value-label
```

### Example: Colours

Theme tokens, a Tailwind colour on a range, and an intensity.

```example
ui-library/slider/colours
```

### Example: Helper text and error

Press Choose plan with fewer than 5 seats to show the error. Moving the slider clears it.

```example
ui-library/slider/helper-text-and-error
```

### Example: Disabled

A disabled range.

```example
ui-library/slider/disabled
```

### Example: Change and commit

`onValueChange` follows the drag; `onValueCommit` fires when you let go.

```example
ui-library/slider/change-and-commit
```

### Example: In a form

A single value and a range submitted with a form.

```example
ui-library/slider/in-a-form
```

## Accessibility

- **Behaviour from Radix:** each thumb is a `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext` (the formatted value). The arrow keys move by one step, Page Up and Page Down by ten, Home and End to the ends. Clicking the track moves the nearest thumb there.
- **Every Slider needs a name:** `label` or `aria-label`. A range's thumbs are named "… minimum" and "… maximum".
- **Helper text and errors** are linked with `aria-describedby`, and an error sets `aria-invalid` on the thumbs.
- **Use `formatValue`** for units, so screen readers hear "$80" rather than "80".
- **Focus** shows a 2px outline in `color` around the thumb.
- **Reduced motion:** the thumb and bubble change without animating.

## Notes

- **Horizontal only** for now; vertical sliders can be added when needed.
- **Fixed metrics:** a 4px track in a 32px row, 16px thumbs with a light ring, a 12px value bubble, 4px tick marks; `always` reserves 24px above, and labelled marks 20px below.
- **Forms:** inside a `<form>`, Radix adds a hidden input per thumb.
- **Schemas:** `sliderPropsSchema` (type `SliderSerializableProps`), `sliderStylePropsSchema`, `sliderMarksSchema` and `sliderMarkSchema` (type `SliderMark`) in `@inithium/shared-contracts`. `value`, `error`, `disabled` and `formatValue` aren't part of the stored props.
