---
id: "0092"
title: Build UI from the library's components before plain elements
status: accepted
date: "2026-10-12"
scope: core
tags: [ui, components, conventions]
related: ["0033", "0037", "0045"]
supersedes: []
---

# 0092. Build UI from the library's components before plain elements

## Context

[0033](0033-ui-library-design-open-questions.md) left open whether feature libs and apps must build their UI only from the UI library, or may also use plain elements. Code was being written with plain `<div>`s and `<span>`s (and stylesheets for them) where Container and the other components already did the job, e.g. the first ProfileLayout.

## Decision

- **Use the UI library's components and composites wherever they can do the job:** Container for boxes and layout (with `as` for semantic elements), Text for text, Button, Input and so on. This applies to apps, feature libs and the layouts layer alike.
- **Plain HTML elements are a last resort**, used only when no component can express what's needed. Today's cases:
  - `<form>`: no component renders one;
  - values style props can't take, such as a `calc()` height or a raw hex swatch;
  - a component's own internals.
  - Each such element should say why in a comment.
- When a component *almost* fits, prefer extending its props ([0037](0037-style-components-only-through-typed-props.md)) to writing a plain element.

## Alternatives considered

- **Plain elements with Tailwind classes or stylesheets alongside the library:** rejected; the library should be used as often as possible.

## Consequences

- ProfileLayout is built from Containers, with no stylesheet of its own.
- Gaps found this way (e.g. a Form component, `calc()` sizing) are reasons to extend the library rather than to work around it.
