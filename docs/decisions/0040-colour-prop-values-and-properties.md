---
id: "0040"
title: Colour props take an object, a colour-name shorthand or transparent, on six properties
status: accepted
date: "2026-10-07"
scope: core
tags: [ui, props, colour, theme]
related: ["0031", "0032", "0034", "0035", "0036"]
supersedes: []
---

# 0040. Colour props take an object, a colour-name shorthand or transparent, on six properties

## Context

Colour props accept theme tokens ([0031](0031-theme-colour-tokens-and-scales.md)) and Tailwind's palette in the same shape, and they resolve through CSS variables ([0034](0034-resolve-style-props-to-static-classes-and-css-variables.md)). The exact set of accepted values, and which CSS properties take a colour prop, needed deciding.

## Decision

- **A colour value is one of three things:**

  | Form | Example | Meaning |
  | --- | --- | --- |
  | Object | `{ color: 'primary', intensity: 200, opacity: 50 }` | A theme token or Tailwind colour at an intensity (50–950), with optional opacity |
  | Shorthand string | `'primary'`, `'emerald'` | That colour at intensity 500 |
  | `'transparent'` | `'transparent'` | Fully transparent |

- **Opacity** is optional on the object form, as a percentage from 0 to 100, matching Tailwind's opacity modifier (e.g. `bg-emerald-200/50`).
- **No `white`, `black`, `current` or `inherit`.** For white and black, use the lightest and darkest `surface` steps, so they follow dark mode ([0032](0032-dark-mode-mirrors-the-theme-scales.md)).
- **Six properties take colour props:** background, text, border, ring, outline and shadow.
- **No automatic readable-text colour.**
- **In the CMS, colour controls offer theme tokens only.** Clients set the theme colours; Tailwind's palette is fixed and only available in code.

## Alternatives considered

- **More properties** (divider, placeholder, caret, form-control accent, icon fill and stroke, gradient stops, underline): not included.
- **An automatic readable-text colour**: not needed.
- **Colours without an intensity as strings** (`white`, `black`, `current`, `inherit`): only `transparent` was kept.

## Consequences

- Variant objects ([0036](0036-write-state-and-breakpoint-values-as-flat-tailwind-style-keys.md)) can hold any of the three forms per key.
- The CSS variable for a colour with opacity mixes the colour with transparency (e.g. CSS `color-mix()`), so opacity also works for theme tokens.
- Text on brand colours flips in dark mode while a brand 500 background doesn't. Whether that needs a pattern is open: [0033](0033-ui-library-design-open-questions.md).
