---
title: AutoIncrementingList
description: A list that grows and shrinks one row at a time, with a minus button on each row and a plus button on the last, around any content.
scope: core
tags: [ui, composite, forms]
order: 3
decisions: ["0048", "0054", "0064", "0070"]
component:
  name: AutoIncrementingList
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: ul
---

# AutoIncrementingList

AutoIncrementingList lets the user add and remove rows of anything: colour pickers, email fields, steps ([0070](../../decisions/0070-grow-and-shrink-lists-one-row-at-a-time.md)). Each row shows its content with a minus button to remove it; the last row also has a plus button to add a new row after it. Minus buttons disappear when the list is down to its minimum (one row by default), and the plus disappears at the maximum.

You decide what an item is and how it's drawn: `createItem` makes a new one, and `renderItem` draws each one, with an `update` function to change it.

## Import

```tsx
import { AutoIncrementingList } from '@inithium/shared-ui-composites';
```

## Props at a glance

Type names such as `Colour`, `Sides` and `Variants<T>` are defined on [Style props](../style-props.md). `createItem` and `renderItem` are required.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`items`, `defaultItems`, `onItemsChange`](#items-defaultitems-and-onitemschange) | `T[]` | one new item | The items |
| [`createItem`](#createitem) | `() => T` | **required** | Makes an item for + |
| [`renderItem`](#renderitem) | `(item, index, update) => ReactNode` | **required** | Draws an item |
| [`min`, `max`](#min-and-max) | `number` | `1`, none | Row limits |
| [`label`, `helperText`, `error`](#label-helpertext-and-error) | | none | Name, guidance, error |
| [`itemLabel`](#itemlabel) | `string` | `'item'` | Wording on the buttons |
| [`addColor`, `removeColor`](#addcolor-and-removecolor) | `Colour` | `'primary'`, `'red'` | Button colours |
| [`align`](#align) | `'end' \| 'center'` | `'end'` | Buttons against each row |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | none | Spacing, px |
| [`animation`](#animation) | `Animation` | none | Animations |

## Props

#### `items`, `defaultItems` and `onItemsChange`

The items, of any type. Pass `items` to control the list, or `defaultItems` to let it hold its own. `onItemsChange` receives the new array whenever an item is added, removed or updated. A list that starts empty gets one item from `createItem`. **Type:** `T[]`, `(items: T[]) => void`. **Default:** one new item.

```tsx
const [tags, setTags] = useState(['design', 'react']);
<AutoIncrementingList items={tags} onItemsChange={setTags} createItem={() => ''} renderItem={…} />
```

Each row keeps its own state (e.g. an open picker, typed text) even when a row above it is removed: the list tracks rows itself, so items don't need ids.

#### `createItem`

Makes the item the plus button adds. **Type:** `() => T`. **Required.**

```tsx
createItem={() => ({ color: 'primary', intensity: 500 })}
```

#### `renderItem`

Draws one item, given the item, its position (from 0) and an `update` function that replaces it. The item fills the row; the buttons sit after it. Name each row's field for screen readers, e.g. with its position. **Type:** `(item: T, index: number, update: (next: T) => void) => ReactNode`. **Required.**

```tsx
renderItem={(colour, index, update) => (
  <ColorPicker aria-label={`Colour ${index + 1}`} value={colour} onValueChange={update} />
)}
```

#### `min` and `max`

The fewest and most rows. At `min`, the minus buttons disappear; at `max`, the plus button does. **Type:** `number`. **Default:** `min` is `1`; no `max`.

```tsx
<AutoIncrementingList max={5} … />
```

#### `label`, `helperText` and `error`

A name above the list (it also names the list for screen readers), a line of guidance under it, and an error that replaces the guidance in red. The error hides when the list changes, and shows again when `error` changes. **Type:** `string`, `string`, `boolean | string`.

#### `itemLabel`

What a row is called on the buttons and in their tooltips: "Add colour", "Remove colour 2". **Type:** `string`. **Default:** `'item'`.

#### `addColor` and `removeColor`

The plus and minus buttons' colours, as on a filled [Button](../components/button.md#color). **Type:** [`Colour`](../style-props.md#colour-value), except `'transparent'`. **Default:** `'primary'` and `'red'`.

#### `align`

`end` lines the buttons up with the bottom of each row, so they sit level with fields whose labels float above them; `center` centres them. **Type:** `'end' | 'center'`. **Default:** `'end'`.

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px, around the whole list. **Type:** `Variants<Sides>`.

#### `animation`

The [animation prop](../animations/index.md), for the whole list. Rows have their own: added rows fade in from above, removed rows fade out and the gap closes. **Type:** `{ entrance?, exit?, attention? }`.

## Examples

### Example: Colour lists

Two lists of [ColorPickers](color-picker.md): one starting with a single colour (no minus), one with three.

```example
ui-library/auto-incrementing-list/colour-lists
```

### Example: Email addresses

[Inputs](../components/input.md), up to five, with helper text.

```example
ui-library/auto-incrementing-list/email-addresses
```

### Example: Any content

Plain rows, centred buttons, a minimum of two, and custom button colours.

```example
ui-library/auto-incrementing-list/any-content
```

### Example: Controlled

The array updates as you add, remove and type.

```example
ui-library/auto-incrementing-list/controlled
```

## Accessibility

- **The list** is a `<ul>` named by `label`; each row is an `<li>`.
- **Buttons** are labelled "Add colour" and "Remove colour 2" (with `itemLabel`), and show the same text in a tooltip.
- **Focus follows the change:** after adding, it moves into the new row (its first field or button); after removing, into the row now at that position (or the one before, if the last was removed).
- **Announcements:** screen readers hear "Colour added" or "Colour 2 removed".
- **Reduced motion:** rows appear and disappear without animating, and the gap closes instantly.

## Notes

- **Fixed metrics:** rows 8px apart, square 32px buttons 8px from the content and each other, so rows line up with Inputs and Buttons.
- **Not included:** drag-to-reorder, and form naming. Fields inside rows submit themselves; name them in `renderItem` (e.g. `name={\`emails[${index}]\`}`).
- **Schema:** `autoIncrementingListPropsSchema` (type `AutoIncrementingListSerializableProps`) in `@inithium/shared-contracts`. `items`, `createItem` and `renderItem` aren't stored.
