---
title: Text
description: All text content (headings, paragraphs, inline text and labels) with typography, colour, spacing and animation props.
scope: core
tags: [ui, component, typography]
order: 2
decisions: ["0042", "0044", "0045", "0046", "0048"]
component:
  name: Text
  layer: component
  import: '@inithium/shared-ui-components'
  element: p
---

# Text

Text renders every piece of text: headings, paragraphs, inline runs and form labels. It controls typography (family, size, weight, alignment, line height, letter spacing, truncation) and takes every shared style prop and the animation prop. For boxes and layout, wrap it in a [Container](container.md).

## Import

```tsx
import { Text } from '@inithium/shared-ui-components';
```

## Basic usage

```tsx
<Text as="h1" fontFamily="display" fontSize={40} textColor="primary">Inithium</Text>
<Text textColor={{ color: 'surface', intensity: 800 }}>A paragraph of body text.</Text>
```

## Props

Type names such as `Colour`, `Sides`, `Size`, `Radius` and `Variants<T>` are defined on [Style props](../style-props.md). Unless noted, every prop is optional and sets nothing when omitted, so the text inherits from its parent.

### Element

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `'h1'`, `'h2'`, `'h3'`, `'h4'`, `'h5'`, `'h6'`, `'p'`, `'span'`, `'label'` | `'p'` | The element to render ([0045](../../../decisions/0045-constrained-as-prop-for-semantic-elements.md)). Use `span` for text inside other text or inside a Container row. |
| `htmlFor` | `string` | none | With `as="label"`: the `id` of the input it labels. |
| `children` | `ReactNode` | none | The text. |

### Typography

| Prop | Type | Description |
| --- | --- | --- |
| `fontFamily` | `Variants<'display' \| 'body'>` | The theme's families ([Theme: fonts](../theme.md#fonts)). `body` is the page default. |
| `fontSize` | `Variants<number>` | px. |
| `fontWeight` | `Variants<100 \| 200 \| 300 \| 400 \| 500 \| 600 \| 700 \| 800 \| 900>` | The body font covers 300–800; the display font has only 400, and other weights are synthesised. |
| `align` | `Variants<'left' \| 'center' \| 'right' \| 'justify' \| 'start' \| 'end'>` | Text alignment. |
| `lineHeight` | `Variants<number>` | A ratio of the font size, e.g. `1.5`. |
| `letterSpacing` | `Variants<number>` | px; negative allowed. |
| `truncate` | `Variants<number \| false>` | Lines to show before an ellipsis (`1` = a single line). `false` turns truncation off, e.g. `{ base: 2, md: false }`. |

### Colour

| Prop | Type | Description |
| --- | --- | --- |
| `textColor` | `Variants<Colour>` | Text colour. See [Colour value](../style-props.md#colour-value). For body text on surface backgrounds, use `surface` 600–950. |
| `bgColor` | `Variants<Colour>` | Background behind the text, e.g. a highlight. |
| `borderColor` | `Variants<Colour>` | Border colour (needs `borderWidth`). |
| `shadowColor` | `Variants<Colour>` | Shadow colour (needs `shadow`). |

### Spacing, sizing, borders and shadow

| Prop | Type | Description |
| --- | --- | --- |
| `margin`, `padding` | `Variants<Sides>` | px. See [Sides](../style-props.md#sides). Headings and paragraphs have no default margins, so add spacing explicitly. |
| `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight` | `Variants<Size>` | See [Size](../style-props.md#size). `maxWidth` is useful for readable line lengths. |
| `borderWidth` | `Variants<Sides>` | Border width per side, px. |
| `borderStyle` | `Variants<BorderStyle>` | See [Border style](../style-props.md#border-style). |
| `radius` | `Variants<Radius>` | See [Radius](../style-props.md#radius). |
| `shadow` | `Variants<ShadowSize>` | See [Shadow size](../style-props.md#shadow-size). |

Text has no layout props (`flex`, `grid`, `position`, `overflow`, `hidden`). Wrap it in a Container for those.

### Animation

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `animation` | `{ entrance?, exit?, attention? }` | none | See [Animation](../animation.md). |
| `show` | `boolean` | `true` | `false` plays the exit, then unmounts the Text. Runtime only. |
| `replay` | any | none | Replays the attention animation when it changes. Runtime only. |
| `onEntranceEnd`, `onExitEnd` | `() => void` | none | Called when the entrance or exit finishes. Runtime only. |

Text can't stagger its children; use a Container's `stagger`.

### HTML attributes and `ref`

Any other attribute is passed to the element: `id`, `role`, `aria-*`, `data-*`, event handlers and `ref`, which receives the rendered element. There is **no `className` or `style`**.

## Styling examples

**A heading scale that grows on larger screens:**

```tsx
<Text as="h1" fontFamily="display" fontSize={{ base: 32, md: 48 }} lineHeight={1.1} textColor="primary">Title</Text>
<Text as="h2" fontSize={{ base: 22, md: 28 }} fontWeight={700} textColor={{ color: 'surface', intensity: 900 }}>Section</Text>
```

**Readable body copy:**

```tsx
<Text maxWidth={640} lineHeight={1.6} fontSize={18} textColor={{ color: 'surface', intensity: 800 }}>…</Text>
```

**Inline emphasis inside a paragraph:**

```tsx
<Text>
  Plans start at <Text as="span" fontWeight={700} textColor="accent">$9</Text> a month.
</Text>
```

**Clamp a description to two lines on mobile only:**

```tsx
<Text truncate={{ base: 2, md: false }}>…</Text>
```

**A label for an input:**

```tsx
<Text as="label" htmlFor="email" fontWeight={600}>Email</Text>
<input id="email" … />
```

**Muted text that brightens on hover (inside a link or button):**

```tsx
<Text as="span" textColor={{ base: { color: 'surface', intensity: 600 }, hover: { color: 'primary', intensity: 600 } }}>More</Text>
```

**A badge:**

```tsx
<Text as="span" fontSize={12} fontWeight={700} padding={{ x: 8, y: 2 }} radius={{ all: 999 }} bgColor="accent" textColor={{ color: 'accent', intensity: 950 }}>
  New
</Text>
```

## Accessibility

- Use heading levels in order (one `h1` per page, then `h2`, `h3` …). Screen readers navigate by them, and search engines read them. Choose the level for structure, and the size with `fontSize`.
- Every form input needs a label: `as="label"` with `htmlFor` matching the input's `id`.
- On surface backgrounds (50–400), any surface text step from 600 to 950 meets WCAG AA contrast. Text on brand colours isn't guaranteed, so check it.

## Notes

- Headings have no built-in size or weight: Tailwind's base styles reset them, so an `h1` without `fontSize` looks like body text. Always set the size.
- `truncate` sets the element's `display` and `overflow`; avoid relying on those for anything else on a truncated Text.
- Text inherits `textColor` and the font from its parent when it doesn't set them.
