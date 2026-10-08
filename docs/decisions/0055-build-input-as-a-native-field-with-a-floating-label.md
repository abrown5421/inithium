---
id: "0055"
title: Build Input as a native field with MUI-style variants and a floating label
status: accepted
date: "2026-10-08"
scope: core
tags: [ui, components, forms, accessibility]
related: ["0031", "0033", "0042", "0048", "0050", "0054"]
supersedes: []
---

# 0055. Build Input as a native field with MUI-style variants and a floating label

## Context

Input is the second interactive component, after Button ([0054](0054-style-buttons-by-variant-from-one-colour.md)). Forms need a text field that lines up with buttons, carries its own label, help and error text, and can hold icons and small actions (show password, clear search). Its configuration must be storable, so a form built in the CMS can be saved. Whether interactive components get their accessibility from a library such as Radix is still open ([0033](0033-ui-library-design-open-questions.md)).

## Decision

- **One component, `Input`,** owns the label, helper text, error message and adornments, like MUI's `TextField`. It renders a native `<input>` and wires the accessibility itself: a generated id linking the `<label>`, `aria-describedby` for helper text, and `aria-invalid` for errors. No library is used, because native inputs already provide the behaviour; the library question stays open for complex widgets.
- **Variants** mimic MUI's text field: `outlined` (default), `filled` (a `surface-200` background) and `standard` (an underline).
- **Colour:** neutral at rest (`surface-500`), darker on hover (`surface-700`), and `color` (default `primary`) for the focused border or underline and the floated label. Typed text inherits its colour.
- **Height:** the field is 32px, matching Button. The label rests inside the field and floats on focus, when there's a value, or when the browser autofills. Outlined labels float into a notch in the border; filled and standard labels float above the field, which reserves 20px for them.
- **Placeholder:** with a label, shown only once the label has floated; without one, always.
- **Errors:** `error` (boolean, or a message that replaces `helperText`) turns the border, label and helper text `red-500`, overriding `color`. Editing the field hides the error and restores the helper text; it shows again when `error` changes or the form is submitted.
- **Adornments:** `leadingIcon` / `trailingIcon` (Lucide names, storable) and `startAdornment` / `endAdornment` (any element, runtime only, replacing the icons). `InputAdornment` renders an icon, or with `onClick` a labelled button that keeps focus in the field.
- **Types:** `text`, `email`, `password`, `search`, `tel`, `url`, `number`. Password fields always get a show/hide toggle. The browser's search clear button and number spinners are hidden.
- **Other props:** `helperText`, `required` (asterisk plus the native attribute), `disabled` (50% opacity), `value` / `defaultValue` / `onValueChange` plus the native `onChange`, margin, padding, width (default `full`), min/max width, and animation.
- **Motion:** the label float follows reduced-motion settings.
- **Styling:** Input's fixed CSS is a stylesheet published by `<UiProvider />`, ahead of the style-prop stylesheet so style props win.

## Alternatives considered

- **A separate label and field (`Input` plus `TextField`):** one component was chosen, since the floating label must live inside it.
- **Taller fields (e.g. 40px), or a label squeezed inside a 32px filled field:** a 32px field with the label floating above was chosen, so inputs and buttons align.
- **A border in `color` at rest:** MUI's neutral-at-rest behaviour was chosen.
- **Errors in a caller-supplied colour, or status tokens in the theme:** a fixed `red-500` was chosen. Rationale not recorded.
- **Radix or React Aria for accessibility:** not needed for a native input; still open for complex widgets ([0033](0033-ui-library-design-open-questions.md)).

## Consequences

- Inputs and buttons share a height; rows mixing filled or standard inputs with buttons align to the bottom.
- `red-500` is the one fixed status colour in core. Status tokens, if added later, would supersede that part of this decision.
- `<UiProvider />` now publishes component CSS as well as style-prop CSS.
- Multiline text, sizes and character counters need their own decisions.
