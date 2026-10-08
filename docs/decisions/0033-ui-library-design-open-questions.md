---
id: "0033"
title: Design the UI library's shared props and remaining structure
status: proposed
date: "2026-10-07"
scope: core
tags: [ui, components, props, design-system]
related: ["0008", "0030", "0031", "0032", "0034", "0035", "0036", "0037", "0038", "0039", "0040", "0041", "0042", "0043", "0044", "0045", "0046", "0047", "0048"]
supersedes: []
---

# 0033. Design the UI library's shared props and remaining structure

## Context

Components share a common set of style props ([0030](0030-organise-the-ui-library-as-theme-components-composites-and-layouts.md)). Colour props take an object with a colour and an intensity, e.g. `{ color: 'primary', intensity: 500 }` or `{ color: 'emerald', intensity: 200 }`, so theme tokens ([0031](0031-theme-colour-tokens-and-scales.md)) and Tailwind's palette work the same way. The same shape is used for background, text, border, ring and other colour properties. Other prop families (padding, margin, animation and so on) are shared in the same way.

Tailwind v4 only generates classes it finds written out in full in the source, so a class assembled at runtime, like `` `bg-${color}-${intensity}` ``, produces no CSS. Tailwind does expose every palette colour as a CSS variable (`--color-emerald-200`), and theme tokens can be exposed the same way (`--color-primary-200`).

## Decision

Undecided. These are being worked through in order; each will be recorded as an accepted decision when settled.

**Settled so far:** styles via static classes and CSS variables ([0034](0034-resolve-style-props-to-static-classes-and-css-variables.md)); serializable Zod schemas ([0035](0035-define-style-props-as-serializable-zod-schemas.md)); flat state and breakpoint keys ([0036](0036-write-state-and-breakpoint-values-as-flat-tailwind-style-keys.md)); no `className` ([0037](0037-style-components-only-through-typed-props.md)); four libs with `ui:` layer tags ([0038](0038-split-the-ui-library-into-four-libs-with-layer-tags.md)); schemas in `shared-contracts` ([0039](0039-keep-style-prop-schemas-in-shared-contracts.md)); colour prop values and properties ([0040](0040-colour-prop-values-and-properties.md)); OKLCH scale generation ([0041](0041-generate-theme-scales-in-oklch.md)); pixel spacing, sizing and measurements ([0042](0042-size-and-space-in-pixel-numbers.md)); Container layout objects ([0043](0043-group-container-layout-props-into-objects.md)); Text typography props ([0044](0044-text-typography-props.md)); the `as` prop ([0045](0045-constrained-as-prop-for-semantic-elements.md)); display and body fonts, with the theme holding colours and fonts only ([0046](0046-theme-fonts-display-and-body.md)); the generated style-prop stylesheet ([0047](0047-generate-the-style-prop-stylesheet-from-a-property-table.md)); animation through animate.css, the `show` trigger and stagger ([0048](0048-animate-components-with-animate-css-through-an-animation-prop.md)).

**Prop system**

- Whether lint should stop `scope:api` code importing the React UI libs, which are `scope:shared`.
- Whether feature libs and apps must build their UI only from the UI library, or may also use plain elements with Tailwind classes. Today `@inithium/cms-auth` (sign-in screens) uses plain elements with Tailwind classes.
- Centring: margins are pixel numbers, so there is no `margin: auto`. Should `margin` accept `'auto'`, or is centring always done with the parent's `flex`?

**Colour**

- Text on brand colours in dark mode. A brand 500 background stays the same in dark mode, but surface or brand text on it flips, so contrast can change between modes. Should mode-fixed text use Tailwind's fixed colours (e.g. `neutral-50`), or is another pattern needed? Can be decided when dark mode is built. (Settled for buttons by [0054](0054-style-buttons-by-variant-from-one-colour.md): their text stays `[color]-100` in both modes.)

**Other families and components** (needed by later component batches, not by `feat/ui-foundation`)

- Other effects: CSS transitions (e.g. a hover colour fade), whole-element opacity and transforms. Entrance, exit and attention animations are settled in 0048.
- Whether accessible behaviour (select, checkbox, radio, switch, slider, tooltip, modal, drawer, tabs) is hand-built or comes from an unstyled library (Radix or React Aria). (Button and Input are native elements and need neither: [0055](0055-build-input-as-a-native-field-with-a-floating-label.md).)
- Size and variant presets (`size`, `variant`).
- An inline Container: `as` has no `span`, so a styled inline wrapper (e.g. inside a link) has to be a block element. Found while building the docs app.
- Ring and outline width and style props. Ring and outline colours ([0040](0040-colour-prop-values-and-properties.md)) aren't implemented until these exist.

## Alternatives considered

None recorded yet.

## Consequences

The theme, the shared props, Container and Text are built (`feat/ui-foundation`). The remaining questions block later component batches.
