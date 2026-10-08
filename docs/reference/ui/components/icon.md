---
title: Icon
description: A Lucide icon by name, sized in pixels, coloured by the surrounding text, decorative unless labelled.
scope: core
tags: [ui, component, icons]
order: 3
decisions: ["0042", "0048", "0050"]
component:
  name: Icon
  layer: component
  import: '@inithium/shared-ui-components'
  element: span
---

# Icon

Icon renders any of [Lucide's icons](https://lucide.dev/icons) by name ([0050](../../../decisions/0050-render-icons-from-lucide-by-name.md)). It takes the colour of the text around it, is sized in pixels, and is hidden from screen readers unless you give it a `label`. Like every component, it also accepts the shared style props and the animation prop, so it can be a chip, a badge or an animated indicator.

## Import

```tsx
import { Icon, type IconName } from '@inithium/shared-ui-components';
```

## Basic usage

```tsx
<Icon name="search" />
<Icon name="trash-2" size={20} textColor="rose" label="Delete" />
```

Renders a `<span>` sized to the icon, containing Lucide's `<svg>`.

## Props

Type names such as `Colour`, `Sides`, `Radius` and `Variants<T>` are defined on [Style props](../style-props.md). Unless noted, every prop is optional.

### Icon

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `IconName` | **required** | A Lucide icon name in kebab-case, e.g. `'arrow-right'`, `'circle-check'`. Browse them at [lucide.dev/icons](https://lucide.dev/icons). TypeScript only accepts real names. |
| `size` | `Variants<number>` | `24` | Width and height in px, e.g. `{ base: 20, md: 32 }`. |
| `strokeWidth` | `number` | `2` | Line thickness, in Lucide's 24-unit grid (so it scales with `size`). |
| `label` | `string` | none | Announces the icon to screen readers as an image with this text. Without it, the icon is decorative and hidden from them. |

### Colour

| Prop | Type | Description |
| --- | --- | --- |
| `textColor` | `Variants<Colour>` | The icon's colour. **Default: inherited** from the surrounding text. See [Colour value](../style-props.md#colour-value). |
| `bgColor` | `Variants<Colour>` | A background behind the icon (for chips and badges). |
| `borderColor` | `Variants<Colour>` | Border colour (needs `borderWidth`). |
| `shadowColor` | `Variants<Colour>` | Shadow colour (needs `shadow`). |

### Spacing, sizing, borders and shadow

| Prop | Type | Description |
| --- | --- | --- |
| `margin`, `padding` | `Variants<Sides>` | px. Padding adds space around the icon inside its background. See [Sides](../style-props.md#sides). |
| `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight` | `Variants<Size>` | Prefer `size`. If you set `size`, it overrides `width` and `height`; if you set only `width` or `height`, the default size isn't applied. |
| `borderWidth` | `Variants<Sides>` | Border width per side, px. |
| `borderStyle` | `Variants<BorderStyle>` | See [Border style](../style-props.md#border-style). |
| `radius` | `Variants<Radius>` | e.g. `{ all: 999 }` for a circular chip. |
| `shadow` | `Variants<ShadowSize>` | See [Shadow size](../style-props.md#shadow-size). |

### Animation

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `animation` | `{ entrance?, exit?, attention? }` | none | See [Animation](../animation.md). |
| `show` | `boolean` | `true` | `false` plays the exit, then unmounts the icon. Runtime only. |
| `replay` | any | none | Replays the attention animation when it changes. Runtime only. |
| `onEntranceEnd`, `onExitEnd` | `() => void` | none | Called when the entrance or exit finishes. Runtime only. |

### HTML attributes and `ref`

Other attributes (`id`, `title`, `data-*`, event handlers) go to the `<span>`, and `ref` receives it. There is no `className`, `style` or `children`.

## Styling examples

**Inherit the text colour** (the default):

```tsx
<Text textColor="primary">
  <Icon name="info" size={18} /> Primary text, primary icon
</Text>
```

**Change colour on hover:**

```tsx
<Icon name="heart" textColor={{ base: { color: 'surface', intensity: 600 }, hover: { color: 'rose', intensity: 500 } }} />
```

**A status chip:**

```tsx
<Icon name="check" size={20} padding={{ all: 8 }} radius={{ all: 999 }}
  bgColor={{ color: 'emerald', intensity: 100 }} textColor={{ color: 'emerald', intensity: 700 }} />
```

**Responsive size:**

```tsx
<Icon name="star" size={{ base: 20, md: 40 }} />
```

**A thin, large icon:**

```tsx
<Icon name="circle-check" size={48} strokeWidth={1} />
```

**A beating heart:**

```tsx
<Icon name="heart" textColor="rose" animation={{ attention: { name: 'heartBeat', repeat: 'infinite' } }} />
```

## Accessibility

- **Decorative by default:** the icon is `aria-hidden`. That's right when text next to it already says the same thing, e.g. a "Delete" button with a trash icon.
- **Give it a `label` when it carries meaning on its own,** e.g. an icon-only status indicator: `<Icon name="mail" label="Unread messages" />`. It's then announced as an image.
- An icon-only *button* will be labelled by the Button component, not by Icon.
- Don't rely on colour alone to convey meaning; pair a coloured icon with text or a label.

## Notes

- **Loading:** icons are fetched on demand the first time a name is used, as small separate files. The span keeps its size while an icon loads, so layout doesn't shift.
- **Unknown names:** a name Lucide doesn't recognise (e.g. a stored name from an older Lucide) renders as an empty box of the right size and logs a console error. Names in stored content are checked for format (`iconNameSchema`), not existence.
- **Inline alignment:** icons centre on the text line when placed inside Text.
- **Build output:** an app that uses Icon gets one small file per Lucide icon in its build output (about 1,900).
- **Schemas:** `iconPropsSchema` (type `IconSerializableProps`) and `iconStylePropsSchema` in `@inithium/shared-contracts`.
- **Licence:** Lucide is licensed under ISC.
