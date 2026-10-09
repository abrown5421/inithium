---
title: Divider
description: A horizontal or vertical line between content, optionally with a label such as "or", in any colour, thickness and style.
scope: core
tags: [ui, component, layout]
order: 4
decisions: ["0042", "0048", "0056", "0060"]
component:
  name: Divider
  layer: component
  import: '@inithium/shared-ui-components'
  element: hr
---

# Divider

Divider separates content with a line ([0060](../../decisions/0060-draw-dividers-as-native-separators-with-an-optional-label.md)). Horizontal dividers fill the width of their container; vertical ones stretch to the height of a flex row, or sit 1em tall inside a line of text. A `label` puts text in the line, like the "or continue with" on a sign-in page.

## Import

```tsx
import { Divider } from '@inithium/shared-ui-components';
```

## Props at a glance

Type names such as `Colour`, `Sides` and `Variants<T>` are defined on [Style props](../style-props.md). No prop is required.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`orientation`](#orientation) | `'horizontal' \| 'vertical'` | `'horizontal'` | Which way it runs |
| [`color`](#color) | `Colour` | surface 500 at 40% | Line colour |
| [`thickness`](#thickness) | `number` | `1` | Line thickness, px |
| [`lineStyle`](#linestyle) | `'solid' \| 'dashed' \| 'dotted'` | `'solid'` | Line style |
| [`label`](#label) | `string` | none | Text in the line |
| [`labelAlign`](#labelalign) | `'start' \| 'center' \| 'end'` | `'center'` | Where the label sits |
| [`decorative`](#decorative) | `boolean` | `false` | Hide from screen readers |
| [`margin`](#margin) | `Variants<Sides>` | none | Space around it, px |
| [`padding`](#padding) | `Variants<Sides>` | `{ x: 12 }` | Space around the label, px |
| [`animation`](#animation) | `Animation` | none | Animations |
| [`show`, `replay`, `onEntranceEnd`, `onExitEnd`](#runtime-props) | | | Runtime animation control |
| [HTML attributes and `ref`](#html-attributes-and-ref) | | | `id`, `aria-*`, `ref` |

## Props

### Line

#### `orientation`

Which way the line runs. A horizontal divider fills its container's width. A vertical one stretches to the height of the flex row it's in, or is 1em tall in a line of text. **Type:** `'horizontal' | 'vertical'`. **Default:** `'horizontal'`.

```tsx
<Divider />
<Container flex={{ align: 'center', gap: 4 }}>
  <Button variant="ghost">Cut</Button>
  <Divider orientation="vertical" />
  <Button variant="ghost">Paste</Button>
</Container>
```

#### `color`

The line's colour, a [colour value](../style-props.md#colour-value). **Type:** `Colour`. **Default:** `{ color: 'surface', intensity: 500, opacity: 40 }`, the theme's border role softened.

```tsx
<Divider color="primary" />
<Divider color={{ color: 'surface', intensity: 700 }} />
```

#### `thickness`

The line's thickness in px. **Type:** `number`. **Default:** `1`.

```tsx
<Divider thickness={2} />
```

#### `lineStyle`

**Type:** `'solid' | 'dashed' | 'dotted'`. **Default:** `'solid'`.

```tsx
<Divider lineStyle="dashed" />
<Divider lineStyle="dotted" thickness={3} />
```

### Label

#### `label`

Text in the line, between two line segments. It's read as ordinary text by screen readers. **Type:** `string`.

```tsx
<Divider label="or continue with" />
<Divider orientation="vertical" label="or" />
```

#### `labelAlign`

Where the label sits: in the middle, or 24px from the start or end. **Type:** `'start' | 'center' | 'end'`. **Default:** `'center'`.

```tsx
<Divider label="Advanced" labelAlign="start" />
```

### Accessibility

#### `decorative`

Hides the divider from screen readers, for lines that are purely visual, e.g. between toolbar buttons or inline links. **Type:** `boolean`. **Default:** `false`.

```tsx
<Divider orientation="vertical" decorative />
```

### Spacing

#### `margin`

[Sides](../style-props.md#sides) in px, around the divider. A divider has no margin by default; add it to space sections apart. **Type:** `Variants<Sides>`.

```tsx
<Divider margin={{ y: 16 }} />
<Divider orientation="vertical" margin={{ x: 8 }} />
```

#### `padding`

[Sides](../style-props.md#sides) in px, around the label: the gap between the text and the lines. It has no effect without a label. **Type:** `Variants<Sides>`. **Default:** `{ x: 12 }` (`{ y: 8 }` when vertical).

```tsx
<Divider label="or" padding={{ x: 24 }} />
```

### Animation

#### `animation`

See [Animation](../animations/index.md), e.g. to fade a divider in with the section it introduces. **Type:** `{ entrance?, exit?, attention? }`.

```tsx
<Divider show={expanded} animation={{ entrance: { name: 'fadeIn' }, exit: { name: 'fadeOut' } }} />
```

#### Runtime props

`show`, `replay`, `onEntranceEnd` and `onExitEnd` work as on every component ([Animation: runtime props](../animations/index.md#runtime-props)).

### HTML attributes and `ref`

Other attributes go to the divider's element, and `ref` receives it: an `<hr>`, a `<span>` (vertical) or a `<div>` (labelled). There is no `className`, `style` or `children`.

```tsx
<Divider id="billing-divider" data-testid="billing-divider" />
```

## Examples

### Example: Between sections

A divider with vertical margin between two sections.

```example
ui-library/divider/between-sections
```

### Example: Colours, thickness and styles

The default line, then colour, thickness and dashed and dotted styles.

```example
ui-library/divider/colours-thickness-and-styles
```

### Example: With a label

"or continue with" between sign-in options.

```example
ui-library/divider/with-a-label
```

### Example: Label alignment

Labels at the start, centre and end, and a wider gap around a label.

```example
ui-library/divider/label-alignment
```

### Example: Vertical

Between toolbar buttons, between inline links, and with a label.

```example
ui-library/divider/vertical
```

### Example: Animated

A labelled divider that fades in with the section it introduces.

```example
ui-library/divider/animated
```

## Accessibility

- **Native semantics:** a plain horizontal divider is an `<hr>`, which screen readers announce as a separator. A vertical one is `role="separator"` with `aria-orientation="vertical"`. No library is needed ([0056](../../decisions/0056-use-radix-primitives-for-interactive-widgets.md)).
- **Labelled dividers** are a `<div>` whose label is read as plain text; the line segments are hidden.
- **Use `decorative`** when the divider only separates things visually (toolbar groups, inline links); screen readers then skip it.
- **Contrast:** the default line is deliberately soft. Don't rely on a divider alone to convey structure; use headings too.

## Notes

- **Fixed:** the label uses the `body` font at 14px in `surface-600`; `start` and `end` labels sit 24px from that end.
- **Vertical dividers need a height:** in a flex row they stretch to it; on their own they're 1em tall.
- **Schemas:** `dividerPropsSchema` (type `DividerSerializableProps`) and `dividerStylePropsSchema` in `@inithium/shared-contracts`.
