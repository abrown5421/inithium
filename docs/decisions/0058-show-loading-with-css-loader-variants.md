---
id: "0058"
title: Show loading with a CSS Loader in five variants, and a loading state on Button
status: accepted
date: "2026-10-08"
scope: core
tags: [ui, components, feedback, accessibility]
related: ["0042", "0048", "0050", "0054"]
supersedes: []
---

# 0058. Show loading with a CSS Loader in five variants, and a loading state on Button

## Context

Pages, panels and buttons need to show that work is in progress. Button's decision ([0054](0054-style-buttons-by-variant-from-one-colour.md)) left a loading state for later. The indicator should share the other components' props (one colour, spacing, animation) without adding a dependency.

## Decision

- **Loader** has five variants: `spinner` (default), `dots`, `bars`, `pulse` and `progress`. They're CSS keyframes in a fixed stylesheet published by `<UiProvider />`.
- **Colour:** one `color` (default `primary`) for the moving part; the spinner's ring and the progress track use it at 20% opacity.
- **Size:** `size` in px, default 24, like Icon ([0050](0050-render-icons-from-lucide-by-name.md)). `progress` is a 4px bar whose `width` defaults to `full`.
- **Progress:** `value` (0–100) fills the bar and makes it a `role="progressbar"`; without it, a segment slides.
- **Speeds are fixed** per variant.
- **Accessibility:** a `role="status"` live region announcing `label` (default "Loading").
- **Reduced motion:** the movement is replaced by a slow fade, so it still looks busy rather than frozen.
- **Stored props:** `variant`, `color`, `size`, `label`, margin, padding, width and animation; `value` is runtime only.
- **Button `loading`:** shows a 16px spinner in the button's text colour, disables the button and sets `aria-busy`. The spinner replaces the leading icon, or covers the hidden content when there's none, so the button keeps its width.

## Alternatives considered

- **Size presets (`sm`, `md`, `lg`):** pixel sizes were chosen, as for Icon.
- **A `speed` prop:** fixed speeds were chosen.
- **Stopping the animation under reduced motion:** a fade was chosen, because a still loader looks broken.
- **A delay before showing, and a full-page overlay:** left out; both can be composed from `show` and Container.

## Consequences

- `.ui-loader-spinner` is reusable on its own with two CSS variables, as Button does.
- `<UiProvider />` publishes a third component stylesheet.
