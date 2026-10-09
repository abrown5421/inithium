---
id: "0063"
title: Pick numbers and ranges with a Slider that takes a number or a pair
status: accepted
date: "2026-10-09"
scope: core
tags: [ui, components, forms, accessibility]
related: ["0056", "0057", "0059"]
supersedes: []
---

# 0063. Pick numbers and ranges with a Slider that takes a number or a pair

## Context

Forms need a way to pick a number, or a range, from a scale. Slider is built on Radix ([0056](0056-use-radix-primitives-for-interactive-widgets.md)), whose value is always an array, and should share the other form controls' label, helper text and error handling.

## Decision

- **One component for both:** a number value gives one thumb, `[low, high]` a range; callbacks return the same shape. Internally it converts to and from Radix's array.
- **Behaviour** comes from `@radix-ui/react-slider`: `min` (0), `max` (100), `step` (1), `minStepsBetweenThumbs` (0), keyboard and pointer control; `onValueChange` while changing, `onValueCommit` when a change ends; `name` (or `name[]` for a range) for forms.
- **Look:** a 4px `surface-300` track in a 32px row, filled with `color` (default `primary`) up to or between the thumbs; 16px `color` thumbs with a light ring that grow on hover and while pressed; a `color` focus outline.
- **Value bubble:** `valueLabel` is `auto` (default: while hovered, focused or dragged), `always` or `off`. `formatValue` writes values in the bubble, the label row and `aria-valuetext`.
- **Marks:** `marks` is `true` (a tick at every step) or `{ value, label? }[]`, with labels under the track. Marks follow Radix's thumb positioning, so ticks sit under the thumbs.
- **Label row:** `label` on the left and the current (formatted) value on the right.
- **Helper text, `disabled` and `error`** work as on the other form controls; changing the value hides the error. `required` only adds an asterisk, since a slider always has a value.
- **Horizontal only** for now.
- **Stored props:** `min`, `max`, `step`, `minStepsBetweenThumbs`, `marks`, `valueLabel`, `label`, `helperText`, `required`, `color`, margin, padding, width and animation. `value`, `error` and `formatValue` are runtime only.

## Alternatives considered

- **Always an array, as in Radix:** a plain number for single sliders was chosen, because it reads more naturally.
- **Vertical sliders:** left for later.

## Consequences

- `formatValue` can't be stored, so a stored slider shows plain numbers unless the page supplies a formatter.
- Slider publishes a fixed stylesheet through `<UiProvider />`.
