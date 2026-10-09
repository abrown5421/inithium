---
title: Icon
description: A Lucide icon by name, sized in pixels, coloured by the surrounding text, decorative unless labelled.
scope: core
tags: [ui, component, icons]
order: 5
decisions: ["0042", "0048", "0050"]
component:
  name: Icon
  layer: component
  import: '@inithium/shared-ui-components'
  element: span
---

# Icon

Icon renders any of [Lucide's icons](https://lucide.dev/icons) by name ([0050](../../decisions/0050-render-icons-from-lucide-by-name.md)). It takes the colour of the text around it, is sized in pixels, and is hidden from screen readers unless you give it a `label`. Like every component, it also accepts the shared style props and the animation prop, so it can be a chip, a badge or an animated indicator.

## Import

```tsx
import { Icon, type IconName } from '@inithium/shared-ui-components';
```

## Props at a glance

Type names such as `Colour`, `Sides`, `Size`, `Radius` and `Variants<T>` are defined on [Style props](../style-props.md). Only `name` is required.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`name`](#name) | `IconName` | **required** | Lucide icon name |
| [`size`](#size) | `Variants<number>` | `24` | Width and height, px |
| [`strokeWidth`](#strokewidth) | `number` | `2` | Line thickness |
| [`label`](#label) | `string` | none | Announce to screen readers |
| [`textColor`](#textcolor) | `Variants<Colour>` | inherited | Icon colour |
| [`bgColor`](#bgcolor) | `Variants<Colour>` | none | Background |
| [`borderColor`](#bordercolor) | `Variants<Colour>` | none | Border colour |
| [`shadowColor`](#shadowcolor) | `Variants<Colour>` | black | Shadow colour |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | none | Spacing, px |
| [`width`, `height` and limits](#width-height-and-limits) | `Variants<Size>` | from `size` | Prefer `size` |
| [`borderWidth`, `borderStyle`, `radius`, `shadow`](#borders-and-shadow) | | none | Borders and shadow |
| [`animation`](#animation) | `Animation` | none | Animations |
| [`show`, `replay`, `onEntranceEnd`, `onExitEnd`](#runtime-props) | | | Runtime animation control |
| [HTML attributes and `ref`](#html-attributes-and-ref) | | | `id`, `title`, events, `ref` |

## Props

### Icon

#### `name`

A Lucide icon name in kebab-case. Browse them at [lucide.dev/icons](https://lucide.dev/icons). TypeScript only accepts real names. **Type:** `IconName`. **Required.**

```tsx
<Icon name="search" />
<Icon name="arrow-right" />
<Icon name="circle-check" />

// From stored data (e.g. chosen in the CMS):
const stored: string = section.icon;
<Icon name={stored as IconName} />
```

#### `size`

Width and height together, in px. **Type:** `Variants<number>`. **Default:** `24`.

```tsx
<Icon name="star" size={16} />
<Icon name="star" size={48} />
<Icon name="star" size={{ base: 20, md: 32 }} />     // 32px from 768px
```

#### `strokeWidth`

Line thickness in Lucide's 24-unit grid, so it scales with `size`. **Type:** `number`. **Default:** `2`.

```tsx
<Icon name="circle-check" size={48} strokeWidth={1} />    // thin
<Icon name="circle-check" strokeWidth={3} />              // bold
```

#### `label`

Makes the icon announce itself to screen readers as an image with this text. Without it, the icon is decorative and hidden from them. **Type:** `string`.

```tsx
<Icon name="mail" label="Unread messages" />    // announced
<Icon name="mail" />                            // decorative (aria-hidden)
```

### Colour

All colour props take a [colour value](../style-props.md#colour-value) and [variant keys](../style-props.md#variants).

#### `textColor`

The icon's colour. **Type:** `Variants<Colour>`. **Default:** inherited from the surrounding text.

```tsx
<Text textColor="primary"><Icon name="info" /> primary, inherited</Text>
<Icon name="heart" textColor="rose" />
<Icon name="heart" textColor={{ base: { color: 'surface', intensity: 600 }, hover: { color: 'rose', intensity: 500 } }} />
```

#### `bgColor`

A background behind the icon, usually with `padding` and `radius`. **Type:** `Variants<Colour>`.

```tsx
<Icon name="check" padding={{ all: 8 }} radius={{ all: 999 }} bgColor={{ color: 'emerald', intensity: 100 }} />
```

#### `borderColor`

Needs `borderWidth`. **Type:** `Variants<Colour>`.

```tsx
<Icon name="x" padding={{ all: 6 }} radius={{ all: 8 }} borderWidth={{ all: 1 }} borderColor="rose" />
```

#### `shadowColor`

Needs `shadow`. **Type:** `Variants<Colour>`.

```tsx
<Icon name="sparkles" padding={{ all: 8 }} radius={{ all: 999 }} shadow="lg" shadowColor={{ color: 'accent', intensity: 500, opacity: 50 }} />
```

### Spacing

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px. Padding adds space around the icon inside its background; the icon itself stays at `size`. **Type:** `Variants<Sides>`.

```tsx
<Icon name="info" margin={{ right: 6 }} />
<Icon name="bell" size={20} padding={{ all: 10 }} bgColor={{ color: 'surface', intensity: 200 }} radius={{ all: 999 }} />
```

### Sizing

#### `width`, `height` and limits

`width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight` take a [size](../style-props.md#size). **Prefer `size`.** If you set `size`, it overrides `width` and `height`; if you set only `width` or `height`, the default 24px isn't applied. **Type:** `Variants<Size>`.

```tsx
<Icon name="image" width={64} height={40} />    // non-square box; the icon fits inside it
```

### Borders and shadow

`borderWidth` ([sides](../style-props.md#sides)), `borderStyle` ([border style](../style-props.md#border-style)), `radius` ([radius](../style-props.md#radius)) and `shadow` ([shadow size](../style-props.md#shadow-size)), each with variant keys.

```tsx
<Icon name="plus" padding={{ all: 8 }} radius={{ all: 8 }} borderWidth={{ all: 1 }} borderStyle="dashed" />
<Icon name="star" padding={{ all: 8 }} radius={{ all: 999 }} shadow={{ base: 'sm', hover: 'lg' }} />
```

### Animation

#### `animation`

See [Animation](../animations/index.md) for every animation name. **Type:** `{ entrance?, exit?, attention? }`.

```tsx
<Icon name="rocket" animation={{ entrance: { name: 'zoomIn', speed: 'fast' } }} />
<Icon name="heart" animation={{ attention: { name: 'heartBeat', repeat: 'infinite' } }} />
<Icon name="bell" animation={{ attention: { name: 'swing' } }} replay={notificationCount} />
```

#### Runtime props

`show`, `replay`, `onEntranceEnd` and `onExitEnd` work as on every component ([Animation: runtime props](../animations/index.md#runtime-props)).

```tsx
<Icon name="check" textColor="emerald" show={saved} animation={{ entrance: { name: 'bounceIn' }, exit: { name: 'fadeOut' } }} />
```

### HTML attributes and `ref`

Other attributes (`id`, `title`, `data-*`, event handlers) go to the `<span>`, and `ref` receives it. There is no `className`, `style` or `children`.

```tsx
<Icon name="circle-help" title="Help" data-testid="help-icon" onClick={openHelp} />
```

## Examples

### Example: Icon beside text

An icon that inherits its colour from the text and centres on the line.

```example
ui-library/icon/icon-beside-text
```

### Example: Status chips

Coloured circular and square chips built from Icon's own style props.

```example
ui-library/icon/status-chips
```

### Example: Feature list

A list whose items each start with a check icon.

```example
ui-library/icon/feature-list
```

### Example: Labelled status indicator

An icon that carries meaning on its own, so it gets a label.

```example
ui-library/icon/labelled-status-indicator
```

### Example: Notification bell that rings on new messages

The attention animation replays whenever the count changes.

```example
ui-library/icon/notification-bell-that-rings-on-new-messages
```

## Accessibility

- **Decorative by default:** the icon is `aria-hidden`. That's right when text next to it already says the same thing, e.g. a "Delete" button with a trash icon.
- **Give it a `label` when it carries meaning on its own,** e.g. an icon-only status indicator. It's then announced as an image.
- In a [Button](button.md), use `leadingIcon` or `trailingIcon`; an icon-only button is labelled with the button's `aria-label`, not by Icon.
- Don't rely on colour alone to convey meaning; pair a coloured icon with text or a label.

## Notes

- **Loading:** icons are fetched on demand the first time a name is used, as small separate files. The span keeps its size while an icon loads, so layout doesn't shift.
- **Unknown names:** a name Lucide doesn't recognise (e.g. a stored name from an older Lucide) renders as an empty box of the right size and logs a console error. Names in stored content are checked for format (`iconNameSchema`), not existence.
- **Inline alignment:** icons centre on the text line when placed inside Text.
- **Build output:** an app that uses Icon gets one small file per Lucide icon in its build output (about 1,900).
- **Schemas:** `iconPropsSchema` (type `IconSerializableProps`) and `iconStylePropsSchema` in `@inithium/shared-contracts`.
- **Licence:** Lucide is licensed under ISC.
