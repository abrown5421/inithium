---
title: Checkbox
description: An accessible checkbox with a label, helper text, errors and an indeterminate state, styled from one colour.
scope: core
tags: [ui, component, forms]
order: 2
decisions: ["0048", "0055", "0056", "0057"]
component:
  name: Checkbox
  layer: component
  import: '@inithium/shared-ui-components'
  element: button
---

# Checkbox

Checkbox is a yes/no choice (for one of several, use a [RadioGroup](radio-group.md)), usually submitted with a form (for settings that apply straight away, use a [Switch](switch.md)), with its own label, helper text and error message ([0057](../../decisions/0057-style-checkboxes-from-one-colour-on-radix.md)). Its behaviour comes from [Radix](https://www.radix-ui.com/primitives/docs/components/checkbox) ([0056](../../decisions/0056-use-radix-primitives-for-interactive-widgets.md)): keyboard support, screen-reader states, and form submission. One `color` draws the outline when unchecked and the fill when checked. The box is 18px, centred in a 32px row, so a checkbox lines up with an [Input](input.md) or a [Button](button.md).

It also has an **indeterminate** state, for a "select all" box when only some items are selected.

## Import

```tsx
import { Checkbox, type CheckedState } from '@inithium/shared-ui-components';
```

## Props at a glance

Type names such as `Colour`, `Sides` and `Variants<T>` are defined on [Style props](../style-props.md). No prop is required, but every Checkbox needs a `label` or an `aria-label`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`checked`, `defaultChecked`, `onCheckedChange`](#checked-defaultchecked-and-oncheckedchange) | `CheckedState` | uncontrolled, unchecked | Whether it's ticked |
| [`color`](#color) | `Colour` (not `'transparent'`) | `'primary'` | Outline, fill and focus |
| [`label`](#label) | `string` | none | Text beside the box |
| [`helperText`](#helpertext) | `string` | none | Guidance under the label |
| [`error`](#error) | `boolean \| string` | none | Invalid state and message |
| [`required`](#required) | `boolean` | `false` | Required, with an asterisk |
| [`disabled`](#disabled) | `boolean` | `false` | Can't be used |
| [`name`, `value`](#name-and-value) | `string` | value `'on'` | Form submission |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | none | Spacing, px |
| [`animation`](#animation) | `Animation` | none | Animations |
| [`show`, `replay`, `onEntranceEnd`, `onExitEnd`](#runtime-props) | | | Runtime animation control |
| [HTML attributes and `ref`](#html-attributes-and-ref) | | | `id`, `aria-*`, events, `ref` |

## Props

### Value

#### `checked`, `defaultChecked` and `onCheckedChange`

`CheckedState` is `true`, `false` or `'indeterminate'`. Pass `checked` to control the box, or `defaultChecked` to let it hold its own state. `onCheckedChange` receives the new state; clicking an indeterminate box makes it `true`. **Type:** `CheckedState`, `(checked: CheckedState) => void`. **Default:** uncontrolled, unchecked.

```tsx
<Checkbox label="Remember me" defaultChecked />                              // uncontrolled

const [agreed, setAgreed] = useState(false);
<Checkbox label="I agree" checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />

<Checkbox label="All toppings" checked="indeterminate" />                    // some, not all
```

### Colour

#### `color`

The outline while unchecked, the fill while checked or indeterminate, a faint tint on hover, and the keyboard focus outline. The check is drawn in the same colour's 100 step, as on a filled [Button](button.md#variant). **Type:** [`Colour`](../style-props.md#colour-value), except `'transparent'`. **Default:** `'primary'`.

```tsx
<Checkbox label="Secondary" color="secondary" />
<Checkbox label="Emerald" color="emerald" />
<Checkbox label="Violet 700" color={{ color: 'violet', intensity: 700 }} />
```

### Content

#### `label`

Text to the right of the box. Clicking it toggles the box. It inherits its colour from the surrounding text. **Type:** `string`.

```tsx
<Checkbox label="Email me about new features" />
```

#### `helperText`

A line of guidance under the label, linked to the box for screen readers. **Type:** `string`.

```tsx
<Checkbox label="Show line numbers" helperText="Applies to every code block." />
```

### State

#### `error`

Marks the box invalid: the outline, fill and helper text turn `red-500`, whatever `color` is, and the box is announced as invalid. A string is the message, shown in place of `helperText`. **Type:** `boolean | string`.

```tsx
<Checkbox label="I accept the terms" error="You need to accept the terms to continue" />
```

Like [Input's](input.md#error), **the error clears itself**: toggling the box hides it and brings `helperText` back. It shows again when `error` changes or the box's form is submitted.

#### `required`

Adds an asterisk to the label, announces the box as required, and stops a form submitting until it's ticked (unless the form has `noValidate`). **Type:** `boolean`. **Default:** `false`.

```tsx
<Checkbox label="I accept the terms" required />
```

#### `disabled`

The box can't be focused or toggled. It's drawn at 50% opacity and doesn't react to hover. **Type:** `boolean`. **Default:** `false`.

```tsx
<Checkbox label="Locked setting" defaultChecked disabled />
```

### Forms

#### `name` and `value`

Inside a `<form>`, a checked box submits `name=value`; an unchecked one submits nothing, as with a native checkbox. Several boxes can share a `name`. **Type:** `string`. **Default:** `value` is `'on'`.

```tsx
<Checkbox name="notifications" value="email" label="Email" />
<Checkbox name="notifications" value="sms" label="Text message" />
// new FormData(form).getAll('notifications') → ['email', 'sms']
```

### Spacing

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px, around the whole checkbox (box, label and helper text). **Type:** `Variants<Sides>`.

```tsx
<Checkbox label="Indented" margin={{ left: 26 }} />
```

### Animation

#### `animation`

See [Animation](../animations/index.md). **Type:** `{ entrance?, exit?, attention? }`.

```tsx
<Checkbox label="I accept the terms" animation={{ attention: { name: 'headShake' } }} replay={failedSubmits} />
```

#### Runtime props

`show`, `replay`, `onEntranceEnd` and `onExitEnd` work as on every component ([Animation: runtime props](../animations/index.md#runtime-props)).

### HTML attributes and `ref`

Other attributes (`id`, `aria-*`, `data-*`, `onBlur` and other events) go to the box, which is a `<button role="checkbox">`, and `ref` receives it. `onAnimationEnd` fires on the wrapper, which is what animates. There is no `className` or `style`.

```tsx
<Checkbox aria-label="Select row 3" checked={selected} onCheckedChange={toggle} ref={boxRef} />
```

## Examples

### Example: Basic

Unchecked, checked by default, and with helper text.

```example
ui-library/checkbox/basic
```

### Example: Colours

Theme tokens, a Tailwind colour and an intensity.

```example
ui-library/checkbox/colours
```

### Example: Select all

A parent box that's indeterminate while only some items are chosen. Clicking it selects or clears them all.

```example
ui-library/checkbox/select-all
```

### Example: Helper text and error

Press Continue without ticking the box to show the error. Ticking the box clears it.

```example
ui-library/checkbox/helper-text-and-error
```

### Example: Disabled

Each state, disabled.

```example
ui-library/checkbox/disabled
```

### Example: In a form

Boxes sharing a `name` submit the values that are ticked.

```example
ui-library/checkbox/in-a-form
```

## Accessibility

- **Behaviour from Radix:** the box is a `<button role="checkbox">` with `aria-checked` (`mixed` when indeterminate). Space toggles it; Enter doesn't, as with a native checkbox.
- **Every Checkbox needs a name:** `label` (a real `<label>` linked by id) or `aria-label`, e.g. for a box in a table row.
- **Helper text and errors** are linked with `aria-describedby`, and an error sets `aria-invalid`. Pass a message, so the error isn't conveyed by colour alone.
- **Focus** shows a 2px outline in `color`, offset by 2px, for keyboard users only.
- **Reduced motion:** with "reduce motion" turned on, the fill changes instantly.

## Notes

- **Fixed metrics:** an 18px box with a 2px border and a 4px radius, a 14px check, an 8px gap to the label, a 32px row, the `body` font at 14px; helper text is 12px and lines up with the label.
- **Forms:** inside a `<form>`, Radix adds a hidden native checkbox, so the value is submitted and `required` is enforced by the browser.
- **Errors are `red-500`**, like Input's ([0055](../../decisions/0055-build-input-as-a-native-field-with-a-floating-label.md)).
- **Schemas:** `checkboxPropsSchema` (type `CheckboxSerializableProps`) and `checkboxStylePropsSchema` in `@inithium/shared-contracts`. `checked`, `error` and `disabled` aren't part of the stored props.
