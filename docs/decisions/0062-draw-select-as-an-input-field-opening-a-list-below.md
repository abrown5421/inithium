---
id: "0062"
title: Draw Select as an Input field that opens a list below it
status: accepted
date: "2026-10-09"
scope: core
tags: [ui, components, forms, accessibility]
related: ["0050", "0055", "0056", "0061"]
supersedes: []
---

# 0062. Draw Select as an Input field that opens a list below it

## Context

Forms need a way to choose one option from a list too long to show as radios. The field should match Input ([0055](0055-build-input-as-a-native-field-with-a-floating-label.md)) so the two line up in a form, and the options should be storable like RadioGroup's ([0061](0061-build-radio-groups-from-option-data-with-a-card-variant.md)). Behaviour comes from Radix ([0056](0056-use-radix-primitives-for-interactive-widgets.md)). Select is also the first popup component.

## Decision

- **The field is an Input field:** the same variants, floating label, placeholder, helper text, errors, `required`, `disabled`, `leadingIcon`, `color`, 32px height and default `full` width, and the same style props (`inputStylePropsSchema`). Input's stylesheet treats a field marked `data-active` as focused and `data-filled` as having a value, which Select sets; the shared text-start measurement and error handling are hooks used by both.
- **Behaviour** comes from `@radix-ui/react-select`: `value` / `defaultValue` / `onValueChange`, `open` / `onOpenChange`, `name` for forms, keyboard navigation and typeahead.
- **Options are data:** `{ value, label, icon?, disabled? }`, optionally in groups `{ label, options }` shown under headings with a line between groups. The whole Select is storable.
- **The list** opens below the field (Radix's popper position), at least as wide as it, at most 280px tall, with scroll arrows; `surface-50` with a soft border, a large shadow and an 8px radius; 32px rows, highlighted in `surface-200`, with a check in `color` on the chosen one. It fades and drops in over 150ms, without animation under reduced motion. The chevron turns while it's open.
- **Layering:** popups render at the end of the page in a portal, at z-index 50, so overflow never clips them. Later popups (e.g. Tooltip) follow the same convention.
- **Not included:** clearing back to nothing (use a "None" option), searching or filtering (a separate combobox), and multiple selection (a separate component).
- **Stored props:** `options`, `variant`, `color`, `label`, `placeholder`, `helperText`, `required`, `leadingIcon`, margin, padding, width and animation. `value` and `error` are runtime only.

## Alternatives considered

- **Opening over the field with the chosen item aligned to it (macOS-style):** opening below was chosen.
- **A `clearable` option:** left out for now.

## Consequences

- Select and Input share their field CSS, so a change to Input's field affects both.
- z-index 50 is the popup layer; a z-index scale may be needed if layering conflicts appear.
