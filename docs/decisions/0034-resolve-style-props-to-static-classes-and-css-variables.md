---
id: "0034"
title: Resolve style props to static classes plus CSS variables
status: accepted
date: "2026-10-07"
scope: core
tags: [ui, components, props, tailwind, theme]
related: ["0031", "0033", "0035", "0037"]
supersedes: []
---

# 0034. Resolve style props to static classes plus CSS variables

## Context

Colour props take a token or Tailwind colour plus an intensity, e.g. `{ color: 'emerald', intensity: 200 }`. Tailwind v4 only generates classes it finds written out in full in the source, so a class assembled at runtime, like `` `bg-${color}-${intensity}` ``, produces no CSS. Tailwind exposes every palette colour as a CSS variable (`--color-emerald-200`), and theme tokens can be exposed the same way (`--color-primary-200`).

## Decision

- Components carry **fixed classes** that read from CSS variables, e.g. `bg-(--ui-bg)` and `hover:bg-(--ui-bg-hover)`.
- Style props set those variables **inline**, e.g. `style="--ui-bg: var(--color-emerald-200)"`.
- Theme tokens and Tailwind's palette resolve identically, because both are CSS variables.

## Alternatives considered

- **Lookup maps**, with every colour × intensity × property written out as a class string: rejected. Thousands of entries.
- **Safelisting every combination in Tailwind**: rejected. A much larger stylesheet, multiplied again by state and breakpoint variants.

## Consequences

- The stylesheet stays small: the number of classes depends on properties × states × breakpoints, not on colours.
- Changing a client's theme at runtime only changes variable values; nothing is rebuilt.
- Every combination of property, state and breakpoint that props support needs its fixed class to exist in the source ([0036](0036-write-state-and-breakpoint-values-as-flat-tailwind-style-keys.md)).
