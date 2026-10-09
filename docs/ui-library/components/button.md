---
title: Button
description: A button in one of four variants (filled, outlined, ghost, link) styled from a single colour, with optional icons.
scope: core
tags: [ui, component, forms]
order: 1
decisions: ["0036", "0042", "0048", "0050", "0054", "0058"]
component:
  name: Button
  layer: component
  import: '@inithium/shared-ui-components'
  element: button
---

# Button

Button renders a `<button>` in one of four variants, all styled from one `color` ([0054](../../decisions/0054-style-buttons-by-variant-from-one-colour.md)). You pick the look with `variant` and the colour with `color`, and the button works out its background, border, text and hover colours. Its height, radius, border width and font are fixed, so every button in an app matches. When a variant doesn't fit, `bgColor`, `textColor` and `borderColor` override its colours one at a time.

Use the `link` variant for actions that should look like inline links. It's still a `<button>`, so it doesn't navigate.

## Import

```tsx
import { Button } from '@inithium/shared-ui-components';
```

## Props at a glance

Type names such as `Colour`, `Sides`, `Size` and `Variants<T>` are defined on [Style props](../style-props.md). No prop is required.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| [`variant`](#variant) | `'filled' \| 'outlined' \| 'ghost' \| 'link'` | `'filled'` | How the colour is applied |
| [`color`](#color) | `Colour` (not `'transparent'`) | `'primary'` | The colour the variant uses |
| [`leadingIcon`, `trailingIcon`](#leadingicon-and-trailingicon) | `IconName` | none | Icons before and after the content |
| [`bgColor`, `textColor`, `borderColor`](#bgcolor-textcolor-and-bordercolor) | `Variants<Colour>` | from the variant | Override the variant's colours |
| [`margin`, `padding`](#margin-and-padding) | `Variants<Sides>` | padding `{ x: 12 }` | Spacing, px |
| [`width`, `minWidth`, `maxWidth`](#width-minwidth-and-maxwidth) | `Variants<Size>` | fits its content | Width |
| [`animation`](#animation) | `Animation` | none | Animations |
| [`show`, `replay`, `onEntranceEnd`, `onExitEnd`](#runtime-props) | | | Runtime animation control |
| [`loading`](#loading) | `boolean` | `false` | Spinner, disabled, same width |
| [`type`, `disabled`, other HTML attributes and `ref`](#html-attributes-and-ref) | | `type="button"` | `onClick`, `aria-label`, `ref` |

## Props

### Variant and colour

#### `variant`

How the button applies its `color`. `[color]` below is the `color` prop; `[color]-100` is the 100 step of the same colour (`emerald` gives `emerald-100`). **Type:** `'filled' | 'outlined' | 'ghost' | 'link'`. **Default:** `'filled'`.

| Variant | At rest | On hover |
| --- | --- | --- |
| `filled` | `[color]` background and border, `[color]-100` text | Transparent background, `[color]` text |
| `outlined` | Transparent background, `[color]` border and text | `[color]` background, `[color]-100` text |
| `ghost` | Transparent background, `[color]` text | `surface-200` background |
| `link` | `[color]` text, inline: no height, padding or border | Underlined |

```tsx
<Button>Save</Button>                          // filled
<Button variant="outlined">Preview</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="link">Forgot your password?</Button>
```

#### `color`

The colour every variant is built from: a [colour value](../style-props.md#colour-value), except `'transparent'`. A name means its 500 step. It also colours the keyboard focus outline. It takes no variant keys, since the variant decides the hover colours. **Type:** `Colour`. **Default:** `'primary'`.

```tsx
<Button color="secondary">Secondary</Button>
<Button color="emerald">Tailwind colour</Button>
<Button color={{ color: 'primary', intensity: 700 }}>Darker primary</Button>
<Button color={{ color: 'primary', intensity: 500, opacity: 80 }}>Translucent</Button>
```

### Icons

#### `leadingIcon` and `trailingIcon`

A [Lucide icon name](icon.md#name) shown before or after the content, at 16px in the button's text colour. Icons in a button are decorative. **Type:** `IconName`.

```tsx
<Button leadingIcon="plus">New page</Button>
<Button trailingIcon="arrow-right">Continue</Button>
<Button leadingIcon="download" trailingIcon="chevron-down">Export</Button>

// Icon-only: label it for screen readers, even out the padding, and add a Tooltip for sighted users.
<Button variant="ghost" leadingIcon="settings" aria-label="Settings" padding={{ x: 6 }} />
```

### Colour overrides

#### `bgColor`, `textColor` and `borderColor`

Each overrides one of the variant's colours, key by key: a plain value replaces the colour at rest (`base`) and keeps the variant's hover; a [variant object](../style-props.md#variants) replaces only the keys it names. **Type:** `Variants<Colour>`. **Default:** from the variant.

```tsx
// Dark text on a light colour (filled text is otherwise [color]-100).
<Button color={{ color: 'amber', intensity: 300 }} textColor={{ color: 'amber', intensity: 900 }}>Light amber</Button>

// Darken on hover instead of emptying (filled).
<Button
  bgColor={{ hover: { color: 'primary', intensity: 700 } }}
  borderColor={{ hover: { color: 'primary', intensity: 700 } }}
  textColor={{ hover: { color: 'primary', intensity: 100 } }}
>
  Save
</Button>

// A tinted ghost hover.
<Button variant="ghost" color="emerald" bgColor={{ hover: { color: 'emerald', intensity: 100 } }}>Tinted</Button>
```

### State

#### `loading`

Shows a 16px [Loader](loader.md) spinner in the button's text colour, disables the button and marks it busy (`aria-busy`) for screen readers. The spinner replaces the leading icon; without one, it covers the content, which is hidden but keeps its space, so the button never changes width. **Type:** `boolean`. **Default:** `false`.

```tsx
<Button loading={saving} onClick={save}>Save changes</Button>              // spinner over the hidden text
<Button leadingIcon="send" loading={sending}>Send</Button>                // spinner in place of the icon
<Button type="submit" loading={isLoading}>Sign in</Button>
```

### Spacing

#### `margin` and `padding`

[Sides](../style-props.md#sides) in px. Passing `padding` replaces the default 12px side padding entirely. `link` buttons have no padding by default. **Type:** `Variants<Sides>`.

```tsx
<Button margin={{ top: 16 }}>Submit</Button>
<Button padding={{ x: 24 }}>Wider</Button>
<Button padding={{ base: { x: 12 }, md: { x: 20 } }}>Wider from 768px</Button>
```

### Sizing

#### `width`, `minWidth` and `maxWidth`

A [size](../style-props.md#size). By default a button fits its content. Height is fixed at 32px (`link` buttons size to their text). **Type:** `Variants<Size>`.

```tsx
<Button width="full">Sign in</Button>
<Button minWidth={96}>OK</Button>
<Button width={{ base: 'full', md: 'auto' }}>Full width on mobile</Button>
```

### Animation

#### `animation`

See [Animation](../animations/index.md) for every animation name. **Type:** `{ entrance?, exit?, attention? }`.

```tsx
<Button animation={{ entrance: { name: 'fadeInUp' } }}>Get started</Button>
<Button animation={{ attention: { name: 'rubberBand' } }} replay={saves}>Save</Button>
```

#### Runtime props

`show`, `replay`, `onEntranceEnd` and `onExitEnd` work as on every component ([Animation: runtime props](../animations/index.md#runtime-props)).

```tsx
<Button show={hasChanges} animation={{ entrance: { name: 'fadeIn' }, exit: { name: 'fadeOut' } }}>Save changes</Button>
```

### HTML attributes and `ref`

Other attributes go to the `<button>`, and `ref` receives it. `type` defaults to `"button"`, so a button inside a form doesn't submit it unless you say `type="submit"`. There is no `className` or `style`.

```tsx
<Button type="submit">Sign in</Button>
<Button onClick={save} disabled={saving}>Save</Button>
<Button aria-label="Close" leadingIcon="x" variant="ghost" padding={{ x: 6 }} />
<Button ref={buttonRef} data-testid="save">Save</Button>
```

## Examples

### Example: Variants

The four variants in the default primary colour.

```example
ui-library/button/variants
```

### Example: Colours

Theme tokens, an intensity and Tailwind colours across the variants.

```example
ui-library/button/colours
```

### Example: Leading and trailing icons

Icons before and after the text, and a labelled icon-only button.

```example
ui-library/button/leading-and-trailing-icons
```

### Example: Full-width form actions

A full-width submit, a secondary action, and a right-aligned Cancel and Save.

```example
ui-library/button/full-width-form-actions
```

### Example: Disabled

Every variant disabled until the [Checkbox](checkbox.md) is ticked.

```example
ui-library/button/disabled
```

### Example: Loading

Click any button: it shows a spinner for two seconds without changing width.

```example
ui-library/button/loading
```

### Example: Colour overrides

Changing single colours of a variant with `bgColor`, `textColor` and `borderColor`.

```example
ui-library/button/colour-overrides
```

### Example: Animated save

Edit shows a Save button that fades in, and hides it with a fade out (`show` with entrance and exit). Each click on Save replays an attention animation. Entrances play when a button mounts, not on click.

```example
ui-library/button/animated-save
```

## Accessibility

- **A real `<button>`:** it's focusable and responds to Enter and Space without extra code.
- **Focus:** keyboard focus shows a 2px outline in the button's `color`, offset by 2px. Mouse clicks don't show it.
- **Icon-only buttons need a name:** give them an `aria-label`. Leading and trailing icons are decorative, so the label isn't repeated.
- **Disabled:** the native `disabled` attribute, so the button can't be focused or clicked. It's drawn at 50% opacity with a not-allowed cursor, and hover doesn't change it.
- **Loading:** the button is disabled and has `aria-busy`, and its label stays its accessible name, so screen readers still hear what it does.
- **Contrast is the caller's responsibility** for light colours: `filled` puts `[color]-100` text on `[color]`, which is readable on the 500 step and darker. For a light `color`, set a dark `textColor`.

## Notes

- **Fixed metrics:** 32px tall, 12px side padding, 6px radius, 2px border, the `body` font at 14px weight 500, and a 150ms transition. `ghost` keeps a transparent 2px border so it lines up with the other variants.
- **Dark mode:** `[color]-100` text is meant to stay light in both modes. Dark mode isn't built yet; when it is, this text must not mirror ([0054](../../decisions/0054-style-buttons-by-variant-from-one-colour.md)).
- **Disabled holds the resting colours.** Each colour's `disabled` key defaults to its `base`. Set a `disabled` key in an override to change it.
- **No navigation:** `link` only looks like a link. Navigating will need its own decision, because the UI library doesn't know about the router.
- **Not yet:** sizes and button groups.
- **Schemas:** `buttonPropsSchema` (type `ButtonSerializableProps`) and `buttonStylePropsSchema` in `@inithium/shared-contracts`. Button content (`children`) isn't part of the stored props.
