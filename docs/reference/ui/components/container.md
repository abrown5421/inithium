---
title: Container
description: The general-purpose box for layout (flex, grid, position, overflow), spacing, sizing, colour, borders and animation.
scope: core
tags: [ui, component, layout]
order: 1
decisions: ["0042", "0043", "0045", "0048"]
component:
  name: Container
  layer: component
  import: '@inithium/shared-ui-components'
  element: div
---

# Container

Container is the box everything else is built from: page sections, cards, rows, grids, sticky bars, clickable tiles. It lays out its children with flex or grid, and takes every shared style prop and the animation prop. For text, use [Text](text.md).

## Import

```tsx
import { Container } from '@inithium/shared-ui-components';
```

## Basic usage

```tsx
<Container padding={{ all: 16 }} radius={{ all: 8 }} bgColor={{ color: 'surface', intensity: 50 }}>
  …
</Container>
```

Renders `<div class="ui-pt ui-pr …" style="--ui-pt: 16px; …">` with no default styling of its own.

## Props

Type names such as `Colour`, `Sides`, `Size`, `Radius` and `Variants<T>` are defined on [Style props](../style-props.md). Unless noted, every prop is optional and sets nothing when omitted.

### Element

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `'div'`, `'section'`, `'article'`, `'header'`, `'footer'`, `'nav'`, `'main'`, `'aside'`, `'ul'`, `'ol'`, `'li'` | `'div'` | The element to render ([0045](../../../decisions/0045-constrained-as-prop-for-semantic-elements.md)). Use landmarks (`main`, `nav`, `header`, `footer`) and lists where they apply. |
| `children` | `ReactNode` | none | Content. |

### Colour

| Prop | Type | Description |
| --- | --- | --- |
| `bgColor` | `Variants<Colour>` | Background. See [Colour value](../style-props.md#colour-value). |
| `textColor` | `Variants<Colour>` | Text colour, inherited by Text children that don't set their own. |
| `borderColor` | `Variants<Colour>` | Border colour (needs `borderWidth`). |
| `shadowColor` | `Variants<Colour>` | Shadow colour (needs `shadow`). |

### Spacing

| Prop | Type | Description |
| --- | --- | --- |
| `margin` | `Variants<Sides>` | Outer spacing in px; negative values allowed. See [Sides](../style-props.md#sides). |
| `padding` | `Variants<Sides>` | Inner spacing in px. |

### Sizing

| Prop | Type | Description |
| --- | --- | --- |
| `width`, `height` | `Variants<Size>` | See [Size](../style-props.md#size): px, `'full'`, `'screen'`, `'n/d'`, `'auto'`, `'fit'`. |
| `minWidth`, `maxWidth` | `Variants<Size>` | Width limits. |
| `minHeight`, `maxHeight` | `Variants<Size>` | Height limits. |

### Borders and shadow

| Prop | Type | Description |
| --- | --- | --- |
| `borderWidth` | `Variants<Sides>` | Border width per side, px. |
| `borderStyle` | `Variants<BorderStyle>` | `'solid'` (default once a width is set), `'dashed'`, `'dotted'`, `'double'`, `'none'`. |
| `radius` | `Variants<Radius>` | Corner radius, px. See [Radius](../style-props.md#radius). |
| `shadow` | `Variants<ShadowSize>` | `'none'`, `'2xs'` … `'2xl'`. See [Shadow size](../style-props.md#shadow-size). |

### Layout

Layout props are objects whose **fields** each take a value or a [variant object](../style-props.md#variants), e.g. `flex={{ direction: { base: 'column', md: 'row' } }}` ([0043](../../../decisions/0043-group-container-layout-props-into-objects.md)).

#### `flex`

Setting `flex` makes the Container `display: flex`.

| Field | Values | Description |
| --- | --- | --- |
| `direction` | `'row'`, `'column'`, `'row-reverse'`, `'column-reverse'` | Main axis. Browser default `'row'`. |
| `align` | `'start'`, `'center'`, `'end'`, `'stretch'`, `'baseline'` | Cross-axis alignment (`align-items`). |
| `justify` | `'start'`, `'center'`, `'end'`, `'between'`, `'around'`, `'evenly'` | Main-axis distribution (`justify-content`). |
| `wrap` | `'wrap'`, `'nowrap'`, `'wrap-reverse'` | Whether children wrap. |
| `gap` | px, or `{ x, y }` | Space between children; `x` between columns, `y` between rows. |

#### `grid`

Setting `grid` makes the Container `display: grid`.

| Field | Values | Description |
| --- | --- | --- |
| `columns` | integer ≥ 1 | Number of equal-width columns. |
| `rows` | integer ≥ 1 | Number of equal-height rows. |
| `align` | `'start'`, `'center'`, `'end'`, `'stretch'`, `'baseline'` | Vertical alignment of items (`align-items`). |
| `justify` | `'start'`, `'center'`, `'end'`, `'stretch'` | Horizontal alignment of items (`justify-items`). |
| `gap` | px, or `{ x, y }` | Space between cells. |

#### `position`

| Field | Values | Description |
| --- | --- | --- |
| `type` | `'static'`, `'relative'`, `'absolute'`, `'fixed'`, `'sticky'` | Positioning scheme. |
| `all`, `x`, `y`, `top`, `right`, `bottom`, `left` | px (negative allowed) | Offsets, with the same precedence as [Sides](../style-props.md#sides): a side overrides `x`/`y`, which override `all`. |
| `z` | integer | Stacking order (`z-index`). |

#### `overflow`

| Field | Values | Description |
| --- | --- | --- |
| `all` | `'visible'`, `'hidden'`, `'auto'`, `'scroll'`, `'clip'` | Both axes. |
| `x`, `y` | same | One axis; overrides `all`. |

#### `flexItem`

How this Container behaves inside a flex parent.

| Field | Values | Description |
| --- | --- | --- |
| `grow` | number ≥ 0 | Share of free space it takes. |
| `shrink` | number ≥ 0 | How much it shrinks when space runs out. |
| `basis` | `Size` | Starting size along the main axis. |
| `alignSelf` | `'auto'`, `'start'`, `'center'`, `'end'`, `'stretch'`, `'baseline'` | Overrides the parent's `align`. |
| `order` | integer | Visual order. |

#### `gridItem`

How this Container behaves inside a grid parent.

| Field | Values | Description |
| --- | --- | --- |
| `colSpan` | integer ≥ 1, or `'full'` | Columns to span; `'full'` spans every column. |
| `rowSpan` | integer ≥ 1, or `'full'` | Rows to span. |
| `alignSelf` | `'auto'`, `'start'`, `'center'`, `'end'`, `'stretch'`, `'baseline'` | Overrides the parent's `align`. |

#### `hidden`

| Prop | Type | Description |
| --- | --- | --- |
| `hidden` | `Variants<boolean>` | `true` hides it with `display: none`; e.g. `{ base: true, lg: false }` shows it only from `lg`. It stays mounted; to remove it from the page, use `show`. |

### Animation

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `animation` | `{ entrance?, exit?, attention? }` | none | See [Animation](../animation.md). |
| `stagger` | number (ms) | none | Adds index × ms to each direct child's entrance delay. |
| `show` | `boolean` | `true` | `false` plays the exit, then unmounts the Container. Runtime only. |
| `replay` | any | none | Replays the attention animation when it changes. Runtime only. |
| `onEntranceEnd`, `onExitEnd` | `() => void` | none | Called when the entrance or exit finishes. Runtime only. |

### HTML attributes and `ref`

Any other attribute is passed to the element: `id`, `role`, `tabIndex`, `aria-*`, `data-*`, event handlers (`onClick`, `onKeyDown`, …) and `ref`, which receives the rendered element. There is **no `className` or `style`**, and the native `hidden` attribute is replaced by the prop above.

## Styling examples

**Card with a hover state:**

```tsx
<Container
  padding={{ all: 16 }}
  radius={{ all: 12 }}
  bgColor={{ base: { color: 'surface', intensity: 50 }, hover: { color: 'primary', intensity: 100 } }}
  borderWidth={{ all: 1 }}
  borderColor={{ color: 'surface', intensity: 500 }}
  shadow={{ base: 'sm', hover: 'lg' }}
/>
```

**Stack on mobile, row from `md`:**

```tsx
<Container flex={{ direction: { base: 'column', md: 'row' }, gap: { base: 8, md: 24 }, align: 'center' }} />
```

**Centred page column** (margins are pixels, so centre with the parent's flex):

```tsx
<Container as="main" flex={{ direction: 'column', align: 'center' }} minHeight="screen">
  <Container width="full" maxWidth={1120} padding={{ base: { x: 16 }, md: { x: 32 } }}>…</Container>
</Container>
```

**Responsive grid with a wide item:**

```tsx
<Container grid={{ columns: { base: 1, md: 3 }, gap: 16 }}>
  <Container gridItem={{ colSpan: { base: 1, md: 2 } }}>Wide</Container>
  <Container>Narrow</Container>
</Container>
```

**Sticky header:**

```tsx
<Container as="header" position={{ type: 'sticky', top: 0, z: 10 }} bgColor={{ color: 'surface', intensity: 50 }} />
```

**Content that fills the viewport below a navbar and scrolls on its own:**

```tsx
<Container height="screen" flex={{ direction: 'column' }}>
  <Container as="nav" height={64}>…</Container>
  <Container as="main" flexItem={{ grow: 1 }} minHeight={0} overflow={{ y: 'auto' }}>…</Container>
</Container>
```

`minHeight={0}` lets the content area shrink below its content's height so that it scrolls instead of growing.

**Translucent overlay:**

```tsx
<Container position={{ type: 'fixed', all: 0, z: 50 }} bgColor={{ color: 'quaternary', intensity: 950, opacity: 60 }} />
```

**Keyboard-visible focus ring on a clickable tile:**

```tsx
<Container
  role="button"
  tabIndex={0}
  onClick={select}
  borderWidth={{ all: 2 }}
  borderColor={{ base: 'transparent', focus: { color: 'accent', intensity: 500 } }}
/>
```

## Accessibility

- Choose `as` for meaning: landmarks (`main`, `nav`, `header`, `footer`, `aside`) help screen-reader users move around, and `ul`/`ol` with `li` children announce lists.
- A clickable Container isn't a button. Give it `role="button"` and `tabIndex={0}`, and handle Enter and Space in `onKeyDown`. A Button component will replace this pattern.
- `hidden` removes content visually and from assistive technology. `show={false}` removes it from the page entirely, after its exit animation.

## Notes

- `flex` and `grid` together: `flex` wins for `display`. Use one per Container.
- A Container with no props renders a plain element with no classes.
- `textColor` set on a Container is inherited by descendants, the same as CSS `color`.
