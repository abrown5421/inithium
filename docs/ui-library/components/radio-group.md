---
title: RadioGroup
description: A set of options where exactly one can be chosen, as plain rows or bordered cards, vertical or horizontal.
scope: core
tags: [ui, component, forms]
order: 9
decisions: ["0048", "0050", "0056", "0057", "0061"]
component:
  name: RadioGroup
  layer: component
  import: '@inithium/shared-ui-components'
  element: div
---

# RadioGroup

RadioGroup lets the user choose exactly one of a few options ([0061](../../decisions/0061-build-radio-groups-from-option-data-with-a-card-variant.md)). Its options are data (`value`, `label`, optional `helperText`, `icon` and `disabled`), so a group configured in the CMS can be stored. It draws them as plain rows, or as bordered cards for bigger choices such as a pricing plan. Its behaviour, including arrow-key navigation, comes from [Radix](https://www.radix-ui.com/primitives/docs/components/radio-group) ([0056](../../decisions/0056-use-radix-primitives-for-interactive-widgets.md)).

Radios look like [Checkbox](checkbox.md)es made round: an 18px control outlined in `color`, with a `color` dot when selected. The group has a label, helper text and errors like Checkbox's.

For more than about seven options, a [Select](select.md) will suit better. For a single yes/no, use a Checkbox or a [Switch](switch.md).

## Import

```tsx
import { RadioGroup, type RadioGroupOption } from '@inithium/shared-ui-components';
```

## Props at a glance

Type names such as `Colour`, `Sides` and `Variants<T>` are defined on [Style props](../style-props.md). `options` is required, and every group needs a `label` or an `aria-label`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`options`](#options) | `RadioGroupOption[]` | **required** | The choices |
| [`value`, `defaultValue`, `onValueChange`](#value-defaultvalue-and-onvaluechange) | `string` | uncontrolled, none chosen | The chosen option's value |
| [`variant`](#variant) | `'plain' \| 'card'` | `'plain'` | Rows or cards |
| [`orientation`](#orientation) | `'vertical' \| 'horizontal'` | `'vertical'` | Layout |
| [`color`](#color) | `Colour` (not `'transparent'`) | `'primary'` | Radios, selection, focus |
| [`label`](#label) | `string` | none | The group's name |
| [`helperText`](#helpertext) | `string` | none | Guidance under the options |
| [`error`](#error) | `boolean \| string` | none | Invalid state and message |
| [`required`](#required) | `boolean` | `false` | Required, with an asterisk |
| [`disabled`](#disabled) | `boolean` | `false` | Whole group can't be used |
| [`name`](#name) | `string` | none | Form submission |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | none | Spacing, px |
| [`animation`](#animation) | `Animation` | none | Animations |
| [`show`, `replay`, `onEntranceEnd`, `onExitEnd`](#runtime-props) | | | Runtime animation control |
| [HTML attributes and `ref`](#html-attributes-and-ref) | | | `id`, `aria-*`, `loop`, `ref` |

## Props

### Options and value

#### `options`

The choices, in order. Each has a `value` (unique in the group), a `label`, and optionally `helperText` (a line under the label), `disabled`, and an `icon` ([Lucide name](icon.md#name), shown in the card variant). **Type:** `RadioGroupOption[]`. **Required.**

```tsx
<RadioGroup
  label="Delivery"
  options={[
    { value: 'standard', label: 'Standard', helperText: '3–5 working days, free' },
    { value: 'express', label: 'Express', helperText: 'Next working day, £4.99' },
    { value: 'collect', label: 'Click and collect', disabled: true },
  ]}
/>
```

#### `value`, `defaultValue` and `onValueChange`

The chosen option's `value`. Pass `value` to control the group (`null` for nothing chosen), or `defaultValue` to let it hold its own. `onValueChange` receives the new value. **Type:** `string`, `(value: string) => void`. **Default:** uncontrolled, nothing chosen.

```tsx
<RadioGroup label="Size" defaultValue="m" options={sizes} />

const [plan, setPlan] = useState('team');
<RadioGroup label="Plan" value={plan} onValueChange={setPlan} options={plans} />
```

### Look

#### `variant`

`plain` draws each option as a row: a radio, then its label and helper text. `card` draws each as a bordered card (with the option's `icon`, if any) that's outlined in `color` and faintly tinted when selected. The whole row or card is clickable. **Type:** `'plain' | 'card'`. **Default:** `'plain'`.

```tsx
<RadioGroup label="Plan" variant="card" options={plans} />
```

#### `orientation`

`vertical` stacks the options; `horizontal` puts them in a row: plain options wrap with 24px between them, and cards share the row in equal widths. The arrow keys follow the orientation. **Type:** `'vertical' | 'horizontal'`. **Default:** `'vertical'`.

```tsx
<RadioGroup label="Would you recommend us?" orientation="horizontal" options={answers} />
```

#### `color`

The radio outlines, the selected dot, a selected card's border and tint, its icon, a faint hover tint, and the keyboard focus outline. **Type:** [`Colour`](../style-props.md#colour-value), except `'transparent'`. **Default:** `'primary'`.

```tsx
<RadioGroup label="Size" color="secondary" options={sizes} />
```

### Content

#### `label`

The group's name, shown above the options and announced with the group. **Type:** `string`.

#### `helperText`

A line of guidance under the options, linked to the group for screen readers. Each option can also have its own `helperText`. **Type:** `string`.

```tsx
<RadioGroup label="Why are you cancelling?" helperText="This helps us improve." options={reasons} />
```

### State

#### `error`

Marks the group invalid: the radios (and cards) turn `red-500`, whatever `color` is, as does the helper text, and the group is announced as invalid. A string is the message, shown in place of `helperText`. **Type:** `boolean | string`.

```tsx
<RadioGroup label="Why are you cancelling?" error="Choose a reason to continue" options={reasons} />
```

Like [Checkbox's](checkbox.md#error), **the error clears itself** when an option is chosen, and shows again when `error` changes or the group's form is submitted.

#### `required`

Adds an asterisk to the label, announces the group as required, and stops a form submitting until an option is chosen (unless the form has `noValidate`). **Type:** `boolean`. **Default:** `false`.

#### `disabled`

Disables the whole group: it's drawn at 50% opacity and can't be used. To disable one option, set `disabled` on that option instead. **Type:** `boolean`. **Default:** `false`.

```tsx
<RadioGroup label="Contact by" disabled options={channels} />
```

### Forms

#### `name`

Inside a `<form>`, the group submits `name=value` for the chosen option, and nothing if none is chosen. **Type:** `string`.

```tsx
<RadioGroup name="theme" label="Theme" options={themes} />
// new FormData(form).get('theme') → 'dark'
```

### Spacing

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px, around the whole group. **Type:** `Variants<Sides>`.

### Animation

#### `animation`

See [Animation](../animations/index.md). **Type:** `{ entrance?, exit?, attention? }`.

```tsx
<RadioGroup label="Reason" options={reasons} animation={{ attention: { name: 'headShake' } }} replay={failedSubmits} />
```

#### Runtime props

`show`, `replay`, `onEntranceEnd` and `onExitEnd` work as on every component ([Animation: runtime props](../animations/index.md#runtime-props)).

### HTML attributes and `ref`

Other attributes (`id`, `aria-*`, `data-*`, Radix's `loop` and `dir`) go to the group element (`role="radiogroup"`), and `ref` receives it. `onAnimationEnd` fires on the wrapper, which is what animates. There is no `className`, `style` or `children`.

```tsx
<RadioGroup aria-label="Shipping speed" options={speeds} loop={false} ref={groupRef} />
```

## Examples

### Example: Basic

A vertical group with a label, a default choice and helper text on each option.

```example
ui-library/radio-group/basic
```

### Example: Horizontal

Short answers in a row, and sizes in the secondary colour.

```example
ui-library/radio-group/horizontal
```

### Example: Cards

A plan picker: icon cards side by side, controlled, with the selection shown below.

```example
ui-library/radio-group/cards
```

### Example: Vertical cards

Stacked cards in emerald, with one option disabled.

```example
ui-library/radio-group/vertical-cards
```

### Example: Helper text and error

Press the button without choosing to show the error. Choosing an option clears it.

```example
ui-library/radio-group/helper-text-and-error
```

### Example: Disabled

One disabled option, and a disabled group.

```example
ui-library/radio-group/disabled
```

### Example: In a form

The chosen value submits under the group's `name`.

```example
ui-library/radio-group/in-a-form
```

## Accessibility

- **Behaviour from Radix:** the group is a `role="radiogroup"` and each option a `role="radio"`. Tab moves into the group (to the chosen option, or the first), the arrow keys move between options and choose them, and Tab moves on.
- **Every group needs a name:** `label`, or `aria-label`. Each option is named by its label and described by its helper text.
- **Group helper text and errors** are linked with `aria-describedby`, and an error sets `aria-invalid`. Pass a message, so the error isn't conveyed by colour alone.
- **Selection isn't colour alone:** the dot (and a card's thicker border) marks the chosen option.
- **Focus** shows a 2px outline in `color` around the radio, for keyboard users only.

## Notes

- **Fixed metrics:** 18px radios with a 2px border and an 8px dot; plain options are 32px rows; cards have 12px padding, an 8px radius and 20px icons; the `body` font at 14px; helper text is 12px.
- **Icons** only show in the card variant.
- **Forms:** inside a `<form>`, Radix adds hidden native radios, so the value is submitted and `required` is enforced by the browser.
- **Schemas:** `radioGroupPropsSchema` (type `RadioGroupSerializableProps`), `radioGroupStylePropsSchema` and `radioOptionSchema` (type `RadioOption`) in `@inithium/shared-contracts`. `value`, `error` and `disabled` aren't part of the stored props.
