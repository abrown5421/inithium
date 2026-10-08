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

## Props at a glance

Type names such as `Colour`, `Sides`, `Size`, `Radius` and `Variants<T>` are defined on [Style props](../style-props.md). Every prop is optional, and a prop you don't pass sets nothing.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`as`](#as) | element name | `'div'` | The element to render |
| [`children`](#children) | `ReactNode` | none | Content |
| [`bgColor`](#bgcolor) | `Variants<Colour>` | none | Background |
| [`textColor`](#textcolor) | `Variants<Colour>` | inherited | Text colour, inherited by descendants |
| [`borderColor`](#bordercolor) | `Variants<Colour>` | none | Border colour |
| [`shadowColor`](#shadowcolor) | `Variants<Colour>` | black | Shadow colour |
| [`margin`](#margin) | `Variants<Sides>` | none | Outer spacing, px |
| [`padding`](#padding) | `Variants<Sides>` | none | Inner spacing, px |
| [`width`, `height`](#width-and-height) | `Variants<Size>` | none | Size |
| [`minWidth`, `maxWidth`, `minHeight`, `maxHeight`](#size-limits) | `Variants<Size>` | none | Size limits |
| [`borderWidth`](#borderwidth) | `Variants<Sides>` | none | Border width, px |
| [`borderStyle`](#borderstyle) | `Variants<BorderStyle>` | `'solid'` | Border style |
| [`radius`](#radius) | `Variants<Radius>` | none | Corner radius, px |
| [`shadow`](#shadow) | `Variants<ShadowSize>` | none | Shadow size |
| [`flex`](#flex) | object | none | Flex layout |
| [`grid`](#grid) | object | none | Grid layout |
| [`position`](#position) | object | none | Positioning and offsets |
| [`overflow`](#overflow) | object | none | Overflow per axis |
| [`flexItem`](#flexitem) | object | none | Behaviour inside a flex parent |
| [`gridItem`](#griditem) | object | none | Behaviour inside a grid parent |
| [`hidden`](#hidden) | `Variants<boolean>` | `false` | Hide with `display: none` |
| [`animation`](#animation) | `Animation` | none | Entrance, exit and attention animations |
| [`stagger`](#stagger) | number (ms) | none | Cascade children's entrances |
| [`show`](#show) | `boolean` | `true` | Mount with an entrance / unmount after an exit (runtime) |
| [`replay`](#replay) | any | none | Replay the attention animation (runtime) |
| [`onEntranceEnd`, `onExitEnd`](#onentranceend-and-onexitend) | `() => void` | none | Animation callbacks (runtime) |
| [HTML attributes and `ref`](#html-attributes-and-ref) | | | `id`, `role`, `aria-*`, events, `ref` |

## Props

### Element

#### `as`

The element to render ([0045](../../../decisions/0045-constrained-as-prop-for-semantic-elements.md)). **Type:** `'div'`, `'section'`, `'article'`, `'header'`, `'footer'`, `'nav'`, `'main'`, `'aside'`, `'ul'`, `'ol'`, `'li'`. **Default:** `'div'`.

```tsx
<Container>…</Container>                 // <div>
<Container as="main">…</Container>       // a landmark
<Container as="ul">
  <Container as="li">First</Container>
  <Container as="li">Second</Container>
</Container>
```

#### `children`

Any content, including other components. **Type:** `ReactNode`.

```tsx
<Container>
  <Text>Hello</Text>
</Container>
```

### Colour

All colour props take a [colour value](../style-props.md#colour-value): an object, a colour name meaning 500, or `'transparent'`. They also take [variant keys](../style-props.md#variants).

#### `bgColor`

Background colour. **Type:** `Variants<Colour>`.

```tsx
<Container bgColor="primary" />                                          // primary 500
<Container bgColor={{ color: 'surface', intensity: 50 }} />              // a theme step
<Container bgColor={{ color: 'emerald', intensity: 200 }} />             // a Tailwind colour
<Container bgColor={{ color: 'quaternary', intensity: 950, opacity: 60 }} />  // with opacity
<Container bgColor="transparent" />
<Container bgColor={{ base: 'primary', hover: { color: 'primary', intensity: 600 } }} />  // hover state
<Container bgColor={{ base: 'secondary', md: 'primary' }} />            // from 768px
```

#### `textColor`

Text colour. Text, Icon and plain text inside the Container inherit it unless they set their own. **Type:** `Variants<Colour>`.

```tsx
<Container textColor={{ color: 'surface', intensity: 800 }}>
  <Text>Inherits surface 800</Text>
  <Icon name="info" />  {/* also surface 800 */}
</Container>
```

#### `borderColor`

Border colour. Needs [`borderWidth`](#borderwidth) to be visible. **Type:** `Variants<Colour>`.

```tsx
<Container borderWidth={{ all: 1 }} borderColor={{ color: 'surface', intensity: 500 }} />
<Container borderWidth={{ all: 2 }} borderColor={{ base: 'transparent', focus: { color: 'accent', intensity: 500 } }} tabIndex={0} />
```

#### `shadowColor`

Shadow colour. Needs [`shadow`](#shadow). **Type:** `Variants<Colour>`. **Default:** black at Tailwind's opacity.

```tsx
<Container shadow="lg" shadowColor={{ color: 'accent', intensity: 500, opacity: 50 }} />
```

### Spacing

Both take [sides](../style-props.md#sides) in px: `all`, `x`, `y`, `top`, `right`, `bottom`, `left`. A side overrides `x`/`y`, which override `all`.

#### `margin`

Outer spacing. Negative values are allowed. **Type:** `Variants<Sides>`.

```tsx
<Container margin={{ all: 16 }} />
<Container margin={{ y: 24 }} />                     // top and bottom
<Container margin={{ top: -8 }} />                   // pull up 8px
<Container margin={{ base: { y: 16 }, md: { y: 32 } }} />
```

#### `padding`

Inner spacing. **Type:** `Variants<Sides>`.

```tsx
<Container padding={{ all: 16 }} />
<Container padding={{ x: 24, y: 8 }} />
<Container padding={{ all: 16, left: 0 }} />         // all sides 16 except left
<Container padding={{ base: { x: 16 }, md: { x: 32 } }} />
```

### Sizing

Both groups take a [size](../style-props.md#size): px, `'full'`, `'screen'`, an `'n/d'` fraction, `'auto'` or `'fit'`.

#### `width` and `height`

**Type:** `Variants<Size>`.

```tsx
<Container width={320} height={200} />               // px
<Container width="full" />                           // 100% of the parent
<Container width="1/2" />                            // half the parent
<Container height="screen" />                        // the viewport height (100dvh)
<Container width="fit" />                            // shrink to the content
<Container width={{ base: 'full', md: '1/2', xl: 640 }} />
```

#### Size limits

`minWidth`, `maxWidth`, `minHeight`, `maxHeight`. **Type:** `Variants<Size>`.

```tsx
<Container width="full" maxWidth={1120} />           // full width, capped
<Container minHeight="screen" />                     // at least the viewport height
<Container maxHeight={400} overflow={{ y: 'auto' }} />
<Container minWidth={0} />                           // let a flex child shrink below its content
```

### Borders and shadow

#### `borderWidth`

Border width per side, px. **Type:** `Variants<Sides>`.

```tsx
<Container borderWidth={{ all: 1 }} />
<Container borderWidth={{ bottom: 1 }} />
<Container borderWidth={{ base: { bottom: 1 }, md: { right: 1 } }} />
```

#### `borderStyle`

**Type:** `Variants<'solid' | 'dashed' | 'dotted' | 'double' | 'none'>`. **Default:** `'solid'` once a width is set.

```tsx
<Container borderWidth={{ all: 1 }} borderStyle="dashed" />
```

#### `radius`

Corner radius, px ([radius](../style-props.md#radius)). A corner wins, then `top`/`bottom`, then `left`/`right`, then `all`. **Type:** `Variants<Radius>`.

```tsx
<Container radius={{ all: 8 }} />
<Container radius={{ all: 999 }} />                  // pill or circle
<Container radius={{ top: 12 }} />                   // both top corners
<Container radius={{ all: 8, bottomRight: 0 }} />
```

#### `shadow`

Tailwind's shadow sizes. **Type:** `Variants<'none' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>`.

```tsx
<Container shadow="md" />
<Container shadow={{ base: 'sm', hover: 'xl' }} />
```

### Layout

Layout props are objects whose **fields** each take a value or a [variant object](../style-props.md#variants), e.g. `flex={{ direction: { base: 'column', md: 'row' } }}` ([0043](../../../decisions/0043-group-container-layout-props-into-objects.md)).

#### `flex`

Lays children out in a row or column. Setting `flex` makes the Container `display: flex`.

| Field | Values |
| --- | --- |
| `direction` | `'row'` (browser default), `'column'`, `'row-reverse'`, `'column-reverse'` |
| `align` | `'start'`, `'center'`, `'end'`, `'stretch'`, `'baseline'` (cross axis) |
| `justify` | `'start'`, `'center'`, `'end'`, `'between'`, `'around'`, `'evenly'` (main axis) |
| `wrap` | `'wrap'`, `'nowrap'`, `'wrap-reverse'` |
| `gap` | px, or `{ x, y }` |

```tsx
<Container flex={{}} />                                               // just display: flex
<Container flex={{ gap: 8 }} />                                       // a row with 8px gaps
<Container flex={{ direction: 'column', gap: 16 }} />                 // a stack
<Container flex={{ align: 'center', justify: 'between' }} />          // spread, vertically centred
<Container flex={{ wrap: 'wrap', gap: { x: 16, y: 8 } }} />           // wrapping row
<Container flex={{ direction: { base: 'column', md: 'row' }, gap: { base: 8, md: 24 } }} />
```

#### `grid`

Lays children out in equal columns and rows. Setting `grid` makes the Container `display: grid`.

| Field | Values |
| --- | --- |
| `columns`, `rows` | integer ≥ 1: the number of equal tracks |
| `align` | `'start'`, `'center'`, `'end'`, `'stretch'`, `'baseline'` (items, vertically) |
| `justify` | `'start'`, `'center'`, `'end'`, `'stretch'` (items, horizontally) |
| `gap` | px, or `{ x, y }` |

```tsx
<Container grid={{ columns: 3, gap: 16 }} />
<Container grid={{ columns: { base: 1, sm: 2, lg: 4 }, gap: { x: 24, y: 16 } }} />
<Container grid={{ columns: 2, rows: 2, align: 'center', justify: 'center' }} />
```

#### `position`

| Field | Values |
| --- | --- |
| `type` | `'static'`, `'relative'`, `'absolute'`, `'fixed'`, `'sticky'` |
| `all`, `x`, `y`, `top`, `right`, `bottom`, `left` | px offsets, negative allowed; a side overrides `x`/`y`, which override `all` |
| `z` | integer (`z-index`) |

```tsx
<Container position={{ type: 'relative' }} />
<Container position={{ type: 'sticky', top: 0, z: 10 }} />            // sticks to the top
<Container position={{ type: 'absolute', top: 8, right: 8 }} />       // corner badge (inside a relative parent)
<Container position={{ type: 'fixed', all: 0, z: 50 }} />             // full-screen overlay
<Container position={{ type: { base: 'static', md: 'sticky' }, top: { base: 0, md: 64 } }} />
```

#### `overflow`

| Field | Values |
| --- | --- |
| `all` | `'visible'`, `'hidden'`, `'auto'`, `'scroll'`, `'clip'` (both axes) |
| `x`, `y` | the same values, per axis; override `all` |

```tsx
<Container overflow={{ all: 'hidden' }} />
<Container overflow={{ y: 'auto' }} maxHeight={400} />                // scrolls vertically
<Container overflow={{ all: 'hidden', y: 'auto' }} />
```

#### `flexItem`

How this Container behaves inside a flex parent.

| Field | Values |
| --- | --- |
| `grow` | number ≥ 0: share of free space |
| `shrink` | number ≥ 0 |
| `basis` | `Size`: starting size |
| `alignSelf` | `'auto'`, `'start'`, `'center'`, `'end'`, `'stretch'`, `'baseline'` |
| `order` | integer |

```tsx
<Container flex={{ gap: 16 }}>
  <Container width={240}>Sidebar</Container>
  <Container flexItem={{ grow: 1 }} minWidth={0}>Takes the rest</Container>
</Container>

<Container flexItem={{ basis: '1/3', shrink: 0 }} />
<Container flexItem={{ alignSelf: 'end', order: { base: 2, md: 1 } }} />
```

#### `gridItem`

How this Container behaves inside a grid parent.

| Field | Values |
| --- | --- |
| `colSpan`, `rowSpan` | integer ≥ 1, or `'full'` (every track) |
| `alignSelf` | `'auto'`, `'start'`, `'center'`, `'end'`, `'stretch'`, `'baseline'` |

```tsx
<Container grid={{ columns: 3, gap: 16 }}>
  <Container gridItem={{ colSpan: 2 }}>Two columns</Container>
  <Container>One</Container>
  <Container gridItem={{ colSpan: 'full' }}>Full width row</Container>
</Container>

<Container gridItem={{ colSpan: { base: 1, md: 2 }, rowSpan: 2 }} />
```

#### `hidden`

Hides the Container with `display: none`; it stays mounted. To remove it from the page with an exit animation, use [`show`](#show). **Type:** `Variants<boolean>`.

```tsx
<Container hidden />                                 // always hidden
<Container hidden={{ base: true, lg: false }} />     // only from 1024px
<Container hidden={{ md: true }} />                  // hidden from 768px
```

### Animation

See [Animation](../animation.md) for every animation name and the full lifecycle.

#### `animation`

Entrance, exit and attention animations. **Type:** `{ entrance?, exit?, attention? }`. Takes no variant keys.

```tsx
<Container animation={{ entrance: { name: 'fadeInUp' } }} />
<Container animation={{ entrance: { name: 'fadeIn', speed: 'fast', delay: 150 } }} />
<Container animation={{ entrance: { name: 'fadeInUp', when: 'inView' } }} />          // on scroll
<Container animation={{ exit: { name: 'fadeOutDown', speed: 'faster' } }} show={open} />
<Container animation={{ attention: { name: 'pulse', repeat: 'infinite', speed: 'slow' } }} />
```

#### `stagger`

Adds index × ms to each direct child's entrance delay, so children cascade in. **Type:** number (ms).

```tsx
<Container stagger={100}>
  <Container animation={{ entrance: { name: 'zoomIn' } }} />   {/* +0ms */}
  <Container animation={{ entrance: { name: 'zoomIn' } }} />   {/* +100ms */}
  <Container animation={{ entrance: { name: 'zoomIn' } }} />   {/* +200ms */}
</Container>
```

#### `show`

**Runtime only.** `true` mounts the Container and plays its entrance; `false` plays its exit, then unmounts it. **Type:** `boolean`. **Default:** `true`.

```tsx
const [open, setOpen] = useState(true);

<Container
  show={open}
  animation={{ entrance: { name: 'fadeInUp' }, exit: { name: 'fadeOutDown' } }}
/>
```

#### `replay`

**Runtime only.** Replays the attention animation whenever the value changes. **Type:** any.

```tsx
<Container animation={{ attention: { name: 'shakeX' } }} replay={errorCount} />
```

#### `onEntranceEnd` and `onExitEnd`

**Runtime only.** Called when the entrance or exit finishes. `onExitEnd` is also called when there's no exit animation. **Type:** `() => void`.

```tsx
<Container
  show={!leaving}
  animation={{ exit: { name: 'fadeOutLeft', speed: 250 } }}
  onExitEnd={() => navigate(next)}
  onEntranceEnd={() => setReady(true)}
/>
```

### HTML attributes and `ref`

Any other attribute is passed to the element, and `ref` receives it. There is **no `className` or `style`**, and the native `hidden` attribute is replaced by the [`hidden`](#hidden) prop.

```tsx
const ref = useRef<HTMLElement>(null);

<Container
  ref={ref}
  id="pricing"
  role="region"
  aria-label="Pricing"
  data-testid="pricing"
  onClick={handleClick}
/>
```

## Examples

### Example: Card with hover and focus states

A card that lifts and tints on hover, with a visible ring when focused by keyboard.

```tsx
import { Container, Text } from '@inithium/shared-ui-components';

export function ExampleCard() {
  return (
    <Container
      tabIndex={0}
      padding={{ all: 16 }}
      radius={{ all: 12 }}
      bgColor={{ base: { color: 'surface', intensity: 50 }, hover: { color: 'primary', intensity: 100 } }}
      borderWidth={{ all: 2 }}
      borderColor={{ base: { color: 'surface', intensity: 500, opacity: 40 }, focus: { color: 'accent', intensity: 500 } }}
      shadow={{ base: 'sm', hover: 'lg' }}
    >
      <Text textColor={{ color: 'surface', intensity: 900 }}>Card</Text>
    </Container>
  );
}
```

### Example: Stack on mobile, row from md

Children stack vertically on phones and sit in a centred row from 768px.

```tsx
import { Container, Text } from '@inithium/shared-ui-components';

export function ExampleResponsiveRow() {
  return (
    <Container flex={{ direction: { base: 'column', md: 'row' }, align: 'center', gap: { base: 8, md: 24 } }}>
      <Text>First</Text>
      <Text>Second</Text>
      <Text>Third</Text>
    </Container>
  );
}
```

### Example: Centred page column

A full-height page whose content is centred and capped at 1120px. Margins are pixel numbers, so centring uses the parent's flex.

```tsx
import { Container, Text } from '@inithium/shared-ui-components';

export function ExamplePageColumn() {
  return (
    <Container as="main" minHeight="screen" flex={{ direction: 'column', align: 'center' }} bgColor={{ color: 'surface', intensity: 100 }}>
      <Container width="full" maxWidth={1120} padding={{ base: { x: 16, y: 32 }, md: { x: 32, y: 48 } }}>
        <Text>Page content</Text>
      </Container>
    </Container>
  );
}
```

### Example: Responsive grid with a wide item

One column on mobile and three from 768px, with the first item spanning two.

```tsx
import { Container, Text } from '@inithium/shared-ui-components';

export function ExampleGrid() {
  return (
    <Container grid={{ columns: { base: 1, md: 3 }, gap: 16 }}>
      <Container gridItem={{ colSpan: { base: 1, md: 2 } }} bgColor="secondary" padding={{ all: 16 }} radius={{ all: 8 }}>
        <Text textColor={{ color: 'secondary', intensity: 50 }}>Wide</Text>
      </Container>
      <Container bgColor="tertiary" padding={{ all: 16 }} radius={{ all: 8 }}>
        <Text textColor={{ color: 'tertiary', intensity: 50 }}>Narrow</Text>
      </Container>
    </Container>
  );
}
```

### Example: Viewport-height layout with a scrolling content area

A navbar on top and content that fills the rest of the viewport and scrolls on its own.

```tsx
import { Container, Text } from '@inithium/shared-ui-components';

export function ExampleAppShell() {
  return (
    <Container height="screen" flex={{ direction: 'column' }}>
      <Container as="nav" height={64} padding={{ x: 16 }} flex={{ align: 'center' }} borderWidth={{ bottom: 1 }}>
        <Text>Navbar</Text>
      </Container>
      <Container as="main" flexItem={{ grow: 1 }} minHeight={0} overflow={{ y: 'auto' }} padding={{ all: 16 }}>
        <Text>Long content scrolls here.</Text>
      </Container>
    </Container>
  );
}
```

`minHeight={0}` lets the content area shrink below its content's height so that it scrolls instead of growing.

### Example: Sticky header

A header that stays at the top while the page scrolls.

```tsx
import { Container, Text } from '@inithium/shared-ui-components';

export function ExampleStickyHeader() {
  return (
    <Container as="header" position={{ type: 'sticky', top: 0, z: 10 }} padding={{ x: 16, y: 12 }} bgColor={{ color: 'surface', intensity: 50 }} shadow="sm">
      <Text fontWeight={700}>Site name</Text>
    </Container>
  );
}
```

### Example: Overlay with a fading panel

A translucent full-screen overlay and a panel that animates in and out with `show`.

```tsx
import { useState } from 'react';
import { Container, Text } from '@inithium/shared-ui-components';

export function ExampleOverlay() {
  const [open, setOpen] = useState(true);
  return (
    <Container
      show={open}
      position={{ type: 'fixed', all: 0, z: 50 }}
      flex={{ align: 'center', justify: 'center' }}
      bgColor={{ color: 'quaternary', intensity: 950, opacity: 60 }}
      animation={{ entrance: { name: 'fadeIn', speed: 'faster' }, exit: { name: 'fadeOut', speed: 'faster' } }}
      onClick={() => setOpen(false)}
    >
      <Container padding={{ all: 24 }} radius={{ all: 12 }} bgColor={{ color: 'surface', intensity: 50 }} animation={{ entrance: { name: 'zoomIn', speed: 'fast' } }}>
        <Text>Click anywhere to close</Text>
      </Container>
    </Container>
  );
}
```

### Example: Cascading cards on scroll

Cards that zoom in one after another the first time the grid scrolls into view.

```tsx
import { Container, Text } from '@inithium/shared-ui-components';

export function ExampleCascade() {
  return (
    <Container grid={{ columns: 3, gap: 8 }} stagger={120}>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <Container key={n} padding={{ all: 16 }} radius={{ all: 8 }} bgColor={{ color: 'secondary', intensity: 100 }}
          animation={{ entrance: { name: 'zoomIn', speed: 'fast', when: 'inView' } }}>
          <Text align="center">{n}</Text>
        </Container>
      ))}
    </Container>
  );
}
```

## Accessibility

- Choose `as` for meaning: landmarks (`main`, `nav`, `header`, `footer`, `aside`) help screen-reader users move around, and `ul`/`ol` with `li` children announce lists.
- A clickable Container isn't a button. Give it `role="button"` and `tabIndex={0}`, and handle Enter and Space in `onKeyDown`. A Button component will replace this pattern.
- `hidden` hides content visually and from assistive technology. `show={false}` removes it from the page entirely, after its exit animation.

## Notes

- `flex` and `grid` together: `flex` wins for `display`. Use one per Container.
- A Container with no props renders a plain element with no classes.
- `textColor` set on a Container is inherited by descendants, the same as CSS `color`.
