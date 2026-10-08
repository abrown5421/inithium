---
id: "0033"
title: Design the UI library's shared props and remaining structure
status: proposed
date: "2026-10-07"
scope: core
tags: [ui, components, props, design-system]
related: ["0008", "0030", "0031", "0032", "0034", "0035", "0036", "0037", "0038", "0039", "0040", "0041"]
supersedes: []
---

# 0033. Design the UI library's shared props and remaining structure

## Context

Components share a common set of style props ([0030](0030-organise-the-ui-library-as-theme-components-composites-and-layouts.md)). Colour props take an object with a colour and an intensity, e.g. `{ color: 'primary', intensity: 500 }` or `{ color: 'emerald', intensity: 200 }`, so theme tokens ([0031](0031-theme-colour-tokens-and-scales.md)) and Tailwind's palette work the same way. The same shape is used for background, text, border, ring and other colour properties. Other prop families (padding, margin, animation and so on) are shared in the same way.

Tailwind v4 only generates classes it finds written out in full in the source, so a class assembled at runtime, like `` `bg-${color}-${intensity}` ``, produces no CSS. Tailwind does expose every palette colour as a CSS variable (`--color-emerald-200`), and theme tokens can be exposed the same way (`--color-primary-200`).

## Decision

Undecided. These are being worked through in order; each will be recorded as an accepted decision when settled.

**Settled so far:** styles via static classes and CSS variables ([0034](0034-resolve-style-props-to-static-classes-and-css-variables.md)); serializable Zod schemas ([0035](0035-define-style-props-as-serializable-zod-schemas.md)); flat state and breakpoint keys ([0036](0036-write-state-and-breakpoint-values-as-flat-tailwind-style-keys.md)); no `className` ([0037](0037-style-components-only-through-typed-props.md)); four libs with `ui:` layer tags ([0038](0038-split-the-ui-library-into-four-libs-with-layer-tags.md)); schemas in `shared-contracts` ([0039](0039-keep-style-prop-schemas-in-shared-contracts.md)); colour prop values and properties ([0040](0040-colour-prop-values-and-properties.md)); OKLCH scale generation ([0041](0041-generate-theme-scales-in-oklch.md)).

**Prop system**

- Whether lint should stop `scope:api` code importing the React UI libs, which are `scope:shared`.

**Colour**

- Text on brand colours in dark mode. A brand 500 background stays the same in dark mode, but surface or brand text on it flips, so contrast can change between modes. Should mode-fixed text use Tailwind's fixed colours (e.g. `neutral-50`), or is another pattern needed? Can be decided when dark mode is built.

**Other families and components**

- The spacing shape and allowed values; sizing, layout, border, typography and effects families.
- What animation objects cover (transitions, hover effects, keyframes) and whether a library such as Motion is used.
- An `as` prop for rendering different elements.
- Whether accessible behaviour (select, checkbox, radio, switch, slider, tooltip, modal, drawer, tabs) is hand-built or comes from an unstyled library (Radix or React Aria).
- Size and variant presets (`size`, `variant`).
- What else the theme holds beyond colour: fonts, logo, radius, shadows.

## Alternatives considered

None recorded yet.

## Consequences

The UI foundation (`feat/ui-foundation`) can't be built until the remaining prop families it ships with (at least spacing, plus anything Container and Text need) are settled.
