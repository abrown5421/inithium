---
id: "0064"
title: Describe elements with Tooltips that wrap them
status: accepted
date: "2026-10-09"
scope: core
tags: [ui, components, feedback, accessibility]
related: ["0048", "0054", "0056", "0062"]
supersedes: []
---

# 0064. Describe elements with Tooltips that wrap them

## Context

Icon-only buttons, disabled actions and shortcuts need a short description on hover and focus. Tooltip is built on Radix ([0056](0056-use-radix-primitives-for-interactive-widgets.md)) and is the second popup, after Select ([0062](0062-draw-select-as-an-input-field-opening-a-list-below.md)).

## Decision

- **Tooltip wraps its element:** `<Tooltip content="…"><Button /></Tooltip>`, using Radix's trigger on the child, which must accept a ref and events (every component in the library does).
- **Content** is any React content in code; stored tooltips hold text.
- **Placement:** `side` (`top` by default, `bottom`, `left`, `right`) and `align` (`center` by default, `start`, `end`); it flips when there's no room, keeps 8px from the window's edge, and sits 6px from the element.
- **Look:** a bubble in `color` (default `surface` 900) with text in that colour's 100 step, as on a filled Button ([0054](0054-style-buttons-by-variant-from-one-colour.md)); 12px text, a 240px maximum width, a 6px radius and an optional arrow (`arrow`, default true). It slides in from its side over 150ms, without motion under reduced motion.
- **Timing:** opens after 500ms of hovering (`delay` changes it per tooltip), immediately on keyboard focus, and immediately within 300ms of another tooltip closing. `<UiProvider />` renders the shared provider, so apps need nothing extra.
- **Disabled and loading elements** are wrapped in a focusable span automatically, since they send no pointer events.
- **Layering:** a portal at z-index 50, as for every popup.
- **Accessibility:** the text describes the element (`aria-describedby`); it doesn't name it. Tooltips don't open on touch, so they never hold essential information.
- **No style props or `animation` prop:** Tooltip renders no element of its own, so it's an exception to [0048](0048-animate-components-with-animate-css-through-an-animation-prop.md)'s "every component"; the wrapped element keeps its own.
- **Controlled:** `open`, `defaultOpen` and `onOpenChange`.
- **Stored props:** `content` (text), `side`, `align`, `color`, `delay` and `arrow`.

## Alternatives considered

- **Text-only content:** rich content is allowed in code, so shortcuts and formatting are possible.
- **Leaving disabled elements to the caller:** handled automatically.

## Consequences

- A Tooltip outside `<UiProvider />` doesn't work.
- Icon-only buttons in the examples now have tooltips.
