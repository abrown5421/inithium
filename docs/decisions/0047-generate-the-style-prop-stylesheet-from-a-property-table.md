---
id: "0047"
title: Generate the style-prop stylesheet from one property table
status: accepted
date: "2026-10-07"
scope: core
tags: [ui, components, props, css, tailwind]
related: ["0034", "0036", "0037"]
supersedes: []
---

# 0047. Generate the style-prop stylesheet from one property table

## Context

Style props resolve to fixed classes that read CSS variables ([0034](0034-resolve-style-props-to-static-classes-and-css-variables.md)). Every style property needs a class for every variant key ([0036](0036-write-state-and-breakpoint-values-as-flat-tailwind-style-keys.md)): 6 breakpoint positions × 5 state positions, i.e. 30 per CSS property. Container and Text already use about 60 properties, so about 1,800 classes. Tailwind only generates classes it finds written out literally in the source, so either something writes all of them out for Tailwind, or the rules are generated directly.

## Decision

- A single **property table** in `@inithium/shared-ui-components` lists every style property and the CSS it sets.
- The same table drives both:
  - the **resolver**, which turns props into class names and inline variables;
  - a **stylesheet generator**, which builds one rule per property per variant key (e.g. `.ui-bg-md-hover:hover { background-color: var(--ui-bg-md-hover) }`).
- `<UiProvider />` builds the stylesheet once and injects it. Nothing generated is committed.
- The rules mirror Tailwind's behaviour:
  - the same breakpoint widths, smallest first;
  - `hover` only on devices that can hover;
  - `focus` as `:focus-visible`.
- Tailwind still supplies the palette variables, theme fonts and everything outside style props.

## Alternatives considered

- **Tailwind plus a generated class file**: a script writes a TS file listing every class literally (`md:hover:bg-(--ui-bg-md-hover)` …) for Tailwind to scan. Not chosen: the generated file (about 1,500 lines at the time) would have to be regenerated and committed whenever a prop changed.

## Consequences

- Adding a style property means one table entry plus its resolution, with no other files.
- Class names are built at runtime (`ui-<property><-breakpoint><-state>`), which is safe because nothing depends on Tailwind finding them.
- The stylesheet is about 1,800 rules (~120 KB as text), built in the browser at startup rather than shipped as a cacheable CSS file.
- `0034`'s example syntax (`bg-(--ui-bg)`) is illustrative; the mechanism (fixed classes reading inline CSS variables) is unchanged.
