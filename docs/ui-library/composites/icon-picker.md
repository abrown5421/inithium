---
title: IconPicker
description: A field for choosing a Lucide icon from a searchable grid.
scope: core
tags: [ui, composite, icons, forms]
order: 9
decisions: ["0050", "0055", "0085"]
component:
  name: IconPicker
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: div
---

# IconPicker

IconPicker is a field for choosing a [Lucide](https://lucide.dev/icons/) icon ([0085](../../decisions/0085-pick-icons-from-a-searchable-grid.md)). It looks like an [Input](../components/input.md) showing the chosen icon and its name. Clicking it opens a panel below with a search box, a grid of matching icons and "No icon" to clear the choice. It works like [ColorPicker](color-picker.md).

Lucide has over 2,000 icons, so the grid shows at most 60 at a time. Type to narrow it: every word must appear in the name, and names starting with your search come first, so "arrow up" finds `arrow-up`, then `arrow-up-right` and so on.

## Import

```tsx
import { IconPicker } from '@inithium/shared-ui-composites';
```

## Props at a glance

Type names such as `Colour`, `Sides`, `Size` and `Variants<T>` are defined on [Style props](../style-props.md).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`value`, `defaultValue`, `onValueChange`](#value-defaultvalue-and-onvaluechange) | `IconName \| undefined` | none | The chosen icon |
| [`label`](#label) | `string` | none | The field's label |
| [`placeholder`](#placeholder) | `string` | `'No icon'` | Shown while nothing is chosen |
| [`helperText`](#helpertext) | `string` | none | Guidance under the field |
| [`required`, `disabled`](#required-and-disabled) | `boolean` | `false` | |
| [`error`](#error) | `boolean \| string` | none | Marks the field invalid |
| [`name`](#name) | `string` | none | Submits the icon's name in forms |
| [`variant`, `color`](#variant-and-color) | Input's | `'outlined'`, `'primary'` | Field look and accent |
| [`width`, `minWidth`, `maxWidth`](#width-minwidth-and-maxwidth) | `Variants<Size>` | `'full'` | Field width |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | none | Spacing, px |
| [`animation`](#animation) | `Animation` | none | Animations |

## Props

#### `value`, `defaultValue` and `onValueChange`

The chosen icon's Lucide name, e.g. `'house'`. Pass `value` to control it, or `defaultValue` to let the picker hold its own. `onValueChange` receives the new name, or `undefined` when "No icon" clears it. **Type:** `IconName | undefined`.

```tsx
const [icon, setIcon] = useState<IconName | undefined>('house');
<IconPicker label="Menu icon" value={icon} onValueChange={setIcon} />
```

#### `label`

Sits in the field and floats above it once an icon is chosen. It also names the panel ("Menu icon options"). **Type:** `string`.

#### `placeholder`

Shown while no icon is chosen. **Type:** `string`. **Default:** `'No icon'`.

#### `helperText`

A line of guidance under the field, replaced by the error while one shows. **Type:** `string`.

#### `required` and `disabled`

`required` adds the asterisk to the label. `disabled` greys the field out and stops it opening. **Type:** `boolean`.

#### `error`

Marks the field invalid; a message replaces the helper text. Choosing an icon hides it until `error` changes. **Type:** `boolean | string`.

#### `name`

Inside a form, submits the icon's name (empty for none) under this name. **Type:** `string`.

#### `variant` and `color`

As on [Input](../components/input.md#variant): `outlined`, `filled` or `standard`; `color` is the focus accent, and the ring around the chosen icon in the grid. **Default:** `'outlined'`, `'primary'`.

#### `width`, `minWidth` and `maxWidth`

The field's [size](../style-props.md#size). The panel is as wide as the field, and at least 320px. **Type:** `Variants<Size>`. **Default:** `width` `'full'`.

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px, as on Input. **Type:** `Variants<Sides>`.

#### `animation`

The [animation prop](../animations/index.md). **Type:** `{ entrance?, exit?, attention? }`.

## Examples

### Example: Basic

Choose an icon; the choice shows underneath.

```example
ui-library/icon-picker/basic
```

### Example: Preset and helper

A starting icon with helper text, and the filled variant in the secondary colour.

```example
ui-library/icon-picker/preset-and-helper
```

### Example: Required and error

A required field showing an error, and a disabled one.

```example
ui-library/icon-picker/required-and-error
```

## Accessibility

- **Opening:** the field announces that it opens a dialog and whether it's open. Enter, Space or the down arrow open it, and focus moves to the search box.
- **The grid** is a listbox with one tab stop. Arrow keys move one icon or one row (8), Home and End jump to the ends, and Enter or Space picks and closes. The up arrow from the top row goes back to the search box, and the down arrow from the search box enters the grid.
- **Search:** Enter in the search box picks the first match. The count ("Showing 60 of 312") is announced as it changes.
- **Names:** each icon is named by its Lucide name, with a tooltip. Closing returns focus to the field.

## Notes

- **The search list** is Lucide's `iconNames`, bundled with the picker. Icons themselves load only when shown. `searchIcons(query)` (exported with the picker) gives the same ranking, and `ICON_PICKER_LIMIT` is 60.
- **Schema:** `iconPickerPropsSchema` (type `IconPickerSerializableProps`) in `@inithium/shared-contracts`. A stored icon name is validated with `iconNameSchema`.
