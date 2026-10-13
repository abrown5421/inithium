---
id: "0096"
title: Put the content editor's toolbar and panels on one surface, divided by borders
status: accepted
date: "2026-10-13"
scope: core
tags: [cms, editor, colour]
related: ["0094", "0095"]
supersedes: []
---

# 0096. Put the content editor's toolbar and panels on one surface, divided by borders

## Context

[0094](0094-edit-content-pages-in-a-cms-screen-that-fills-the-frame.md) gave the content editor:
- a `surface-200` toolbar;
- `surface-300` side panels;
- a `2xl` shadow on each, over a `surface-950` canvas.

The shadow is a drop shadow, falling mostly downward. What spills sideways lands on the near-black canvas and can't be seen, so nothing marked where the panels end.

## Decision

- **One surface:** the toolbar and both side panels are `surface-200`.
- **Borders as dividers:** a 1px `surface-500` border at 50% marks each edge that meets something else:
  - the toolbar's bottom;
  - the Structure panel's right edge;
  - the Properties panel's left edge.
- **Shadows:** the side panels keep their `2xl` shadow. The toolbar sits above the panels with the shorter `lg` shadow, which fades out about 20px into them, under its border.
  - Its `2xl` shadow darkened the panels' top ~100px (to about #D0D3D6 under the default theme), so they looked a different colour from the toolbar.
  - No shadow at all, with the panels stacked above the toolbar, was tried and felt flat.
- **Back button:** the toolbar's back button is icon-only, labelled "Back to Pages" (with a tooltip).
- Everything else in 0094 stands. This amends only these details, so 0094 isn't superseded.

## Alternatives considered

- **Shadows alone as dividers:** rejected; they can't be seen against the dark canvas.

## Consequences

- Switch and Slider tracks no longer need to stand out on `surface-300` in the editor. Their darker tracks ([0095](0095-draw-neutral-switch-and-slider-tracks-at-surface-400.md)) stay, since they also read better on lighter surfaces.
