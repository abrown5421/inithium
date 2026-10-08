---
id: "0050"
title: Render icons from Lucide by name, sized in pixels, coloured by the surrounding text
status: accepted
date: "2026-10-08"
scope: core
tags: [ui, components, icons, accessibility]
related: ["0035", "0040", "0042", "0048"]
supersedes: []
---

# 0050. Render icons from Lucide by name, sized in pixels, coloured by the surrounding text

## Context

Icon is the first component after Container and Text. Buttons, inputs, selects and alerts will all use it. Like other component props, an icon's props must be serializable ([0035](0035-define-style-props-as-serializable-zod-schemas.md)), so that an icon chosen in the CMS can be stored and rendered later.

## Decision

- Icons come from **[Lucide](https://lucide.dev/icons)** (`lucide-react`). An icon is chosen by its **kebab-case name**, e.g. `'arrow-right'`.
- Icons are loaded on demand by name (Lucide's `DynamicIcon`), so storing a name doesn't bundle every icon.
- **Size** is in pixels like other measurements ([0042](0042-size-and-space-in-pixel-numbers.md)). `size` sets width and height together and accepts variant keys. The default is 24, Lucide's own.
- **Colour** is inherited from the surrounding text. `textColor` overrides it, including per state and breakpoint.
- **Accessibility:** decorative by default (hidden from screen readers). A `label` makes the icon announce itself (`role="img"` with that label).
- Icon also takes every shared style prop, the animation prop, and `strokeWidth` (default 2).
- In `@inithium/shared-contracts`, the icon name is checked for format only, so the contracts stay free of React and of Lucide's icon list. In code, the prop is typed as Lucide's exact names.

## Alternatives considered

- **Heroicons, Material Symbols or another set**: Lucide was chosen.
- **Named sizes**: rejected in favour of pixels, matching every other measurement.
- **A fixed icon colour**: not chosen; icons inherit, with `textColor` to override.
- **Announcing every icon to screen readers**: not chosen; icons are decorative unless labelled.

## Consequences

- An app that uses Icon gets one small file per Lucide icon in its build (about 1,900 at 0.5 KB each). Browsers only download the icons a page uses.
- A stored name Lucide doesn't recognise renders as an empty box of the right size and logs a console error. Lucide occasionally renames icons between versions, so names in stored content should be re-checked when Lucide is upgraded.
- Lucide's icons are licensed under ISC.
