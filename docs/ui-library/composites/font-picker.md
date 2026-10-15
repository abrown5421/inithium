---
title: FontPicker
description: A field for choosing a theme font or a font library family, each shown in its own font.
scope: core
tags: [ui, composite, fonts, typography, forms]
order: 18
decisions: ["0055", "0111", "0112"]
component:
  name: FontPicker
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: div
---

# FontPicker

FontPicker is a field for choosing a font ([0111](../../decisions/0111-keep-uploaded-font-families-in-a-library.md)). It looks like an [Input](../components/input.md) showing the chosen font's name, with an "Aa" drawn in it. Clicking it opens a list below of the theme's **Display** and **Body** fonts, then the font library's families, each drawn in its own font. It works like [IconPicker](icon-picker.md).

Its value is what Text's [`fontFamily`](../components/text.md#fontfamily) takes: `'display'`, `'body'` or `{ familyId }` ([0112](../../decisions/0112-give-text-typography-props-with-library-font-families.md)). Prefer the roles: they follow a re-brand, while a library family stays that family.

FontPicker is data only: pass the families to offer as `families`. Families draw through the theme's font CSS, so the app must render [`ThemeFonts`](../theme/index.md#fonts) (both apps do). In the CMS, use `FontField` (`@inithium/cms-media`), which loads the library itself.

## Import

```tsx
import { FontPicker } from '@inithium/shared-ui-composites';
```

## Props at a glance

Type names such as `Colour`, `Sides`, `Size` and `Variants<T>` are defined on [Style props](../style-props.md).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`value`, `defaultValue`, `onValueChange`](#value-defaultvalue-and-onvaluechange) | `FontFamilyValue \| undefined` | none | The chosen font |
| [`families`](#families) | `{ id, name }[]` | `[]` | The font library's families to offer |
| [`roles`](#roles) | `boolean` | `true` | Offer the theme's Display and Body fonts |
| [`emptyLabel`](#emptylabel) | `string` | none | Offers an option for no choice |
| [`label`](#label) | `string` | none | The field's label |
| [`placeholder`](#placeholder) | `string` | `'Default'` | Shown while nothing is chosen |
| [`helperText`](#helpertext) | `string` | none | Guidance under the field |
| [`required`, `disabled`](#required-and-disabled) | `boolean` | `false` | |
| [`error`](#error) | `boolean \| string` | none | Marks the field invalid |
| [`name`](#name) | `string` | none | Submits the choice in forms |
| [`variant`, `color`](#variant-and-color) | Input's | `'outlined'`, `'primary'` | Field look and accent |
| [`width`, `minWidth`, `maxWidth`](#width-minwidth-and-maxwidth) | `Variants<Size>` | `'full'` | Field width |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | none | Spacing, px |
| [`animation`](#animation) | `Animation` | none | Animations |

## Props

#### `value`, `defaultValue` and `onValueChange`

The chosen font: a theme role, `{ familyId }`, or `undefined` for none. Pass `value` to control it, or `defaultValue` to let the picker hold its own. `onValueChange` receives the new choice, or `undefined` when the [`emptyLabel`](#emptylabel) option is chosen. A family that's no longer in `families` shows as "Missing font (shown as Body)", since Text draws a missing family in the body font. **Type:** `FontFamilyValue | undefined` (from `@inithium/shared-contracts`).

```tsx
const [font, setFont] = useState<FontFamilyValue | undefined>('display');
<FontPicker label="Font" families={families} value={font} onValueChange={setFont} />
<FontPicker label="Font" defaultValue={{ familyId: '6ad0ed20e70f1c3dfcbe376a' }} families={families} />
```

#### `families`

The library families to offer, after the roles, in the order given: each one's `id` and the `name` to show. **Type:** `{ id: string; name: string }[]`. **Default:** `[]`.

```tsx
<FontPicker label="Font" families={[{ id: '6ad0ed20e70f1c3dfcbe376a', name: 'Inter' }]} />
```

#### `roles`

Whether the theme's **Display** and **Body** fonts come first. Turn it off where a role makes no sense, such as choosing the font a role itself uses (Settings does). **Type:** `boolean`. **Default:** `true`.

```tsx
<FontPicker label="Display font" roles={false} families={families} />
```

#### `emptyLabel`

Adds a first option for no choice (`undefined`), with this label, e.g. "Block default". Leave it out to require a font. **Type:** `string`.

```tsx
<FontPicker label="Heading font" emptyLabel="Block default" families={families} />
```

#### `label`

Sits in the field and floats above it once a font is chosen. It also names the list ("Heading font options"). **Type:** `string`.

#### `placeholder`

Shown while no font is chosen. **Type:** `string`. **Default:** `'Default'`.

#### `helperText`

A line of guidance under the field, replaced by the error while one shows. **Type:** `string`.

#### `required` and `disabled`

`required` adds the asterisk to the label. `disabled` greys the field out and stops it opening. **Type:** `boolean`.

#### `error`

Marks the field invalid; a message replaces the helper text. Choosing a font hides it until `error` changes. **Type:** `boolean | string`.

#### `name`

Inside a form, submits the choice under this name: the role, the family id, or empty for none. **Type:** `string`.

#### `variant` and `color`

As on [Input](../components/input.md#variant): `outlined`, `filled` or `standard`; `color` is the focus accent, and the tint and ring around the chosen font in the list. **Default:** `'outlined'`, `'primary'`.

#### `width`, `minWidth` and `maxWidth`

The field's [size](../style-props.md#size). The list is as wide as the field, and at least 280px. **Type:** `Variants<Size>`. **Default:** `width` `'full'`.

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px, as on Input. **Type:** `Variants<Sides>`.

#### `animation`

The [animation prop](../animations/index.md). **Type:** `{ entrance?, exit?, attention? }`.

## Examples

### Example: Basic

The roles and two library families, each drawn in its own font; the sample underneath follows the choice.

```example
ui-library/font-picker/basic
```

### Example: Default option and library only

An `emptyLabel` option for "no choice", and a picker offering only library families, filled in the secondary colour.

```example
ui-library/font-picker/default-option
```

### Example: Required and error

A required field showing an error, and a disabled one.

```example
ui-library/font-picker/required-and-error
```

## Accessibility

- **Opening:** the field announces that it opens a dialog and whether it's open. Enter, Space or the down arrow open it, and focus moves to the chosen font (or the first).
- **The list** is a listbox with one tab stop. The up and down arrows move one font, Home and End jump to the ends, and Enter or Space picks and closes. Escape closes, and focus returns to the field.
- **Names:** each option is named by its label (and, for the roles, a caption saying what they're for). The "Aa" in the field is hidden from screen readers.

## Notes

- **How fonts draw:** a role reads `--font-display` / `--font-body`; a family reads `--font-family-<id>`, which the theme's font CSS sets for every family (`themeFontsCss()`, [Theme: fonts](../theme/index.md#fonts)).
- **Schema:** `fontPickerPropsSchema` (type `FontPickerSerializableProps`) in `@inithium/shared-contracts`. A stored choice is validated with `fontFamilySchema`, which accepts only real family ids.
