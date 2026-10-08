---
id: "0054"
title: Style buttons by variant from one colour, with fixed metrics and optional overrides
status: accepted
date: "2026-10-08"
scope: core
tags: [ui, components, forms, accessibility]
related: ["0031", "0033", "0036", "0042", "0048", "0050"]
supersedes: []
---

# 0054. Style buttons by variant from one colour, with fixed metrics and optional overrides

## Context

Button is the first interactive component. Like Container, Text and Icon, it needs colour, spacing, width and animation props, and its props must be serializable so a button configured in the CMS can be stored. Buttons across an app should look consistent, so most of their appearance should come from a small set of choices rather than free styling.

## Decision

- **Variants:** `variant` is `filled` (default), `outlined`, `ghost` or `link`. Each is styled from one `color` prop (any colour value except `'transparent'`; default `primary`, meaning 500). With `[color]` as that colour and `[color]-100` as the 100 step of the same colour:
  - `filled`: `[color]` background and 2px border, `[color]-100` text; on hover, a transparent background and `[color]` text.
  - `outlined`: transparent background, `[color]` 2px border and text; on hover, a `[color]` background and `[color]-100` text.
  - `ghost`: transparent background, `[color]` text; on hover, a `surface-200` background.
  - `link`: `[color]` text, underlined on hover.
- **Light text stays light in both modes.** Text on `[color]` is `[color]-100`, for theme tokens and Tailwind colours alike, and must not mirror when dark mode is built. This settles the dark-mode question in [0033](0033-ui-library-design-open-questions.md) for buttons only.
- **Overrides:** optional `bgColor`, `textColor` and `borderColor` override the variant's colours per variant key. A plain value replaces the colour at rest; a variant object replaces only the keys it names.
- **Fixed metrics:** 32px tall, 12px side padding (replaced by `padding`), 6px radius, 2px border, the `body` font at 14px weight 500, a 150ms transition. Radius, font and height are not props. `link` buttons sit inline, with no height, padding or border.
- **Other props:** `margin`, `padding`, `width`, `minWidth`, `maxWidth`, the animation prop ([0048](0048-animate-components-with-animate-css-through-an-animation-prop.md)), and `leadingIcon` / `trailingIcon` as Lucide names rendered with Icon ([0050](0050-render-icons-from-lucide-by-name.md)).
- **Behaviour:** renders a `<button>` with `type="button"` by default. `link` is a look only; it doesn't navigate. Disabled buttons use the native attribute, are drawn at 50% opacity with a not-allowed cursor, and don't change on hover. Keyboard focus shows a 2px `[color]` outline offset by 2px.

## Alternatives considered

- **Text on `[color]` as `surface-100`** (which mirrors in dark mode), **or chosen automatically for contrast**: `[color]-100` in both modes was chosen. Rationale not recorded.
- **A single `color` prop with no overrides:** overrides were added so a button can be styled more specifically without a new variant.
- **`link` rendering an `<a>` with an `href`:** not now. Navigation would tie the UI library to the router.
- **Separate icon props vs. icons as children only:** `leadingIcon` and `trailingIcon` were chosen, so icons can be stored with the button.

## Consequences

- Buttons look consistent by default, and the CMS needs only a variant and a colour to configure one.
- A light `color` (e.g. a 100–300 step) makes `filled` text unreadable unless the caller sets a dark `textColor`.
- When dark mode is built, it must give button text a way to reference the un-mirrored 100 step.
- Sizes, a loading state, button groups and navigation aren't covered and need their own decisions.
