---
id: "0031"
title: Theme with six colour tokens on 50–950 scales, with surface split into background and text bands
status: accepted
date: "2026-10-07"
scope: core
tags: [ui, theme, colour, accessibility]
related: ["0011", "0030", "0032"]
supersedes: []
---

# 0031. Theme with six colour tokens on 50–950 scales, with surface split into background and text bands

## Context

The theme is the single source of truth for branding ([0030](0030-organise-the-ui-library-as-theme-components-composites-and-layouts.md)), and each client sets their brand colours in the CMS. Components accept colours as a token plus an intensity (e.g. primary at 500). Body text must always be readable against its background. Dark mode will come later and should need as little component work as possible.

## Decision

- **Six semantic tokens:** `primary`, `secondary`, `tertiary`, `quaternary`, `accent` and `surface`. There are no separate status tokens (success, warning, danger, info). Status UIs use these six tokens or Tailwind's own colours, case by case.
- **Every token has an 11-step scale:** 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950.
- **Brand tokens** (`primary` to `accent`): the client sets the **500** colour with a colour picker in the CMS. The rest of the scale is generated, lighter towards 50 and darker towards 950.
- **Surface:** the client sets the **100** colour. The rest is generated, with 50 lighter and 200 to 950 increasingly dark. Surface colours backgrounds and body text, in fixed roles:

  | Steps | Role |
  | --- | --- |
  | 50–400 | Backgrounds |
  | 500 | Midpoint: borders and dividers, never text on a background |
  | 600–950 | Text |

- **Contrast is guaranteed by the generator.** Surface is generated as two bands, a light background band and a dark text band, with a deliberate gap between them. Every text step (600–950) meets WCAG AA contrast (4.5:1) against every background step (50–400). The weakest pair, 600 on 400, is the one the generator must satisfy.

## Alternatives considered

- **Status tokens (success, warning, danger, info)**: not added. The theme stays at six tokens.
- **Defining every shade by hand**: not chosen. The client sets one colour per token and the scale is generated.
- **Backgrounds at 100–500 and text at 600–950** (the first proposal): changed. With a 50 step and the dark-mode mirror ([0032](0032-dark-mode-mirrors-the-theme-scales.md)), 500 maps to itself, so in dark mode it would be a background as light as the first text step. Moving the background band to 50–400 and making 500 a midpoint keeps the mirror exact.
- **Keeping 100–500 backgrounds, with 50 as an extra step outside the mirror**: offered as a way to keep the first proposal, but the shifted bands were chosen.
- **An evenly stepped surface scale with a pairing rule** (text must be some number of steps from its background): rejected. Neighbouring steps on an even scale don't contrast enough, and a pairing rule would rely on every component author applying it.

## Consequences

- Any UI (core, plugins, client libs, generated pages) that puts surface text on a surface background gets readable contrast without checking. This only holds if it uses 50–400 for backgrounds and 600–950 for text.
- The contrast guarantee applies to surface. Brand scales are generated evenly; text on brand colours is not guaranteed.
- How colours are generated (the colour space and exact lightness curve), and anything else that counts as branding (fonts, logo, radius), are open: [0033](0033-ui-library-design-open-questions.md).
- The CMS colour picker is a composite, built later.
