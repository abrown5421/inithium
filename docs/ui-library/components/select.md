---
title: Select
description: A field for choosing one option from a list, drawn like an Input (outlined, filled or standard, with a floating label) and opening a list below it.
scope: core
tags: [ui, component, forms]
order: 10
decisions: ["0048", "0050", "0055", "0056", "0062"]
component:
  name: Select
  layer: component
  import: '@inithium/shared-ui-components'
  element: button
---

# Select

Select lets the user choose one option from a list ([0062](../../decisions/0062-draw-select-as-an-input-field-opening-a-list-below.md)). The field looks and behaves like an [Input](input.md) (the same variants, floating label, helper text, errors, colour and 32px height), so the two sit side by side in a form. Clicking it, or pressing Enter, Space or an arrow key, opens a list below it. Its behaviour comes from [Radix](https://www.radix-ui.com/primitives/docs/components/select) ([0056](../../decisions/0056-use-radix-primitives-for-interactive-widgets.md)).

Options are data (`value`, `label`, optional `icon` and `disabled`) and can be grouped under headings, so a Select configured in the CMS can be stored.

For two to about seven options that should all be visible at once, use a [RadioGroup](radio-group.md). Select doesn't search or filter (typing jumps to a matching option) and doesn't allow several choices; those are separate components, not built yet.

## Import

```tsx
import { Select, type SelectChoice, type SelectChoiceGroup } from '@inithium/shared-ui-components';
```

## Props at a glance

Type names such as `Colour`, `Sides`, `Size` and `Variants<T>` are defined on [Style props](../style-props.md). `options` is required, and every Select needs a `label` or an `aria-label`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`options`](#options) | `(SelectChoice \| SelectChoiceGroup)[]` | **required** | The choices, optionally grouped |
| [`value`, `defaultValue`, `onValueChange`](#value-defaultvalue-and-onvaluechange) | `string` | uncontrolled, nothing chosen | The chosen option's value |
| [`variant`](#variant) | `'outlined' \| 'filled' \| 'standard'` | `'outlined'` | How the field is drawn |
| [`color`](#color) | `Colour` (not `'transparent'`) | `'primary'` | Focus, floated label, check |
| [`label`](#label) | `string` | none | Floating label |
| [`placeholder`](#placeholder) | `string` | none | Shown while nothing's chosen |
| [`helperText`](#helpertext) | `string` | none | Guidance under the field |
| [`error`](#error) | `boolean \| string` | none | Invalid state and message |
| [`required`](#required) | `boolean` | `false` | Required, with an asterisk |
| [`disabled`](#disabled) | `boolean` | `false` | Can't be used |
| [`leadingIcon`](#leadingicon) | `IconName` | none | Decorative icon in the field |
| [`name`](#name) | `string` | none | Form submission |
| [`open`, `defaultOpen`, `onOpenChange`](#open-defaultopen-and-onopenchange) | `boolean` | closed | Whether the list is open |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | padding `{ x: 12 }` | Spacing, px |
| [`width`, `minWidth`, `maxWidth`](#width-minwidth-and-maxwidth) | `Variants<Size>` | `'full'` | Width |
| [`animation`](#animation) | `Animation` | none | Animations |
| [`show`, `replay`, `onEntranceEnd`, `onExitEnd`](#runtime-props) | | | Runtime animation control |
| [`id`, `aria-label`, `aria-describedby` and `ref`](#id-aria-and-ref) | | | |

## Props

### Options and value

#### `options`

The choices, in order. A choice is `{ value, label, icon?, disabled? }`: `value` must be unique and non-empty, and `icon` is a [Lucide name](icon.md#name) shown before the label in the list. A group is `{ label, options }`: its choices appear under a heading, with a line between groups. Plain choices and groups can be mixed. **Type:** `(SelectChoice | SelectChoiceGroup)[]`. **Required.**

```tsx
<Select
  label="Office"
  options={[
    { value: 'remote', label: 'Remote', icon: 'house' },
    { label: 'Europe', options: [{ value: 'lisbon', label: 'Lisbon' }, { value: 'berlin', label: 'Berlin' }] },
    { label: 'Americas', options: [{ value: 'austin', label: 'Austin', disabled: true }] },
  ]}
/>
```

#### `value`, `defaultValue` and `onValueChange`

The chosen option's `value`. Pass `value` to control the Select (`''` for nothing chosen), or `defaultValue` to let it hold its own. `onValueChange` receives the new value. Once something is chosen, the user can't go back to nothing; add a "None" option if that's needed. **Type:** `string`, `(value: string) => void`. **Default:** uncontrolled, nothing chosen.

```tsx
<Select label="Size" defaultValue="m" options={sizes} />

const [role, setRole] = useState('');
<Select label="Role" value={role} onValueChange={setRole} options={roles} />
```

### Look

#### `variant`

The same three fields as [Input's `variant`](input.md#variant): `outlined`, `filled` (a `surface-200` background) and `standard` (an underline). With a label, `filled` and `standard` reserve 20px above the field, so rows mixing them with outlined fields or buttons should align to the bottom. **Type:** `'outlined' | 'filled' | 'standard'`. **Default:** `'outlined'`.

```tsx
<Select label="Fruit" variant="filled" options={fruit} />
```

#### `color`

The focused border or underline (also while the list is open), the floated label while focused, and the check beside the chosen option. **Type:** [`Colour`](../style-props.md#colour-value), except `'transparent'`. **Default:** `'primary'`.

```tsx
<Select label="Language" color="secondary" options={languages} />
```

### Content

#### `label`

The field's name. It rests inside the field, and floats when the field is focused, the list is open, or something is chosen. **Type:** `string`.

#### `placeholder`

Shown in the field while nothing is chosen. With a `label`, it appears only once the label has floated; without one, all the time. **Type:** `string`.

```tsx
<Select label="Size" placeholder="Pick a size" options={sizes} />
<Select placeholder="Size" aria-label="Size" options={sizes} />
```

#### `helperText`

A line of guidance under the field, linked to it for screen readers. **Type:** `string`.

#### `leadingIcon`

A decorative [Lucide icon](icon.md#name) at the start of the field; the label rests after it. **Type:** `IconName`.

```tsx
<Select label="Send at" leadingIcon="clock" options={hours} />
```

### State

#### `error`

Marks the field invalid, as on [Input](input.md#error): the border, label and helper text turn `red-500`, and a string message replaces `helperText`. **The error clears itself** when an option is chosen, and shows again when `error` changes or the form is submitted. **Type:** `boolean | string`.

```tsx
<Select label="Role" error="Choose a role for this person" options={roles} />
```

#### `required`

Adds an asterisk to the label, and stops a form submitting until something's chosen (unless the form has `noValidate`). **Type:** `boolean`. **Default:** `false`.

#### `disabled`

The field can't be focused or opened, and is drawn at 50% opacity. To disable one option, set `disabled` on that option. **Type:** `boolean`. **Default:** `false`.

### Forms

#### `name`

Inside a `<form>`, the chosen value submits under `name`. **Type:** `string`.

```tsx
<Select name="frequency" label="Digest" options={frequencies} />
// new FormData(form).get('frequency') → 'weekly'
```

#### `open`, `defaultOpen` and `onOpenChange`

Control whether the list is open, e.g. to open it from elsewhere. Usually not needed. **Type:** `boolean`, `(open: boolean) => void`.

### Spacing and sizing

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px, as on Input: margin around the whole field, padding inside the border (default 12px each side; none for `standard`). **Type:** `Variants<Sides>`.

#### `width`, `minWidth` and `maxWidth`

A [size](../style-props.md#size). A Select fills its container by default; the list is at least as wide as the field. **Type:** `Variants<Size>`. **Default:** `width: 'full'`.

```tsx
<Select label="Currency" width={120} options={currencies} />
```

### Animation

#### `animation`

See [Animation](../animations/index.md). The list's own opening animation is separate and always plays (except with reduced motion). **Type:** `{ entrance?, exit?, attention? }`.

#### Runtime props

`show`, `replay`, `onEntranceEnd` and `onExitEnd` work as on every component ([Animation: runtime props](../animations/index.md#runtime-props)).

### `id`, ARIA and `ref`

`id` goes to the field (a button with `role="combobox"`), as do `aria-label` and `aria-describedby`; `ref` receives it. `onAnimationEnd` fires on the wrapper. There is no `className` or `style`.

```tsx
<Select aria-label="Rows per page" options={pageSizes} ref={selectRef} />
```

## Examples

### Example: Variants

The three variants, one with a value already chosen.

```example
ui-library/select/variants
```

### Example: Label and placeholder

A label alone, a label with a placeholder that appears on focus, and a placeholder alone.

```example
ui-library/select/label-and-placeholder
```

### Example: Icons

Icons on the options, and a leading icon in the field.

```example
ui-library/select/icons
```

### Example: Groups

A plain option, then choices grouped under headings.

```example
ui-library/select/groups
```

### Example: Long list

Twenty-four hours; the list scrolls, with arrows at the top and bottom.

```example
ui-library/select/long-list
```

### Example: Helper text and error

Press Invite without choosing to show the error. Choosing a role clears it.

```example
ui-library/select/helper-text-and-error
```

### Example: Required and disabled

A required Select, a disabled one, and a disabled option.

```example
ui-library/select/required-and-disabled
```

### Example: Controlled

The chosen speed drives the text below.

```example
ui-library/select/controlled
```

### Example: Form row

An Input, a narrow Select and a Button, aligned in one row.

```example
ui-library/select/form-row
```

### Example: In a form

The chosen value submits under the Select's `name`.

```example
ui-library/select/in-a-form
```

## Accessibility

- **Behaviour from Radix:** the field is a `role="combobox"` button. Enter, Space or the arrow keys open the list; the arrow keys, Home and End move through it; typing jumps to an option whose label starts with what's typed; Enter chooses; Escape closes without choosing. Focus returns to the field.
- **Every Select needs a name:** `label`, or `aria-label`.
- **Helper text and errors** are linked with `aria-describedby`, and an error sets `aria-invalid`.
- **The chosen option** is marked with a check as well as being shown in the field.
- **Reduced motion:** the list appears without its opening animation, and the chevron doesn't turn.

## Notes

- **The list** opens 4px below the field, at least as wide as it, at most 280px tall (or the space available), and scrolls with arrows beyond that. It renders at the end of the page, above other content (z-index 50), so containers that scroll or hide overflow never clip it.
- **Fixed metrics:** the field matches Input's (32px, 6px radius, the `body` font at 14px); list rows are 32px with 16px icons.
- **Forms:** inside a `<form>`, Radix adds a hidden native select, so the value is submitted and `required` is enforced by the browser.
- **Schemas:** `selectPropsSchema` (type `SelectSerializableProps`), `selectOptionsSchema`, `selectOptionSchema` and `selectOptionGroupSchema` in `@inithium/shared-contracts`. The field's style props are `inputStylePropsSchema`. `value`, `error` and `disabled` aren't part of the stored props.
