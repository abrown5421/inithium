---
id: "0067"
title: Colour props take an object, a colour-name shorthand or transparent; CMS colour controls offer the full palette
status: accepted
date: "2026-10-09"
scope: core
tags: [ui, props, colour, theme, cms]
related: ["0031", "0032", "0034", "0035", "0036"]
supersedes: ["0040"]
---

# 0067. Colour props take an object, a colour-name shorthand or transparent; CMS colour controls offer the full palette

## Context

[0040](0040-colour-prop-values-and-properties.md) defined colour values and limited CMS colour controls to theme tokens, keeping Tailwind's palette for code only. The coming colour picker will be used by end users in the web app (e.g. avatar backgrounds) and, later, by the CMS's page editor for things like page backgrounds and text. Limiting the editor to the six theme tokens is too strict. What must stay protected is the theme itself: clients set their brand colours, not pick them from a palette.

## Decision

Everything in 0040 stands, except the CMS rule:

- **A colour value is one of three things:** an object `{ color, intensity, opacity? }` (a theme token or Tailwind colour at 50–950, with an optional 0–100 opacity), a shorthand colour name meaning its 500 step, or `'transparent'`.
- **No `white`, `black`, `current` or `inherit`;** use the surface extremes, so they follow dark mode.
- **Six properties take colour props:** background, text, border, ring, outline and shadow.
- **No automatic readable-text colour.**
- **CMS colour controls may offer the full palette** (theme tokens and Tailwind colours), e.g. through the colour picker in the page editor.
- **The theme's own colours are set as hex codes** in the CMS's theme settings, never chosen from the palette ([0031](0031-theme-colour-tokens-and-scales.md)).
- **Theme colours are stored as references** (`{ color: 'primary', intensity: 500 }`), so choices made with them follow the theme when it changes, including choices end users make in the web app.

## Alternatives considered

- **Keeping CMS controls to theme tokens** (0040): too strict for the page editor.
- **Storing a picked theme colour as its hex value**, so it never changes: references were chosen, so content follows a re-brand.

## Consequences

- The colour picker can offer both theme and Tailwind colours wherever it's used.
- A re-brand changes every colour that references a theme token, including end users' choices.
