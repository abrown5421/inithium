---
title: Style props
description: The prop shapes every UI component shares, defined once and referenced by each component page.
scope: core
tags: [ui, props, colour, spacing, sizing]
order: 1
decisions: ["0034", "0035", "0036", "0040", "0042"]
---

# Style props

Components are styled only through typed props. This page defines the shapes those props take; each component page lists which props it accepts and links back here.

All style props are plain, serializable data, defined as Zod schemas in `@inithium/shared-contracts` ([0035](../decisions/0035-define-style-props-as-serializable-zod-schemas.md)). Anything you can write in code can also be stored, e.g. in a page section.

## Variants

Every style prop takes either **a single value** or **a variant object** mapping variant keys to values ([0036](../decisions/0036-write-state-and-breakpoint-values-as-flat-tailwind-style-keys.md)). In type tables this is written `Variants<T>`.

```tsx
bgColor="primary"                                    // single value
bgColor={{
  base:       'primary',                             // default
  hover:      { color: 'primary', intensity: 600 },  // state
  md:         'secondary',                           // breakpoint
  'md:hover': 'transparent',                         // breakpoint + state
}}
```

| Key | Applies |
| --- | --- |
| `base` | Always (the default) |
| `sm`, `md`, `lg`, `xl`, `2xl` | From 640px, 768px, 1024px, 1280px, 1536px wide |
| `hover` | On hover, only on devices that can hover |
| `focus` | On keyboard focus (`:focus-visible`), not on mouse click |
| `active` | While pressed |
| `disabled` | When the element is `:disabled` |
| `'<breakpoint>:<state>'` | Both, e.g. `'md:hover'` |

**Precedence:** larger breakpoints override smaller ones, and a state overrides the non-state value at the same breakpoint.

**Exceptions:**

- Container's layout objects (`flex`, `grid`, `position`, `overflow`, `flexItem`, `gridItem`) take variant objects on **each field** instead, e.g. `grid={{ columns: { base: 1, md: 3 } }}`.
- `animation` takes no variant keys.

## Value shapes

### Colour value

A theme token or Tailwind colour ([0040](../decisions/0040-colour-prop-values-and-properties.md)). Written `Colour` in type tables.

| Form | Example | Result |
| --- | --- | --- |
| Object | `{ color: 'primary', intensity: 200 }` | `--color-primary-200` |
| Object with opacity | `{ color: 'emerald', intensity: 500, opacity: 40 }` | That colour at 40% |
| Name | `'primary'`, `'emerald'` | The colour at intensity 500 |
| `'transparent'` | `'transparent'` | Fully transparent |

- **`color`:** a theme token (`primary`, `secondary`, `tertiary`, `quaternary`, `accent`, `surface`) or a Tailwind colour (`red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`, `slate`, `gray`, `zinc`, `neutral`, `stone`, `mauve`, `olive`, `mist`, `taupe`).
- **`intensity`:** `50`, `100`, `200` … `900`, `950`.
- **`opacity`:** a percentage, 0–100. Optional.
- There is no `white`, `black`, `current` or `inherit`. For white and black, use the lightest and darkest `surface` steps so they follow dark mode.

### Sides

Pixel values per side ([0042](../decisions/0042-size-and-space-in-pixel-numbers.md)). Written `Sides` in type tables. Used by `margin`, `padding`, `borderWidth` and Container's `position` offsets.

```tsx
padding={{ all: 16 }}                 // every side
padding={{ x: 24, y: 8 }}             // left/right and top/bottom
padding={{ all: 16, left: 0 }}        // a side overrides x/y, which override all
```

| Key | Sets |
| --- | --- |
| `all` | Every side |
| `x` | Left and right |
| `y` | Top and bottom |
| `top`, `right`, `bottom`, `left` | One side |

Values are pixel numbers. `margin` (and position offsets) may be negative; `padding` and `borderWidth` may not.

### Size

Written `Size` in type tables. Used by `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight` and `flexItem.basis`.

| Value | Means |
| --- | --- |
| `240` (a number) | 240px |
| `'full'` | 100% of the parent |
| `'screen'` | The viewport: `100vw` for widths, `100dvh` for heights |
| `'1/2'`, `'2/3'`, `'5/12'` … | That fraction of the parent (any `'n/d'`) |
| `'auto'` | `auto` |
| `'fit'` | Fit the content (`fit-content`) |

### Radius

Corner radius in pixels. Written `Radius` in type tables.

```tsx
radius={{ all: 8 }}
radius={{ top: 12 }}                       // both top corners
radius={{ all: 8, bottomRight: 0 }}
```

| Key | Sets |
| --- | --- |
| `all` | Every corner |
| `top`, `right`, `bottom`, `left` | That side's two corners |
| `topLeft`, `topRight`, `bottomRight`, `bottomLeft` | One corner |

**Precedence:** a corner wins, then `top` or `bottom`, then `left` or `right`, then `all`.

### Border style

`'solid'`, `'dashed'`, `'dotted'`, `'double'` or `'none'`. Borders are solid by default, so `borderWidth` alone draws a solid border.

### Shadow size

Tailwind's shadows: `'none'`, `'2xs'`, `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`. Black at Tailwind's opacity by default; `shadowColor` replaces the colour.

## Shared props

Every component accepts these, except where its page says otherwise: [Button](components/button.md) takes only the colours, spacing and widths, and [Input](components/input.md) only the spacing and widths, since the rest is fixed. Component pages list them alongside their own props.

| Prop | Type | Description |
| --- | --- | --- |
| `bgColor` | `Variants<Colour>` | Background colour |
| `textColor` | `Variants<Colour>` | Text colour, inherited by children |
| `borderColor` | `Variants<Colour>` | Border colour |
| `shadowColor` | `Variants<Colour>` | Shadow colour (with `shadow`) |
| `margin` | `Variants<Sides>` | Outer spacing, px, negatives allowed |
| `padding` | `Variants<Sides>` | Inner spacing, px |
| `width`, `height` | `Variants<Size>` | Size |
| `minWidth`, `maxWidth`, `minHeight`, `maxHeight` | `Variants<Size>` | Size limits |
| `borderWidth` | `Variants<Sides>` | Border width per side, px |
| `borderStyle` | `Variants<BorderStyle>` | Border style |
| `radius` | `Variants<Radius>` | Corner radius |
| `shadow` | `Variants<ShadowSize>` | Shadow size |
| `animation` | `Animation` | Entrance, exit and attention animations. See [Animation](animations/index.md). |

A prop you don't pass sets nothing, so the element keeps its default or inherited style.

## Schemas and types

From `@inithium/shared-contracts`:

| Schema | Type | Shape |
| --- | --- | --- |
| `colorValueSchema` | `ColorValue` | Colour value |
| `solidColorValueSchema` | `SolidColorValue` | Colour value other than `'transparent'` |
| `marginSchema`, `paddingSchema`, `borderWidthSchema` | | Sides |
| `sizeValueSchema` | | Size |
| `radiusSchema` | | Radius |
| `withVariants(schema)` | `Variants<T>` | Wraps any of these in variant keys |
| `sharedStylePropsSchema` | `SharedStyleProps` | The shared props above (without `animation`) |
| `containerPropsSchema`, `textPropsSchema`, `iconPropsSchema`, `buttonPropsSchema`, `inputPropsSchema` | `ContainerSerializableProps`, `TextSerializableProps`, `IconSerializableProps`, `ButtonSerializableProps`, `InputSerializableProps` | Everything a component can store: style props plus `animation` (plus `stagger` for Container; `name`, `label`, `size` and `strokeWidth` for Icon; `variant`, `color` and the icons for Button; `variant`, `color`, `type`, `label`, `placeholder`, `helperText`, `required` and the icons for Input) |
