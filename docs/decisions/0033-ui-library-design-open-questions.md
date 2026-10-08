---
id: "0033"
title: Design the UI library's shared props and remaining structure
status: proposed
date: "2026-10-07"
scope: core
tags: [ui, components, props, design-system]
related: ["0008", "0011", "0030", "0031", "0032"]
supersedes: []
---

# 0033. Design the UI library's shared props and remaining structure

## Context

Components share a common set of style props ([0030](0030-organise-the-ui-library-as-theme-components-composites-and-layouts.md)). Colour props take an object with a colour and an intensity, e.g. `{ color: 'primary', intensity: 500 }` or `{ color: 'emerald', intensity: 200 }`, so theme tokens ([0031](0031-theme-colour-tokens-and-scales.md)) and Tailwind's palette work the same way. The same shape is used for background, text, border, ring and other colour properties. Other prop families (padding, margin, animation and so on) are shared in the same way.

Tailwind v4 only generates classes it finds written out in full in the source, so a class assembled at runtime, like `` `bg-${color}-${intensity}` ``, produces no CSS. Tailwind does expose every palette colour as a CSS variable (`--color-emerald-200`), and theme tokens can be exposed the same way (`--color-primary-200`).

## Decision

Undecided. These are being worked through in order; each will be recorded as an accepted decision when settled.

**Prop system**

- How props become styles: fixed classes plus CSS variables set inline (e.g. the class `bg-(--ui-bg)` with `--ui-bg: var(--color-emerald-200)`), lookup maps, or safelisting.
- Whether style props are serializable JSON defined as Zod schemas, so that page sections stored in MongoDB can be validated and the CMS can build editing controls from the schemas.
- How hover, focus, active and disabled states are expressed.
- Whether props accept responsive (breakpoint) values.
- Whether components accept a `className` escape hatch. [0011](0011-use-tailwind-v4-for-styling-and-theming.md) currently says they accept Tailwind classes at the call site.
- One Nx lib or four (theme, components, composites, layouts), and whether the layering is enforced with a new tag group.

**Colour props**

- Opacity in the colour object; colours without an intensity (`white`, `black`, `transparent`, `current`, `inherit`); shorthand forms.
- An automatic readable text colour for a given background.
- Whether CMS users are limited to theme tokens or can pick from Tailwind's full palette.
- Which properties take a colour object (background, text, border, ring, outline, divider, placeholder, caret, accent, fill, stroke, shadow, gradient stops, decoration).
- How scales are generated: the colour space and lightness curve.

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

The UI foundation (`feat/ui-foundation`) can't be built until the prop system questions are settled.
