---
title: UI library
description: The theme, the shared style props, animation, and the Container and Text components.
scope: core
tags: [ui, theme, components, props]
order: 7
decisions: ["0030", "0031", "0032", "0034", "0035", "0036", "0037", "0038", "0039", "0040", "0041", "0042", "0043", "0044", "0045", "0046", "0047", "0048"]
---

# UI library

The UI library has four layers: theme, components, composites and layouts. Each builds only on the layers above it ([0030](../decisions/0030-organise-the-ui-library-as-theme-components-composites-and-layouts.md), [0038](../decisions/0038-split-the-ui-library-into-four-libs-with-layer-tags.md)). So far, the theme and the first two components (Container and Text) exist.

| Lib | Tags | Contains |
| --- | --- | --- |
| `@inithium/shared-ui-theme` | `ui:theme` | Scale generator, default theme, `<ThemeStyles />`, theme fonts (`src/styles/theme.css`) |
| `@inithium/shared-ui-components` | `ui:component` | `Container`, `Text`, `<UiProvider />`, the style-prop engine |

The style prop schemas and types live in `@inithium/shared-contracts` ([0039](../decisions/0039-keep-style-prop-schemas-in-shared-contracts.md)).

## Setting up an app

Each app's `src/styles.css`:

```css
@import "tailwindcss" theme(static);
@import "../../../libs/shared/ui-theme/src/styles/theme.css";
@import "animate.css";
@source "../../../libs";
```

- `theme(static)` makes Tailwind emit every palette variable (`--color-emerald-200`, …). Colour props read them at runtime, so without it Tailwind colours resolve to nothing.
- `theme.css` declares the fonts.
- `animate.css` provides the animations used by the `animation` prop.
- `@source` lets Tailwind see classes used in libs.

Wrap the app root in `<UiProvider>`, which publishes the theme's colour variables and the style-prop stylesheet:

```tsx
<UiProvider theme={optionalThemeConfig}>
  <App />
</UiProvider>
```

## Theme

Six tokens, each on a 50–950 scale generated in OKLCH ([0031](../decisions/0031-theme-colour-tokens-and-scales.md), [0041](../decisions/0041-generate-theme-scales-in-oklch.md)). Brand tokens are set by their 500; surface by its 100.

| Token | Default |
| --- | --- |
| `primary` (500) | `#006a8e` |
| `secondary` (500) | `#397e7f` |
| `tertiary` (500) | `#64748b` |
| `quaternary` (500) | `#25374f` |
| `accent` (500) | `#f5a42d` |
| `surface` (100) | `#f8fafc` |

Each step is published as `--color-<token>-<step>`.

- **Surface roles:** 50–400 backgrounds, 500 borders and dividers, 600–950 text. The generator makes 600 on 400 (the weakest pair) meet WCAG AA, so every text step is readable on every background step. If a surface colour is too dark for that to be possible, `generateSurfaceScale` throws.
- **Dark mode** (not built) will mirror every scale ([0032](../decisions/0032-dark-mode-mirrors-the-theme-scales.md)).

**Fonts** ([0046](../decisions/0046-theme-fonts-display-and-body.md)):

| Family | Default | Weights | Variable |
| --- | --- | --- | --- |
| `display` | Bruno Ace SC | 400 only | `--font-display` |
| `body` | Merriweather Sans | 300–800 | `--font-body` |

`body` is the page default. Both default fonts use the SIL Open Font License. A heavier weight on `display` is synthesised by the browser.

## Style props

Every style prop takes a single value or a variant object ([0036](../decisions/0036-write-state-and-breakpoint-values-as-flat-tailwind-style-keys.md)):

```tsx
bgColor={{ base: 'primary', hover: { color: 'primary', intensity: 600 }, md: 'secondary', 'md:hover': 'transparent' }}
```

- **Keys:** `base`; breakpoints `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px); states `hover` (only on devices that can hover), `focus` (`:focus-visible`), `active`, `disabled` (`:disabled`); or `'breakpoint:state'`.
- **Precedence:** larger breakpoints override smaller ones, and a state overrides the non-state value at the same breakpoint.
- **Layout objects:** `flex`, `grid`, `position`, `overflow`, `flexItem` and `gridItem` take variant objects on each field instead, e.g. `grid={{ columns: { base: 1, md: 3 } }}` ([0043](../decisions/0043-group-container-layout-props-into-objects.md)).

There is no `className` or `style` prop ([0037](../decisions/0037-style-components-only-through-typed-props.md)).

### Values

| Kind | Accepts |
| --- | --- |
| Colour | `{ color, intensity, opacity? }` (theme token or Tailwind colour; 50–950; opacity 0–100), a colour name meaning 500 (`'primary'`, `'emerald'`), or `'transparent'` ([0040](../decisions/0040-colour-prop-values-and-properties.md)) |
| Sides | `{ all, x, y, top, right, bottom, left }` in px. A side overrides `x`/`y`, which override `all` ([0042](../decisions/0042-size-and-space-in-pixel-numbers.md)) |
| Size | px number, `'full'` (100%), `'screen'` (`100vw` / `100dvh`), `'n/d'` fraction, `'auto'`, `'fit'` (fit-content) |
| Radius | sides plus `topLeft`, `topRight`, `bottomRight`, `bottomLeft` in px. A corner wins, then `top`/`bottom`, then `left`/`right`, then `all` |

### Shared by Container and Text

| Prop | Value |
| --- | --- |
| `bgColor`, `textColor`, `borderColor`, `shadowColor` | Colour |
| `margin` (negative allowed), `padding` | Sides |
| `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight` | Size |
| `borderWidth` | Sides |
| `borderStyle` | `solid`, `dashed`, `dotted`, `double`, `none` |
| `radius` | Radius |
| `shadow` | `none`, `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl` (Tailwind's shadows; coloured by `shadowColor`) |

### Container

Renders a `div` unless `as` is one of `section`, `article`, `header`, `footer`, `nav`, `main`, `aside`, `ul`, `ol`, `li` ([0045](../decisions/0045-constrained-as-prop-for-semantic-elements.md)).

| Prop | Fields |
| --- | --- |
| `flex` | `direction` (`row`, `column`, `row-reverse`, `column-reverse`), `align` (`start`, `center`, `end`, `stretch`, `baseline`), `justify` (`start`, `center`, `end`, `between`, `around`, `evenly`), `wrap` (`wrap`, `nowrap`, `wrap-reverse`), `gap` (px, or `{ x, y }`). Setting `flex` makes the Container `display: flex`. |
| `grid` | `columns`, `rows` (number of equal tracks), `align` (as flex), `justify` (`start`, `center`, `end`, `stretch`), `gap`. Setting `grid` makes it `display: grid`. |
| `position` | `type` (`static`, `relative`, `absolute`, `fixed`, `sticky`), offsets `all`, `x`, `y`, `top`, `right`, `bottom`, `left` (px, negative allowed, same precedence as sides), `z` |
| `overflow` | `all`, `x`, `y`: `visible`, `hidden`, `auto`, `scroll`, `clip` |
| `flexItem` | `grow`, `shrink`, `basis` (Size), `alignSelf`, `order` |
| `gridItem` | `colSpan`, `rowSpan` (number or `'full'`), `alignSelf` |
| `hidden` | `true` hides it (`display: none`), e.g. `{ base: true, lg: false }` |

### Text

Renders a `p` unless `as` is one of `h1`–`h6`, `span`, `label`. With `as="label"`, pass `htmlFor`.

| Prop | Value |
| --- | --- |
| `fontFamily` | `display`, `body` |
| `fontSize` | px |
| `fontWeight` | 100, 200 … 900 |
| `align` | `left`, `center`, `right`, `justify`, `start`, `end` |
| `lineHeight` | ratio, e.g. `1.5` |
| `letterSpacing` | px |
| `truncate` | number of lines before an ellipsis (`1` = single line), or `false` to undo it at a breakpoint |

Other props (`id`, `role`, `aria-*`, event handlers, `tabIndex`, `ref`, …) pass through to the element.

## Animation

Every component takes an `animation` object plus runtime props ([0048](../decisions/0048-animate-components-with-animate-css-through-an-animation-prop.md)). Animations come from [animate.css](https://animate.style/).

```tsx
<Container
  animation={{
    entrance:  { name: 'fadeInUp', speed: 'fast', delay: 150, when: 'mount' },
    exit:      { name: 'fadeOutDown', speed: 'faster' },
    attention: { name: 'shakeX', speed: 'fast', repeat: 1 },
  }}
  show={isOpen}
  replay={errorCount}
  onEntranceEnd={() => …}
  onExitEnd={() => …}
/>
```

| Field | Values |
| --- | --- |
| `entrance.name` / `exit.name` / `attention.name` | An animate.css animation of that kind. Each slot only accepts its own kind (e.g. `fadeInUp` for entrance, `hinge` for exit, `pulse` for attention). |
| `speed` | `'faster'` (500ms), `'fast'` (800ms), `'slow'` (2s), `'slower'` (3s), or ms. Default 1s. |
| `delay` | `'1s'`–`'5s'`, or ms. |
| `attention.repeat` | `1`, `2`, `3` or `'infinite'`. Default 1. |
| `entrance.when` | `'mount'` (default) or `'inView'`: enters the first time 20% of the element is visible. Until then it's `visibility: hidden`. |

**Runtime props** (not stored; not part of the schemas):

| Prop | Behaviour |
| --- | --- |
| `show` | Default `true`. `true` mounts the element and plays its entrance, including on first render. `false` plays the exit, then unmounts it. A change during a running entrance or exit waits for it to finish, then follows the latest value. |
| `replay` | Plays the attention animation again whenever the value changes, e.g. a counter. |
| `onEntranceEnd`, `onExitEnd` | Called when the entrance or exit finishes. `onExitEnd` is also called when there is no exit animation. |
| `stagger` (Container) | Adds index × ms to each direct child element's entrance delay. Exits aren't staggered. Stored with the Container. |

**Behaviour details:**

- An attention animation plays after the entrance (or on mount without one). A running attention animation, even an infinite one, doesn't delay an exit.
- If `animationend` never arrives, e.g. the element is `display: none` via `hidden`, the animation is treated as finished shortly after it should have ended. Sequences like a page transition therefore always complete.
- `animationend` events from child elements are ignored.
- Stagger only reaches direct children; every Container and Text resets it for its own children.
- With `prefers-reduced-motion`, animate.css shortens animations to 1ms and hides finished exits. End callbacks still fire.

**A page-transition sequence:**

```tsx
<Container
  key={page}
  show={!leaving}
  animation={{ entrance: { name: 'fadeInRight', speed: 400 }, exit: { name: 'fadeOutLeft', speed: 250 } }}
  onExitEnd={() => { setPage(next); setLeaving(false); }}
/>
```

The serializable shapes are `animationSchema` and, for whole components, `containerPropsSchema` / `textPropsSchema` (style props + animation, + stagger for Container) in `@inithium/shared-contracts`. The lifecycle lives in `useAnimation` (`libs/shared/ui-components/src/lib/animation/`).

## How it works

The style-prop engine is in `libs/shared/ui-components/src/lib/style-props/` ([0047](../decisions/0047-generate-the-style-prop-stylesheet-from-a-property-table.md)):

- `style-properties.config.ts`: the property table (each entry: a class stem and the CSS properties it sets).
- `style-sheet.service.ts`: builds one rule per property per variant key, e.g. `.ui-bg-md-hover:hover { background-color: var(--ui-bg-md-hover) }`.
- `style-props.service.ts`: turns props into those class names plus inline variables, e.g. `class="ui-bg" style="--ui-bg: var(--color-primary-500)"`.

**To add a style property:** add its schema to the props in `@inithium/shared-contracts`, add a table entry, and resolve it in `style-props.service.ts`.

## Not supported yet

- Ring and outline colours (they need width and style props first), CSS transitions, and the remaining components, composites and layouts.
- Automatic horizontal centring (`margin: auto`), because margins are pixel numbers. Centre with the parent's `flex` instead.
