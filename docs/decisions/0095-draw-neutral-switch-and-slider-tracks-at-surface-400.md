---
id: "0095"
title: Draw neutral switch and slider tracks at surface 400
status: accepted
date: "2026-10-12"
scope: core
tags: [ui, components, colour]
related: ["0031", "0059", "0063", "0094"]
supersedes: []
---

# 0095. Draw neutral switch and slider tracks at surface 400

## Context

Switch's track while off ([0059](0059-style-switches-neutral-when-off-and-coloured-when-on.md)) and Slider's track ([0063](0063-pick-numbers-and-ranges-with-a-slider.md)) were `surface-300`. The content editor's side panels are `surface-300` ([0094](0094-edit-content-pages-in-a-cms-screen-that-fills-the-frame.md)), so on them both tracks disappeared, leaving a switch's thumb floating on its own.

## Decision

- **Switch:** the off track is `surface-400`, and `surface-500` on hover.
- **Slider:** the unfilled track is `surface-400`.
- Everything else in 0059 and 0063 stands. This amends only the track colours, so neither record is superseded.

## Alternatives considered

- **Lighter editor panels (`surface-200`):** rejected; the panels were asked for at `surface-300`.

## Consequences

- Both tracks stay visible on every background step from `surface-50` to `surface-300`.
- On `surface-400` and darker backgrounds they still blend in. A track that must show there needs its own colour prop, which doesn't exist yet.
