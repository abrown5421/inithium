---
id: "0059"
title: Style switches neutral when off and coloured when on, with optional thumb icons
status: accepted
date: "2026-10-08"
scope: core
tags: [ui, components, forms, accessibility]
related: ["0050", "0056", "0057"]
supersedes: []
---

# 0059. Style switches neutral when off and coloured when on, with optional thumb icons

## Context

Switch captures on/off settings. It's built on Radix ([0056](0056-use-radix-primitives-for-interactive-widgets.md)) and should behave like Checkbox ([0057](0057-style-checkboxes-from-one-colour-on-radix.md)) in everything but its look.

## Decision

- **Behaviour** comes from `@radix-ui/react-switch`: `checked` / `defaultChecked` / `onCheckedChange(boolean)`, `name` and `value` for forms; Space and Enter toggle it.
- **Colour:** off, the track is neutral (`surface-300`, `surface-400` on hover) with a `surface-50` thumb; on, the track is filled with `color` (default `primary`) and the thumb is its 100 step. `color` also draws the focus outline.
- **Size:** a 36×20px track with a 16px thumb inset 2px, centred in a 32px row; the thumb slides in 150ms, or jumps with reduced motion.
- **Thumb icons:** `checkedIcon` and `uncheckedIcon` (Lucide names, storable) render with Icon at 12px: in `color` when on, `surface-500` when off.
- **Label:** after the switch by default; `labelPlacement="start"` puts it first and pushes the switch to the far end.
- **Helper text, `required`, `disabled` and `error`** work as on Checkbox: an error rings the track (and fills it, when on) in `red-500`, and toggling hides it until `error` changes or the form submits.
- **Stored props:** `color`, `label`, `labelPlacement`, `helperText`, `required`, the thumb icons, margin, padding and animation. `checked` and `error` are runtime only.

## Alternatives considered

- **Outlining the off track in `color`, like an unchecked Checkbox:** a neutral off state was chosen, so "on" stands out.
- **No thumb icons:** icons were added as an option.

## Consequences

- Switch publishes a fixed stylesheet through `<UiProvider />`, like Checkbox.
- Radio can reuse the shared pieces: the colour roles, label, helper text and error handling.
