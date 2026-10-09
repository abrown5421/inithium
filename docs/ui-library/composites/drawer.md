---
title: Drawer
description: A panel that slides in from a screen edge over the page, with a pinned header and footer around a scrolling body, openable from anywhere through Redux.
scope: core
tags: [ui, composite, overlays]
order: 5
decisions: ["0048", "0056", "0065", "0071"]
component:
  name: Drawer
  layer: composite
  import: '@inithium/shared-ui-composites'
  element: div
---

# Drawer

Drawer slides a panel in from a screen edge (the right by default) over a dark overlay ([0071](../../decisions/0071-slide-drawers-in-from-a-screen-edge.md)). It's the same dialog as [Modal](modal.md): focus stays inside, the page behind doesn't scroll, Escape and the overlay close it, and focus returns to whatever opened it. Inside, a header with the title and ✕ stays at the top, an optional footer (e.g. Cancel and Save) stays at the bottom, and the body scrolls between them.

Use it for content that sits beside the page, such as a cart, filters, a settings panel or, from the bottom, a share sheet.

## Import

```tsx
import { Drawer } from '@inithium/shared-ui-composites';
import { openModal, useModal } from '@inithium/shared-data-access';   // for the global state
```

## Opening drawers from anywhere

Drawers share the global state with modals ([Opening modals from anywhere](modal.md#opening-modals-from-anywhere)): connect a drawer with `useModal(id)` and open it from any component with `dispatch(openModal(id))`. One modal or drawer is open at a time; opening another replaces it.

```tsx
function CartDrawer() {
  const cart = useModal('cart');
  return <Drawer {...cart.modalProps} title="Your cart" footer={<CheckoutButton />}>…</Drawer>;
}

// Anywhere:
<Button onClick={() => dispatch(openModal('cart'))}>Cart</Button>
```

For a drawer one component uses, plain state works too: `<Drawer open={open} onOpenChange={setOpen}>`.

## Props at a glance

Type names such as `Colour`, `Sides`, `Size` and `Variants<T>` are defined on [Style props](../style-props.md). `open`, `onOpenChange` and `title` are required.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`open`, `onOpenChange`](#open-and-onopenchange) | `boolean`, `(open) => void` | **required** | Whether it's open |
| [`side`](#side) | `'right' \| 'left' \| 'top' \| 'bottom'` | `'right'` | The edge it slides from |
| [`size`](#size) | `number` | 400 / fits content | Width or height, px |
| [`title`, `hideTitle`](#title-and-hidetitle) | `ReactNode`, `boolean` | **required**, `false` | Heading and accessible name |
| [`description`](#description) | `string` | none | A line under the title |
| [`children`](#children) | `ReactNode` | none | The scrolling body |
| [`footer`](#footer) | `ReactNode` | none | Pinned at the bottom |
| [`dismissible`](#dismissible) | `boolean` | `true` | Overlay click and Escape close it |
| [`closeButton`](#closebutton) | `boolean` | `true` | ✕ in the header |
| [`animation`](#animation) | `Animation` | slides from its side | Entrance and exit |
| [`overlayColor`](#overlaycolor) | `Colour` | neutral 950 at 60% | The overlay |
| [Panel style props](#panel-style-props) | Container's | | The panel's look |

## Props

#### `open` and `onOpenChange`

As on [Modal](modal.md#open-and-onopenchange): whether it's open, and the function called with `false` when the user closes it. Setting `open` to `false` slides it out; it leaves the page when that ends. **Type:** `boolean`, `(open: boolean) => void`. **Required.**

#### `side`

The edge the drawer slides in from. Left and right drawers are full height; top and bottom ones full width. **Type:** `'right' | 'left' | 'top' | 'bottom'`. **Default:** `'right'`.

```tsx
<Drawer side="left" …>
<Drawer side="bottom" …>   // a bottom sheet
```

#### `size`

The drawer's width (left, right) or height (top, bottom), in px. A left or right drawer never covers the whole screen: on narrow screens it stops 48px short of the far edge, leaving overlay to tap. Top and bottom drawers fit their content, up to 80% of the screen, unless you set a height. **Type:** `number`. **Default:** `400` for left and right; fits content for top and bottom.

```tsx
<Drawer side="left" size={320} …>
```

#### `title` and `hideTitle`

The drawer's heading, in the header, and its name for screen readers. `hideTitle` keeps it for screen readers only. **Type:** `ReactNode`, `boolean`. **Required:** `title`.

#### `description`

A line under the title, read with it by screen readers. **Type:** `string`.

#### `children`

The body: anything. It scrolls when it's taller than the space between the header and footer. **Type:** `ReactNode`.

#### `footer`

Content pinned under the body, separated by a line, e.g. actions. **Type:** `ReactNode`.

```tsx
<Drawer
  title="Filters"
  footer={
    <Container flex={{ justify: 'end', gap: 8 }}>
      <Button variant="ghost">Reset</Button>
      <Button>Apply</Button>
    </Container>
  }
>
  …
</Drawer>
```

#### `dismissible`

Whether clicking the overlay or pressing Escape closes the drawer; the ✕ and your own buttons still do. **Type:** `boolean`. **Default:** `true`.

#### `closeButton`

Whether an ✕ shows at the end of the header. **Type:** `boolean`. **Default:** `true`.

#### `animation`

The panel's entrance and exit, in the [animation prop's](../animations/index.md) shape. The overlay always fades. **Type:** `{ entrance?, exit? }`. **Default:** from its side: `slideInRight` / `slideOutRight`, `slideInLeft` / `slideOutLeft`, `slideInDown` / `slideOutUp` (top) or `slideInUp` / `slideOutDown` (bottom), at the `fast` speed.

#### `overlayColor`

As on [Modal](modal.md#overlaycolor). **Type:** `Colour`. **Default:** `{ color: 'neutral', intensity: 950, opacity: 60 }`.

#### Panel style props

The panel is a [Container](../components/container.md) and takes its style props (except `as`), which override the defaults: a `surface-50` background, an `xl` shadow, and a 12px radius on the corners away from the screen edge. `padding` adds space around the header, body and footer together; each already has its own.

## Examples

### Example: Cart from anywhere

A cart drawer opened from a separate button through Redux, with a total and Check out in the footer.

```example
ui-library/drawer/cart-from-anywhere
```

### Example: Filters with a footer

A narrower drawer from the left, with Reset and Apply pinned at the bottom.

```example
ui-library/drawer/filters-with-a-footer
```

### Example: Bottom sheet

A share sheet from the bottom that fits its content.

```example
ui-library/drawer/bottom-sheet
```

### Example: Sides

The same drawer from each edge.

```example
ui-library/drawer/sides
```

### Example: Long content

The body scrolls; the header and the Done button stay put.

```example
ui-library/drawer/long-content
```

## Accessibility

- **The same dialog as Modal:** a `role="dialog"` with `aria-modal`, named by `title` and described by `description`; focus moves in when it opens and stays inside; the page behind is hidden from screen readers and doesn't scroll; Escape closes it (unless `dismissible={false}`); focus returns to whatever opened it.
- **Always give a `title`,** even when hidden.
- **Reduced motion:** it appears and disappears without sliding.

## Notes

- **Layering:** z-index 40, like Modal, so popups (Select, Tooltip) inside it appear above it.
- **One at a time:** a drawer and a modal share the global state, so opening one closes the other.
- **Not yet:** swipe to close on touch screens, and a non-blocking side panel without an overlay.
- **Schema:** `drawerPropsSchema` (type `DrawerSerializableProps`) and `drawerSideSchema` in `@inithium/shared-contracts`. Content and footer aren't stored.
