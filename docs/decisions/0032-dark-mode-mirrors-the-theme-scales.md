---
id: "0032"
title: Implement dark mode by mirroring every theme scale
status: accepted
date: "2026-10-07"
scope: core
tags: [ui, theme, colour, dark-mode]
related: ["0031"]
supersedes: []
---

# 0032. Implement dark mode by mirroring every theme scale

## Context

Dark mode will be supported eventually, most likely as a per-user preference, but it isn't being built yet. Core screens, plugin UIs and generated pages built before then must still work in dark mode once it exists, without each one handling dark mode itself.

## Decision

- In dark mode, every theme token's scale is mirrored around 500:

  | Light step | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
  | Dark mode uses | 950 | 900 | 800 | 700 | 600 | 500 | 400 | 300 | 200 | 100 | 50 |

- This applies to `surface` and to the brand tokens (`primary` to `accent`).
- The mirror comes from the same client-chosen colours. There is no separate dark palette.
- Components and pages never handle dark mode themselves. They use the token roles ([0031](0031-theme-colour-tokens-and-scales.md)), and the mirror does the rest.

## Alternatives considered

- **A separately chosen dark surface colour**: rejected in favour of mirroring the same scale, so one colour per token drives both modes.
- **Leaving brand tokens unchanged in dark mode**: rejected; brand scales mirror like surface.

## Consequences

- Because surface's background band (50–400) mirrors onto the text band's colours and vice versa, surface's contrast guarantee holds in both modes.
- A brand token's 500 is the client's chosen colour and sits on the mirror's midpoint, so the chosen brand colour is identical in both modes.
- Any UI that hard-codes light-mode assumptions, e.g. Tailwind `white` or `gray-900` for backgrounds and text instead of surface steps, won't flip. Theme tokens should be used wherever a colour must follow the mode.
- How a user switches modes, and where the preference is stored, are decided when dark mode is built.
