---
title: Text
description: All text content (headings, paragraphs, inline text and labels) with typography, colour, spacing and animation props.
scope: core
tags: [ui, component, typography]
order: 9
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

## Props at a glance

Type names such as `Colour`, `Sides`, `Size`, `Radius` and `Variants<T>` are defined on [Style props](../style-props.md). Every prop is optional. A prop you don't pass sets nothing, so the text inherits from its parent.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`as`](#as) | element name | `'p'` | The element to render |
| [`htmlFor`](#htmlfor) | `string` | none | The input a label belongs to |
| [`children`](#children) | `ReactNode` | none | The text |
| [`fontFamily`](#fontfamily) | `Variants<'display' \| 'body'>` | `'body'` | Theme font family |
| [`fontSize`](#fontsize) | `Variants<number>` | inherited | px |
| [`fontWeight`](#fontweight) | `Variants<100…900>` | inherited | Weight |
| [`align`](#align) | `Variants<…>` | inherited | Text alignment |
| [`lineHeight`](#lineheight) | `Variants<number>` | inherited | Ratio of the font size |
| [`letterSpacing`](#letterspacing) | `Variants<number>` | inherited | px |
| [`truncate`](#truncate) | `Variants<number \| false>` | none | Lines before an ellipsis |
| [`textColor`](#textcolor) | `Variants<Colour>` | inherited | Text colour |
| [`bgColor`](#bgcolor) | `Variants<Colour>` | none | Background |
| [`borderColor`](#bordercolor) | `Variants<Colour>` | none | Border colour |
| [`shadowColor`](#shadowcolor) | `Variants<Colour>` | black | Shadow colour |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | none | Spacing, px |
| [`width`, `height` and limits](#sizing) | `Variants<Size>` | none | Size |
| [`borderWidth`, `borderStyle`, `radius`, `shadow`](#borders-and-shadow) | | none | Borders and shadow |
| [`animation`](#animation) | `Animation` | none | Animations |
| [`show`, `replay`, `onEntranceEnd`, `onExitEnd`](#runtime-props) | | | Runtime animation control |
| [HTML attributes and `ref`](#html-attributes-and-ref) | | | `id`, `role`, `aria-*`, events, `ref` |

## Props

### Element

#### `as`

The element to render ([0045](../../decisions/0045-constrained-as-prop-for-semantic-elements.md)). **Type:** `'h1'`–`'h6'`, `'p'`, `'span'`, `'label'`. **Default:** `'p'`.

```tsx
<Text>A paragraph</Text>                       // <p>
<Text as="h1">Page title</Text>
<Text as="span">Inline text</Text>             // inside other text or a flex row
<Text as="label" htmlFor="email">Email</Text>
```

#### `htmlFor`

With `as="label"`: the `id` of the field it labels. Clicking the label focuses the field. An [Input](input.md) usually brings its own floating `label`; use `htmlFor` for a fixed label above it instead, pointing at the Input's `id`. **Type:** `string`.

```tsx
<Text as="label" htmlFor="email">Email</Text>
<Input id="email" type="email" />
```

#### `children`

The text, which can include other components. **Type:** `ReactNode`.

```tsx
<Text>
  Signed in as <Text as="span" fontWeight={700}>Alex</Text> <Icon name="check" size={16} />
</Text>
```

### Typography

#### `fontFamily`

One of the theme's two families ([Theme: fonts](../theme/index.md#fonts)). **Type:** `Variants<'display' | 'body'>`. **Default:** `body`, the page default.

```tsx
<Text fontFamily="display">Brand heading</Text>
<Text fontFamily="body">Body text</Text>
```

#### `fontSize`

Font size in px. **Type:** `Variants<number>`.

```tsx
<Text fontSize={18}>Large body</Text>
<Text as="h1" fontSize={{ base: 32, md: 48 }}>Grows from 768px</Text>
```

#### `fontWeight`

**Type:** `Variants<100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900>`. The body font covers 300–800; the display font has only 400, and the browser synthesises other weights.

```tsx
<Text fontWeight={300}>Light</Text>
<Text fontWeight={700}>Bold</Text>
<Text fontWeight={{ base: 400, hover: 700 }}>Bolder on hover</Text>
```

#### `align`

**Type:** `Variants<'left' | 'center' | 'right' | 'justify' | 'start' | 'end'>`.

```tsx
<Text align="center">Centred</Text>
<Text align={{ base: 'center', md: 'left' }}>Centred on mobile, left from 768px</Text>
```

#### `lineHeight`

A ratio of the font size. **Type:** `Variants<number>`.

```tsx
<Text lineHeight={1.6}>Relaxed paragraph</Text>
<Text as="h1" fontSize={48} lineHeight={1.1}>Tight heading</Text>
```

#### `letterSpacing`

px; negative allowed. **Type:** `Variants<number>`.

```tsx
<Text letterSpacing={2}>WIDE CAPS</Text>
<Text letterSpacing={-0.5}>Slightly tight</Text>
```

#### `truncate`

The number of lines to show before an ellipsis (`1` is a single line); `false` turns truncation off. **Type:** `Variants<number | false>`.

```tsx
<Text truncate={1}>One line, then …</Text>
<Text truncate={3}>Up to three lines, then …</Text>
<Text truncate={{ base: 2, md: false }}>Two lines on mobile, full text from 768px</Text>
```

### Colour

All colour props take a [colour value](../style-props.md#colour-value) and [variant keys](../style-props.md#variants).

#### `textColor`

**Type:** `Variants<Colour>`. **Default:** inherited from the parent. For body text on surface backgrounds, use `surface` 600–950.

```tsx
<Text textColor={{ color: 'surface', intensity: 800 }}>Body text</Text>
<Text textColor="primary">Primary 500</Text>
<Text textColor={{ base: { color: 'surface', intensity: 600 }, hover: { color: 'primary', intensity: 600 } }}>Hover me</Text>
```

#### `bgColor`

A background behind the text, e.g. a highlight or badge. **Type:** `Variants<Colour>`.

```tsx
<Text as="span" bgColor={{ color: 'accent', intensity: 100 }}>highlighted</Text>
```

#### `borderColor`

Needs `borderWidth`. **Type:** `Variants<Colour>`.

```tsx
<Text borderWidth={{ bottom: 2 }} borderColor="primary">Underlined with a border</Text>
```

#### `shadowColor`

Needs `shadow`. **Type:** `Variants<Colour>`.

```tsx
<Text as="span" padding={{ x: 8 }} shadow="md" shadowColor={{ color: 'primary', intensity: 500, opacity: 40 }}>Glow</Text>
```

### Spacing

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px. Headings and paragraphs have no default margins, so add spacing explicitly. `margin` may be negative. **Type:** `Variants<Sides>`.

```tsx
<Text as="h2" margin={{ bottom: 8 }}>Section</Text>
<Text margin={{ y: 16 }}>Paragraph with space above and below</Text>
<Text as="span" padding={{ x: 8, y: 2 }}>Padded inline text</Text>
```

### Sizing

`width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight` take a [size](../style-props.md#size). **Type:** `Variants<Size>`. `maxWidth` keeps line lengths readable.

```tsx
<Text maxWidth={640}>A paragraph that won't stretch across wide screens.</Text>
<Text as="span" width={120}>Fixed-width label column</Text>
```

### Borders and shadow

`borderWidth` ([sides](../style-props.md#sides)), `borderStyle` ([border style](../style-props.md#border-style)), `radius` ([radius](../style-props.md#radius)) and `shadow` ([shadow size](../style-props.md#shadow-size)), each with variant keys.

```tsx
<Text as="span" padding={{ x: 8, y: 2 }} radius={{ all: 999 }} borderWidth={{ all: 1 }} borderStyle="dashed">Tag</Text>
<Text padding={{ all: 12 }} radius={{ all: 8 }} shadow="sm" bgColor={{ color: 'surface', intensity: 50 }}>Callout</Text>
```

### Animation

#### `animation`

See [Animation](../animations/index.md) for every animation name. **Type:** `{ entrance?, exit?, attention? }`.

```tsx
<Text as="h1" animation={{ entrance: { name: 'fadeInDown', speed: 'fast' } }}>Welcome</Text>
<Text animation={{ entrance: { name: 'fadeInUp', when: 'inView' } }}>Appears on scroll</Text>
<Text animation={{ attention: { name: 'headShake' } }} replay={errorCount}>Check your password</Text>
```

#### Runtime props

`show`, `replay`, `onEntranceEnd` and `onExitEnd` work as on every component ([Animation: runtime props](../animations/index.md#runtime-props)). Text can't stagger its children; use a Container's `stagger`.

```tsx
<Text show={saved} animation={{ entrance: { name: 'fadeIn' }, exit: { name: 'fadeOut' } }}>Saved</Text>
```

### HTML attributes and `ref`

Other attributes (`id`, `role`, `aria-*`, `data-*`, event handlers) go to the element, and `ref` receives it. There is **no `className` or `style`**.

```tsx
<Text id="status" role="status" aria-live="polite">{message}</Text>
```

## Examples

### Example: Heading scale

A display-font page title and section headings that grow on larger screens.

```example
ui-library/text/heading-scale
```

### Example: Readable body copy

A paragraph with a comfortable line length and line height.

```example
ui-library/text/readable-body-copy
```

### Example: Inline emphasis and a badge

Spans inside a paragraph for emphasis, plus a pill badge.

```example
ui-library/text/inline-emphasis-and-a-badge
```

### Example: Responsive truncation

A description clamped to two lines on mobile and shown in full from 768px.

```example
ui-library/text/responsive-truncation
```

### Example: Form label

A fixed label above an [Input](input.md), linked by `htmlFor`, so clicking it focuses the field.

```example
ui-library/text/form-label
```

### Example: Link-style hover

Muted text that turns primary on hover, for use inside a link.

```example
ui-library/text/link-style-hover
```

## Accessibility

- Use heading levels in order (one `h1` per page, then `h2`, `h3` …). Screen readers navigate by them, and search engines read them. Choose the level for structure, and the size with `fontSize`.
- Every form field needs a label. [Input](input.md) has its own `label` prop; for anything else, use `as="label"` with `htmlFor` matching the field's `id`.
- On surface backgrounds (50–400), any surface text step from 600 to 950 meets WCAG AA contrast. Text on brand colours isn't guaranteed, so check it.

## Notes

- Headings have no built-in size or weight: Tailwind's base styles reset them, so an `h1` without `fontSize` looks like body text. Always set the size.
- `truncate` sets the element's `display` and `overflow`; avoid relying on those for anything else on a truncated Text.
- Text inherits `textColor` and the font from its parent when it doesn't set them.
