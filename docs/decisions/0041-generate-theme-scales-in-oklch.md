---
id: "0041"
title: Generate theme scales in even OKLCH steps from the client's chosen colour
status: accepted
date: "2026-10-07"
scope: core
tags: [ui, theme, colour]
related: ["0031", "0032"]
supersedes: []
---

# 0041. Generate theme scales in even OKLCH steps from the client's chosen colour

## Context

Clients set one colour per theme token, and the rest of each 11-step scale is generated ([0031](0031-theme-colour-tokens-and-scales.md)). How the steps are generated decides whether a scale looks evenly stepped. Tailwind v4's palette is defined in OKLCH, a colour space in which equal lightness steps look equal to the eye.

## Decision

- Scales are generated in **OKLCH**, in **perceptually even steps**.
- **Brand tokens:** the client's chosen colour is exactly the **500** step. The scale is generated lighter from there to 50 and darker to 950.
- **Surface:** the client's chosen colour is exactly the **100** step. 50 is generated lighter, and 200 to 950 increasingly darker. Steps are even within the background band (50–400) and the text band (600–950). The generator keeps the contrast gap between the bands that [0031](0031-theme-colour-tokens-and-scales.md) requires.

## Alternatives considered

None recorded.

## Consequences

- Generated theme scales sit alongside Tailwind's palette without looking out of place.
- The exact lightness curve, and how chroma is handled near the light and dark ends, are implementation details of the generator. They must keep the chosen colour exact and the surface contrast guarantee intact.
