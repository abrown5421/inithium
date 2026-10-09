---
title: InputAdornment
description: An icon inside an Input, decorative or a small labelled button such as clear, copy or show password.
scope: core
tags: [ui, component, forms, icons]
order: 7
decisions: ["0050", "0055"]
component:
  name: InputAdornment
  layer: component
  import: '@inithium/shared-ui-components'
  element: button
---

# InputAdornment

InputAdornment puts an icon inside an [Input](input.md), through its `startAdornment` or `endAdornment` ([0055](../../decisions/0055-build-input-as-a-native-field-with-a-floating-label.md)). Without `onClick` it's a decorative icon; with `onClick` it's a small borderless button, like the Input's own password toggle. It only makes sense inside an Input.

For a plain decorative icon you can also use Input's `leadingIcon` and `trailingIcon`, which can be stored.

## Import

```tsx
import { Input, InputAdornment } from '@inithium/shared-ui-components';
```

## Props at a glance

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`icon`](#icon) | `IconName` | **required** | Lucide icon name |
| [`onClick`](#onclick) | `(event) => void` | none | Makes it a button |
| [`label`](#label) | `string` | none; **required** with `onClick` | Name for screen readers |

## Props

#### `icon`

A [Lucide icon name](icon.md#name), drawn at 16px. **Type:** `IconName`. **Required.**

```tsx
<Input label="Email" startAdornment={<InputAdornment icon="mail" />} />
```

#### `onClick`

Turns the adornment into a 24px button. Clicking it keeps focus in the field, so the user can keep typing. It's disabled when the Input is. **Type:** `(event: MouseEvent<HTMLButtonElement>) => void`.

```tsx
<Input
  label="Search"
  value={query}
  onValueChange={setQuery}
  endAdornment={query && <InputAdornment icon="x" label="Clear search" onClick={() => setQuery('')} />}
/>
```

#### `label`

The button's accessible name, required with `onClick` (TypeScript enforces it). On a decorative adornment it's optional and makes the icon announce itself. **Type:** `string`.

```tsx
<InputAdornment icon="copy" label="Copy key" onClick={copy} />
<InputAdornment icon="circle-alert" label="Unverified" />     // announced, not clickable
```

Several adornments can sit together in a fragment:

```tsx
endAdornment={
  <>
    <InputAdornment icon="copy" label="Copy key" onClick={copy} />
    <InputAdornment icon="refresh-cw" label="Generate a new key" onClick={regenerate} />
  </>
}
```

## Examples

### Example: Copy and regenerate

A read-only key with a decorative start icon and two end buttons.

```example
ui-library/input-adornment/copy-and-regenerate
```

The [Input adornments example](input.md#example-adornments) shows a search field with a clear button.

## Accessibility

- **Clickable adornments are `<button>`s** with `type="button"`, so they never submit a form, and they're reachable with Tab.
- **Always label a clickable adornment** with what it does ("Clear search", not "X").
- **Focus** shows a 2px outline in the Input's `color`.
- **Decorative adornments** are hidden from screen readers unless labelled.

## Notes

- **Element:** a `<span>` when decorative, a `<button>` when clickable.
- **Colour:** icons use `surface-600`; a hovered button gets a faint tint of that colour.
- **Outside an Input** it renders, but has no field to keep focus in or take the disabled state from.
