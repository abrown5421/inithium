---
id: "0036"
title: Write state and breakpoint values as flat, Tailwind-style keys
status: accepted
date: "2026-10-07"
scope: core
tags: [ui, components, props, responsive, states]
related: ["0034", "0035"]
supersedes: []
---

# 0036. Write state and breakpoint values as flat, Tailwind-style keys

## Context

Style props need different values per interaction state (e.g. a darker background on hover) and per screen size. Both kinds of variation can apply to the same prop at once.

## Decision

- Any style prop takes either a **single value** or an **object of variant keys**.
- Variant keys are flat and read like Tailwind variants:
  - `base`: the default;
  - a breakpoint: `sm`, `md`, `lg`, `xl`, `2xl` (Tailwind's breakpoints);
  - a state: `hover`, `focus`, `active`, `disabled`;
  - a breakpoint and a state joined with a colon, e.g. `'md:hover'`.

  ```tsx
  bgColor={{
    base:       { color: 'primary', intensity: 500 },
    hover:      { color: 'primary', intensity: 600 },
    md:         { color: 'secondary', intensity: 500 },
    'md:hover': { color: 'secondary', intensity: 600 },
  }}
  ```

- `focus` means keyboard-visible focus (CSS `:focus-visible`), so clicking with a mouse doesn't show focus styles.
- Only these four states are supported.

## Alternatives considered

- **Breakpoints outside, states nested inside** (or the reverse): rejected. Two levels of nesting, and the state map would need a second "default" key so the two maps couldn't be confused.
- **Separate state props** (e.g. `hover={{ bgColor: … }}`): not chosen. Rationale not recorded.
- **More states** (form states such as `checked` and `invalid`, parent/group states, `open` and `selected`): not included.

## Consequences

- Variant objects are one level deep, which keeps the Zod schemas and stored page data simple.
- With the static-class approach ([0034](0034-resolve-style-props-to-static-classes-and-css-variables.md)), each property needs a fixed class for every key combination: 6 breakpoint positions (including `base`) × 5 state positions (including none).
