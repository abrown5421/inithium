---
title: Tooltip
description: A short description shown when an element is hovered or focused, in a bubble with an arrow, on any side.
scope: core
tags: [ui, component, feedback]
order: 14
decisions: ["0056", "0062", "0064"]
component:
  name: Tooltip
  layer: component
  import: '@inithium/shared-ui-components'
---

# Tooltip

Tooltip describes an element when it's hovered or focused ([0064](../../decisions/0064-describe-elements-with-tooltips-that-wrap-them.md)). It wraps the element (`<Tooltip content="…"><Button /></Tooltip>`) rather than rendering one, and shows a small bubble with an arrow on the side you choose, flipping when there's no room. Its behaviour comes from [Radix](https://www.radix-ui.com/primitives/docs/components/tooltip) ([0056](../../decisions/0056-use-radix-primitives-for-interactive-widgets.md)).

Tooltips are for extra, non-essential information: what an icon button does, why a button is disabled, a keyboard shortcut. Touch screens have no hover, so **never put information only in a tooltip**.

## Import

```tsx
import { Tooltip } from '@inithium/shared-ui-components';
```

## Props at a glance

`content` and `children` are required. Tooltip has no style props or `animation`; style and animate the element inside it instead.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`content`](#content) | `ReactNode` (`string` when stored) | **required** | What it says |
| [`children`](#children) | one element | **required** | The element it describes |
| [`side`](#side-and-align) | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Which side it appears on |
| [`align`](#side-and-align) | `'center' \| 'start' \| 'end'` | `'center'` | Where it lines up |
| [`color`](#color) | `Colour` (not `'transparent'`) | surface 900 | Bubble colour |
| [`arrow`](#arrow) | `boolean` | `true` | Arrow pointing at the element |
| [`delay`](#delay) | `number` | `500` | Hover time before opening, ms |
| [`open`, `defaultOpen`, `onOpenChange`](#open-defaultopen-and-onopenchange) | `boolean` | closed | Show it from code |

## Props

#### `content`

What the tooltip says. Keep it short: a few words, at most a sentence. It wraps at 240px. In code it can be any content, e.g. a label with a keyboard shortcut; stored tooltips are text. **Type:** `ReactNode`. **Required.**

```tsx
<Tooltip content="Saves a copy to your drafts"><Button>Save draft</Button></Tooltip>
```

#### `children`

The element it describes: exactly one element that takes a ref and events. Every component in this library does ([Button](button.md), [Icon](icon.md), [Text](text.md), [Input](input.md) and so on), as do plain elements. To describe something that can't be focused, like an icon, make it focusable with `tabIndex={0}` so keyboard users can reach the tooltip too.

A **disabled or loading** element sends no pointer events, so Tooltip wraps it in a focusable span automatically: the tooltip still shows on hover and focus, e.g. to explain why it's disabled. **Required.**

```tsx
<Tooltip content="Your plan renews on 1 November">
  <Icon name="info" label="Plan details" tabIndex={0} />
</Tooltip>

<Tooltip content="Add a payment method first">
  <Button disabled>Upgrade</Button>
</Tooltip>
```

#### `side` and `align`

`side` is where the bubble appears; it moves to the opposite side if there isn't room. `align` lines it up with the element's centre, start or end. **Type:** `'top' | 'bottom' | 'left' | 'right'` and `'center' | 'start' | 'end'`. **Default:** `'top'`, `'center'`.

```tsx
<Tooltip content="Help" side="right"><Icon name="circle-help" tabIndex={0} /></Tooltip>
<Tooltip content="Options" side="bottom" align="start"><Button variant="ghost">Menu</Button></Tooltip>
```

#### `color`

The bubble and arrow, a [colour value](../style-props.md#colour-value) except `'transparent'`; the text is the same colour's 100 step, as on a filled [Button](button.md#variant). **Type:** `Colour`. **Default:** `{ color: 'surface', intensity: 900 }`.

```tsx
<Tooltip content="Deleting can't be undone" color="rose"><Button color="rose">Delete</Button></Tooltip>
```

#### `arrow`

Whether a small arrow points at the element. **Type:** `boolean`. **Default:** `true`.

#### `delay`

How long the pointer must rest on the element before the tooltip opens, in ms. Once one tooltip has opened, moving to another within 300ms opens it straight away. Focus from the keyboard opens it at once. **Type:** `number`. **Default:** `500`.

```tsx
<Tooltip content="Opens at once" delay={0}><Button>Now</Button></Tooltip>
```

#### `open`, `defaultOpen` and `onOpenChange`

Control the tooltip from code, e.g. to confirm an action. Pass `open={undefined}` to hand control back to hover and focus. **Type:** `boolean`, `(open: boolean) => void`.

```tsx
<Tooltip content={copied ? 'Copied!' : 'Copy the link'} open={copied || undefined}>
  <Button onClick={copy}>Copy link</Button>
</Tooltip>
```

## Examples

### Example: Basic

On a button, and on a focusable info icon.

```example
ui-library/tooltip/basic
```

### Example: Placement

Each side, and aligned to the start.

```example
ui-library/tooltip/placement
```

### Example: Colours

The default dark bubble, a theme colour, a warning, and no arrow.

```example
ui-library/tooltip/colours
```

### Example: Rich content

A label with a keyboard shortcut.

```example
ui-library/tooltip/rich-content
```

### Example: Disabled element

Tooltips on a disabled and a loading button.

```example
ui-library/tooltip/disabled-element
```

### Example: Controlled

Click to copy; the tooltip confirms it for a moment.

```example
ui-library/tooltip/controlled
```

### Example: Delay

No delay, the default, and a second.

```example
ui-library/tooltip/delay
```

## Accessibility

- **A description, not a name:** the tooltip's text is linked to the element with `aria-describedby`, so screen readers read it after the element's name. An icon-only button still needs its own `aria-label`:

  ```tsx
  <Tooltip content="Settings"><Button leadingIcon="settings" aria-label="Settings" /></Tooltip>
  ```

- **Keyboard:** it opens when the element gets focus and closes on Escape or blur.
- **Touch:** tooltips don't open on tap. Anything people must know belongs on the page, not only in a tooltip.
- **Reduced motion:** the bubble appears without sliding in.

## Notes

- **Timing** is shared by every tooltip through `<UiProvider />`, which renders Radix's tooltip provider; a Tooltip outside `UiProvider` won't work.
- **Layering:** tooltips render at the end of the page at z-index 50, like Select's list ([0062](../../decisions/0062-draw-select-as-an-input-field-opening-a-list-below.md)), so overflow never clips them.
- **Fixed metrics:** 12px text, 4px × 8px padding, a 6px radius, 240px maximum width, 6px from the element, and a 10×5px arrow; it slides in from its side over 150ms.
- **No `animation` prop:** Tooltip has no element of its own; the element inside keeps its own `animation`.
- **Schema:** `tooltipPropsSchema` (type `TooltipSerializableProps`) in `@inithium/shared-contracts`. `open` and non-text `content` aren't stored.
