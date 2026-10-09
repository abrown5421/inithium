---
title: Switch
description: An accessible on/off switch with optional thumb icons, a label on either side, helper text and errors, styled from one colour.
scope: core
tags: [ui, component, forms]
order: 10
decisions: ["0048", "0050", "0056", "0057", "0059"]
component:
  name: Switch
  layer: component
  import: '@inithium/shared-ui-components'
  element: button
---

# Switch

Switch turns a setting on or off ([0059](../../decisions/0059-style-switches-neutral-when-off-and-coloured-when-on.md)). Use it for settings that take effect straight away, like "Wi-Fi" or "Autosave"; use a [Checkbox](checkbox.md) for choices that are submitted with a form, like "I accept the terms". Its behaviour comes from [Radix](https://www.radix-ui.com/primitives/docs/components/switch) ([0056](../../decisions/0056-use-radix-primitives-for-interactive-widgets.md)).

The track is neutral when off and filled with `color` when on, so "on" stands out. The thumb can carry an icon for each state. The 36×20px track sits in a 32px row, so a switch lines up with a Checkbox, an [Input](input.md) or a [Button](button.md). Its label, helper text, errors and form behaviour work like Checkbox's.

## Import

```tsx
import { Switch } from '@inithium/shared-ui-components';
```

## Props at a glance

Type names such as `Colour`, `Sides` and `Variants<T>` are defined on [Style props](../style-props.md). No prop is required, but every Switch needs a `label` or an `aria-label`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`checked`, `defaultChecked`, `onCheckedChange`](#checked-defaultchecked-and-oncheckedchange) | `boolean` | uncontrolled, off | Whether it's on |
| [`color`](#color) | `Colour` (not `'transparent'`) | `'primary'` | Track when on |
| [`checkedIcon`, `uncheckedIcon`](#checkedicon-and-uncheckedicon) | `IconName` | none | Icons on the thumb |
| [`label`](#label) | `string` | none | Text beside the switch |
| [`labelPlacement`](#labelplacement) | `'end' \| 'start'` | `'end'` | Which side the label is on |
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

Pass `checked` to control the switch, or `defaultChecked` to let it hold its own state. `onCheckedChange` receives the new value. **Type:** `boolean`, `(checked: boolean) => void`. **Default:** uncontrolled, off.

```tsx
<Switch label="Wi-Fi" defaultChecked />                                   // uncontrolled

const [autosave, setAutosave] = useState(true);
<Switch label="Autosave" checked={autosave} onCheckedChange={setAutosave} />
```

### Look

#### `color`

The track while on, the icon on the thumb while on, and the keyboard focus outline. The thumb turns the same colour's 100 step when on. When off, the track is always neutral (`surface-300`, `surface-400` on hover) with a `surface-50` thumb. **Type:** [`Colour`](../style-props.md#colour-value), except `'transparent'`. **Default:** `'primary'`.

```tsx
<Switch label="Secondary" color="secondary" />
<Switch label="Emerald" color="emerald" />
<Switch label="Violet 700" color={{ color: 'violet', intensity: 700 }} />
```

#### `checkedIcon` and `uncheckedIcon`

A [Lucide icon](icon.md#name) on the thumb, at 12px, for each state. The on icon is drawn in `color`; the off icon in `surface-500`. You can set one, both or neither. They're decorative: the switch's state is announced anyway. **Type:** `IconName`.

```tsx
<Switch label="Notifications" checkedIcon="check" uncheckedIcon="x" />
<Switch label="Dark theme" checkedIcon="moon" uncheckedIcon="sun" />
<Switch label="Private profile" checkedIcon="lock" />                        // icon only when on
```

### Content

#### `label`

Text beside the switch. Clicking it toggles the switch. It inherits its colour from the surrounding text. **Type:** `string`.

```tsx
<Switch label="Bluetooth" />
```

#### `labelPlacement`

Which side the label sits on. `start` puts the label first and pushes the switch to the far end of its container, as in a settings list. **Type:** `'end' | 'start'`. **Default:** `'end'`.

```tsx
<Switch label="Email notifications" labelPlacement="start" />
```

#### `helperText`

A line of guidance under the label, linked to the switch for screen readers. **Type:** `string`.

```tsx
<Switch label="Airplane mode" helperText="Turns off every wireless connection." />
```

### State

#### `error`

Marks the switch invalid: the track is ringed in `red-500` (and filled red when on), the helper text turns red, and the switch is announced as invalid. A string is the message, shown in place of `helperText`. **Type:** `boolean | string`.

```tsx
<Switch label="Daily backups" error="Backups must be on before you can publish" />
```

Like [Checkbox's](checkbox.md#error), **the error clears itself** when the switch is toggled, and shows again when `error` changes or the switch's form is submitted.

#### `required`

Adds an asterisk to the label, announces the switch as required, and stops a form submitting until it's on (unless the form has `noValidate`). **Type:** `boolean`. **Default:** `false`.

```tsx
<Switch label="Daily backups" required />
```

#### `disabled`

The switch can't be focused or toggled. It's drawn at 50% opacity and doesn't react to hover. **Type:** `boolean`. **Default:** `false`.

```tsx
<Switch label="Managed by your organisation" defaultChecked disabled />
```

### Forms

#### `name` and `value`

Inside a `<form>`, a switch that's on submits `name=value`; one that's off submits nothing, like a checkbox. **Type:** `string`. **Default:** `value` is `'on'`.

```tsx
<Switch name="newsletter" label="Newsletter" />
// new FormData(form).get('newsletter') → 'on' or null
```

### Spacing

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px, around the whole switch (track, label and helper text). **Type:** `Variants<Sides>`.

```tsx
<Switch label="Wi-Fi" margin={{ bottom: 8 }} />
```

### Animation

#### `animation`

See [Animation](../animations/index.md). The thumb's slide is separate and always plays (except with reduced motion). **Type:** `{ entrance?, exit?, attention? }`.

```tsx
<Switch label="Daily backups" animation={{ attention: { name: 'headShake' } }} replay={failedPublishes} />
```

#### Runtime props

`show`, `replay`, `onEntranceEnd` and `onExitEnd` work as on every component ([Animation: runtime props](../animations/index.md#runtime-props)).

### HTML attributes and `ref`

Other attributes (`id`, `aria-*`, `data-*`, `onBlur` and other events) go to the track, which is a `<button role="switch">`, and `ref` receives it. `onAnimationEnd` fires on the wrapper, which is what animates. There is no `className` or `style`.

```tsx
<Switch aria-label="Enable row 3" checked={enabled} onCheckedChange={toggle} ref={switchRef} />
```

## Examples

### Example: Basic

On by default, off, and with helper text.

```example
ui-library/switch/basic
```

### Example: Colours

The track takes `color` when on.

```example
ui-library/switch/colours
```

### Example: Thumb icons

Icons on the thumb for each state: check and cross, moon and sun, lock and unlock.

```example
ui-library/switch/thumb-icons
```

### Example: Settings list

Labels first and switches at the far end, with helper text, inside a bordered list.

```example
ui-library/switch/settings-list
```

### Example: Helper text and error

Press Publish with backups off to show the error. Turning the switch on clears it.

```example
ui-library/switch/helper-text-and-error
```

### Example: Disabled

Off, on, and with icons, disabled.

```example
ui-library/switch/disabled
```

### Example: Controlled

A switch whose state drives the text below it.

```example
ui-library/switch/controlled
```

## Accessibility

- **Behaviour from Radix:** the track is a `<button role="switch">` with `aria-checked`. Space and Enter both toggle it.
- **Every Switch needs a name:** `label` (a real `<label>` linked by id) or `aria-label`.
- **Helper text and errors** are linked with `aria-describedby`, and an error sets `aria-invalid`. Pass a message, so the error isn't conveyed by colour alone.
- **On and off differ by more than colour:** the thumb's position changes, and icons can add a second cue.
- **Focus** shows a 2px outline in `color`, offset by 2px, for keyboard users only.
- **Reduced motion:** with "reduce motion" turned on, the thumb moves without sliding.

## Notes

- **Fixed metrics:** a 36×20px track, a 16px thumb inset 2px, 12px icons, an 8px gap to the label, a 32px row, the `body` font at 14px; helper text is 12px and lines up with the label.
- **Forms:** inside a `<form>`, Radix adds a hidden native checkbox, so the value is submitted and `required` is enforced by the browser.
- **Errors are `red-500`**, like Input's and Checkbox's.
- **Schemas:** `switchPropsSchema` (type `SwitchSerializableProps`) and `switchStylePropsSchema` in `@inithium/shared-contracts`. `checked`, `error` and `disabled` aren't part of the stored props.
