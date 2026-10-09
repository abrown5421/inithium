---
id: "0061"
title: Build radio groups from option data, as plain rows or cards
status: accepted
date: "2026-10-09"
scope: core
tags: [ui, components, forms, accessibility]
related: ["0050", "0056", "0057"]
supersedes: []
---

# 0061. Build radio groups from option data, as plain rows or cards

## Context

Forms need one-of-many choices. Radios only make sense as a group, so the component's shape is a choice: a single component configured with data, or composable `<RadioGroup><Radio /></RadioGroup>` children. Like the other components, it should be storable so the CMS can configure it. It's built on Radix ([0056](0056-use-radix-primitives-for-interactive-widgets.md)).

## Decision

- **One component, `RadioGroup`,** takes its choices as data: `options` of `{ value, label, helperText?, disabled?, icon? }`. The whole group, options included, is storable.
- **Behaviour** comes from `@radix-ui/react-radio-group`: `value` / `defaultValue` / `onValueChange`, `name` for forms, `required`, roving focus with arrow keys.
- **Look:** like Checkbox ([0057](0057-style-checkboxes-from-one-colour-on-radix.md)): an 18px round control outlined in `color` (default `primary`), with an 8px `color` dot when selected, a hover tint and a focus outline.
- **Orientation:** `vertical` (default) or `horizontal`.
- **Variants:** `plain` (default) rows, or `card`: each option a bordered card, outlined in `color` with a faint tint when selected, showing the option's icon. Horizontal cards share the row in equal widths.
- **Group label, helper text, `required`, `disabled` and `error`** work as on Checkbox; choosing an option hides the error. Options can be disabled individually.
- **Stored props:** `options`, `label`, `helperText`, `required`, `variant`, `orientation`, `color`, margin, padding and animation. `value` and `error` are runtime only.

## Alternatives considered

- **Composable `<Radio>` children:** more flexible, but not storable; one data-driven component was chosen.
- **No card variant:** cards were added.

## Consequences

- Arbitrary content inside an option (e.g. a price table in a card) isn't possible; options are text, helper text and an icon.
- RadioGroup publishes a fixed stylesheet through `<UiProvider />`.
