---
id: "0057"
title: Style checkboxes from one colour on Radix, with a label, helper text, errors and an indeterminate state
status: accepted
date: "2026-10-08"
scope: core
tags: [ui, components, forms, accessibility]
related: ["0054", "0055", "0056"]
supersedes: []
---

# 0057. Style checkboxes from one colour on Radix, with a label, helper text, errors and an indeterminate state

## Context

Checkbox completes basic forms alongside Input and Button. It's the first component built on Radix ([0056](0056-use-radix-primitives-for-interactive-widgets.md)), and it should feel like Input: a label, helper text and an error that clears itself.

## Decision

- **Behaviour** comes from `@radix-ui/react-checkbox`: `checked` / `defaultChecked` / `onCheckedChange`, with `CheckedState` being `true`, `false` or `'indeterminate'`; `name` and `value` for forms.
- **Colour:** one `color` (default `primary`) draws the outline when unchecked, the fill when checked or indeterminate, a faint hover tint, and the keyboard focus outline. The check (or the indeterminate dash) is the colour's 100 step, as on a filled Button ([0054](0054-style-buttons-by-variant-from-one-colour.md)).
- **Size:** an 18px box (2px border, 4px radius) centred in a 32px row, so it aligns with Input and Button; the label sits 8px to the right and toggles the box when clicked.
- **Label, helper text, `required` and `disabled`** work as on Input ([0055](0055-build-input-as-a-native-field-with-a-floating-label.md)): an asterisk for required, 50% opacity for disabled.
- **Errors:** `error` (boolean, or a message replacing `helperText`) turns the outline, fill and helper text `red-500`. Toggling the box hides it; it shows again when `error` changes or the form is submitted. Input and Checkbox share this logic.
- **Stored props:** `color`, `label`, `helperText`, `required`, margin, padding and animation. `checked` and `error` are runtime only.

## Alternatives considered

None recorded beyond the defaults proposed and accepted.

## Consequences

- Radio and switch can reuse this design: the colour roles, sizes, label and error handling.
- Checkbox publishes a fixed stylesheet through `<UiProvider />`, as Input does.
