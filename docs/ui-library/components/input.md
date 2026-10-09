---
title: Input
description: A single-line text field in outlined, filled or standard style, with a floating label, helper text, errors, adornments and a password toggle.
scope: core
tags: [ui, component, forms]
order: 6
decisions: ["0036", "0042", "0048", "0050", "0054", "0055"]
component:
  name: Input
  layer: component
  import: '@inithium/shared-ui-components'
  element: input
---

# Input

Input is a complete single-line form field: an `<input>` with its label, helper text, error message and adornments, in one of three variants modelled on MUI's text field ([0055](../../decisions/0055-build-input-as-a-native-field-with-a-floating-label.md)). The label rests inside the field like a placeholder and floats up when the field is focused or has a value. The field is 32px tall, the same as a [Button](button.md), so they line up in a row.

Use it for text, email, passwords, search, phone numbers, URLs and numbers. Multiline text will be its own component; to choose from a list, use a [Select](select.md), which shares Input's field.

## Import

```tsx
import { Input, InputAdornment } from '@inithium/shared-ui-components';
```

## Props at a glance

Type names such as `Colour`, `Sides`, `Size` and `Variants<T>` are defined on [Style props](../style-props.md). No prop is required, but every Input needs a `label` or an `aria-label` (see [Accessibility](#accessibility)).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`value`, `defaultValue`, `onValueChange`, `onChange`](#value-defaultvalue-onvaluechange-and-onchange) | | uncontrolled | The field's value |
| [`variant`](#variant) | `'outlined' \| 'filled' \| 'standard'` | `'outlined'` | How the field is drawn |
| [`color`](#color) | `Colour` (not `'transparent'`) | `'primary'` | Focused border and label |
| [`type`](#type) | `'text' \| 'email' \| 'password' \| 'search' \| 'tel' \| 'url' \| 'number'` | `'text'` | Kind of value |
| [`label`](#label) | `string` | none | Floating label |
| [`placeholder`](#placeholder) | `string` | none | Hint while empty |
| [`helperText`](#helpertext) | `string` | none | Guidance under the field |
| [`error`](#error) | `boolean \| string` | none | Invalid state and message |
| [`required`](#required) | `boolean` | `false` | Required, with an asterisk |
| [`disabled`](#disabled) | `boolean` | `false` | Can't be used |
| [`leadingIcon`, `trailingIcon`](#leadingicon-and-trailingicon) | `IconName` | none | Decorative icons |
| [`startAdornment`, `endAdornment`](#startadornment-and-endadornment) | `ReactNode` | none | Anything before or after the text |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | padding `{ x: 12 }` | Spacing, px |
| [`width`, `minWidth`, `maxWidth`](#width-minwidth-and-maxwidth) | `Variants<Size>` | `'full'` | Width |
| [`animation`](#animation) | `Animation` | none | Animations |
| [`show`, `replay`, `onEntranceEnd`, `onExitEnd`](#runtime-props) | | | Runtime animation control |
| [HTML attributes and `ref`](#html-attributes-and-ref) | | | `name`, `autoComplete`, events, `ref` |

## Props

### Value

#### `value`, `defaultValue`, `onValueChange` and `onChange`

Like a native input, an Input is **controlled** when you pass `value` and **uncontrolled** otherwise. `onValueChange` receives the new string on every change; `onChange` receives the native event. **Type:** `string`, `(value: string) => void`. **Default:** uncontrolled.

```tsx
// Controlled: React state holds the value.
const [email, setEmail] = useState('');
<Input label="Email" value={email} onValueChange={setEmail} />

// Uncontrolled: the field holds it; read it through a ref or a form.
<Input label="City" defaultValue="Lisbon" name="city" />
<Input label="City" ref={cityRef} />                       // cityRef.current.value

// The native event, e.g. for a form library.
<Input label="Email" onChange={(event) => register(event.target.name, event.target.value)} />
```

### Variant and colour

#### `variant`

How the field is drawn. All three are 32px tall, with a neutral border or underline at rest, a darker one on hover, and `color` on focus. **Type:** `'outlined' | 'filled' | 'standard'`. **Default:** `'outlined'`.

| Variant | Field | Label when floated |
| --- | --- | --- |
| `outlined` | A 1px border all round, 2px in `color` on focus | In a gap in the top border |
| `filled` | A `surface-200` background (`surface-300` on hover), rounded top corners, an underline that grows from the centre in `color` on focus | Above the field |
| `standard` | An underline only, with no side padding | Above the field |

```tsx
<Input label="Outlined" />
<Input variant="filled" label="Filled" />
<Input variant="standard" label="Standard" />
```

With a label, `filled` and `standard` reserve 20px above the field for the floated label; `outlined` doesn't, since its label floats into the border. So when a row mixes them with outlined inputs or buttons, align it by its bottom edge: `flex={{ align: 'end' }}` or `grid={{ align: 'end' }}` on the row's Container (see [Form row with a button](#example-form-row-with-a-button)).

#### `color`

The colour of the focused border or underline and of the floated label while focused. It also outlines focused adornment buttons. At rest the field is always neutral (`surface-500`, `surface-700` on hover). Typed text inherits its colour from the surrounding text. **Type:** [`Colour`](../style-props.md#colour-value), except `'transparent'`. **Default:** `'primary'`.

```tsx
<Input label="Name" color="secondary" />
<Input label="Name" color="emerald" />
<Input label="Name" color={{ color: 'violet', intensity: 700 }} />
```

### Content

#### `type`

The kind of value. `password` adds a [show/hide toggle](#password-toggle) and hides Edge's own reveal button; `search` and `number` hide the browser's own clear button and spinner arrows. **Type:** `'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number'`. **Default:** `'text'`.

```tsx
<Input label="Email" type="email" autoComplete="email" />
<Input label="Password" type="password" autoComplete="current-password" />
<Input label="Quantity" type="number" min={1} max={10} />
```

#### `label`

The field's visible name. It rests inside the field (after any start adornment) and floats up when the field is focused, has a value, or is autofilled by the browser. Clicking it focuses the field. **Type:** `string`.

```tsx
<Input label="Email" />
```

#### `placeholder`

A hint shown while the field is empty. With a `label`, it appears only once the label has floated (on focus), as in MUI; without one, it shows all the time. **Type:** `string`.

```tsx
<Input label="Website" placeholder="https://example.com" />   // hint appears on focus
<Input placeholder="Search" aria-label="Search" />           // no label: always visible
```

#### `helperText`

A line of guidance under the field, linked to it for screen readers. **Type:** `string`.

```tsx
<Input label="Username" helperText="Letters, numbers and dashes only." />
```

### State

#### `error`

Marks the field invalid: its border, label and helper text turn `red-500`, whatever `color` is, and the field is announced as invalid. A string is the message, shown in place of `helperText`. **Type:** `boolean | string`.

```tsx
<Input label="Email" error />                                            // red, no message
<Input label="Email" error="Enter a valid email" helperText="For receipts." />   // message replaces the helper text
```

**The error clears itself.** As soon as the user edits the field, the error is hidden and `helperText` comes back, so they aren't told off while fixing it. It shows again when `error` changes (a new validation result) or when the field's form is submitted again.

#### `required`

Adds an asterisk to the label and the native `required` attribute. **Type:** `boolean`. **Default:** `false`.

```tsx
<Input label="Full name" required />
```

#### `disabled`

The native `disabled` attribute: the field and its adornment buttons can't be focused or used. It's drawn at 50% opacity and doesn't react to hover. **Type:** `boolean`. **Default:** `false`.

```tsx
<Input label="Account id" defaultValue="acct_4821" disabled />
```

### Adornments

#### `leadingIcon` and `trailingIcon`

A decorative [Lucide icon](icon.md#name) at 16px before or after the text. These can be stored (e.g. chosen in the CMS). **Type:** `IconName`.

```tsx
<Input label="Email" leadingIcon="mail" />
<Input label="Website" trailingIcon="globe" />
```

#### `startAdornment` and `endAdornment`

Anything before or after the text. They replace `leadingIcon` and `trailingIcon`. Use [InputAdornment](input-adornment.md) for icons, including clickable ones; any other element (e.g. a colour swatch) works too. **Type:** `ReactNode`.

```tsx
<Input
  type="search"
  aria-label="Search"
  value={query}
  onValueChange={setQuery}
  startAdornment={<InputAdornment icon="search" />}
  endAdornment={query && <InputAdornment icon="x" label="Clear search" onClick={() => setQuery('')} />}
/>

<Input label="Colour" startAdornment={<Container width={16} height={16} radius={{ all: 4 }} bgColor="emerald" />} />
```

#### Password toggle

Every `type="password"` field ends with an eye button that shows and hides the password. It's labelled "Show password" or "Hide password" for screen readers, and keeps focus in the field. An `endAdornment` you pass goes before it.

```tsx
<Input label="Password" type="password" />
```

### Spacing

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px. `margin` is around the whole field; `padding` is inside the field's border and replaces the default 12px sides (`standard` has none). **Type:** `Variants<Sides>`.

```tsx
<Input label="Email" margin={{ bottom: 16 }} />
<Input label="Email" padding={{ x: 16 }} />
```

### Sizing

#### `width`, `minWidth` and `maxWidth`

A [size](../style-props.md#size). An Input fills its container by default. The height is fixed. **Type:** `Variants<Size>`. **Default:** `width: 'full'`.

```tsx
<Input label="Postcode" width={160} />
<Input label="Email" maxWidth={360} />
<Input label="Search" width={{ base: 'full', md: 320 }} />
```

### Animation

#### `animation`

See [Animation](../animations/index.md). The whole field animates, including its label and helper text. **Type:** `{ entrance?, exit?, attention? }`.

```tsx
<Input label="Code" animation={{ attention: { name: 'headShake' } }} replay={failedAttempts} />
```

#### Runtime props

`show`, `replay`, `onEntranceEnd` and `onExitEnd` work as on every component ([Animation: runtime props](../animations/index.md#runtime-props)).

```tsx
<Input label="Second email" show={adding} animation={{ entrance: { name: 'fadeInDown' }, exit: { name: 'fadeOutUp' } }} />
```

### HTML attributes and `ref`

Other attributes (`name`, `id`, `autoComplete`, `inputMode`, `pattern`, `min`, `max`, `maxLength`, `readOnly`, `autoFocus`, `aria-*`, `data-*` and event handlers) go to the `<input>`, and `ref` receives the `<input>`. `onAnimationEnd` is the exception: it fires on the field's wrapper, which is what animates. There is no `className` or `style`.

```tsx
<Input label="Email" name="email" autoComplete="email" onBlur={validate} ref={emailRef} />
<Input label="Code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} />
```

## Examples

### Example: Variants

The three variants, each with a label that floats on focus.

```example
ui-library/input/variants
```

### Example: Colours

Click into each field: the focused border and label take `color`.

```example
ui-library/input/colours
```

### Example: Label and placeholder

A label alone, a label with a placeholder that appears on focus, and a placeholder alone.

```example
ui-library/input/label-and-placeholder
```

### Example: Adornments

Decorative leading and trailing icons, and a search field whose clear button appears once you type.

```example
ui-library/input/adornments
```

### Example: Password

The built-in eye toggle, with and without a leading icon.

```example
ui-library/input/password
```

### Example: Helper text and error

Press Validate to show the error. Start typing and it clears, bringing the helper text back; validate again to re-check.

```example
ui-library/input/helper-text-and-error
```

### Example: Required and disabled

A required field's asterisk, and disabled fields.

```example
ui-library/input/required-and-disabled
```

### Example: Controlled and uncontrolled

A controlled field echoing its value, and an uncontrolled one read through a ref.

```example
ui-library/input/controlled-and-uncontrolled
```

### Example: Form row with a button

An outlined field and a button share a height; with filled or standard, align the row to the bottom.

```example
ui-library/input/form-row-with-a-button
```

### Example: Animated entrance

A field that fades in and out with `show`.

```example
ui-library/input/animated-entrance
```

## Accessibility

- **A native `<input>`:** keyboard, autofill, password managers and form submission work as the browser provides them.
- **Every Input needs a name.** `label` provides one (a real `<label>` linked by an id Input generates, or your `id`). Without a `label`, pass `aria-label`, or point a [Text](text.md#htmlfor) `as="label"` at the Input's `id`.
- **Helper text and error messages** are linked with `aria-describedby`, and an error sets `aria-invalid`.
- **Adornment buttons** (the password toggle, a clear button) are real buttons with labels, reachable by Tab. Clicking them doesn't take focus away from the field.
- **Focus** is shown by the 2px border or underline in `color`; the label's colour changes too, so it isn't the only cue.
- **Reduced motion:** with "reduce motion" turned on, the label, notch and underline move instantly.
- **Error colour:** red text and borders aren't the only cue: pass a message so the error is described in words.

## Notes

- **Fixed metrics:** a 32px field, 12px side padding (none for `standard`), a 6px radius, the `body` font at 14px; the floated label is 12px, and the helper text 12px.
- **Autofill:** the label floats when the browser autofills, and the field keeps its own background instead of the browser's yellow.
- **No reserved space:** helper text or an error message adds a line under the field, pushing content below it down.
- **Errors are `red-500`** in every theme; the theme has no status colours ([0055](../../decisions/0055-build-input-as-a-native-field-with-a-floating-label.md)).
- **Not yet:** multiline text, sizes, character counters, and an input-level `readOnly` style (the attribute works; it just looks like an editable field).
- **Schemas:** `inputPropsSchema` (type `InputSerializableProps`) and `inputStylePropsSchema` in `@inithium/shared-contracts`. `value`, `error`, `disabled` and adornment elements aren't part of the stored props.
