---
id: "0056"
title: Use Radix primitives for interactive widgets the browser doesn't provide
status: accepted
date: "2026-10-08"
scope: core
tags: [ui, components, accessibility, dependencies]
related: ["0033", "0054", "0055", "0057"]
supersedes: []
---

# 0056. Use Radix primitives for interactive widgets the browser doesn't provide

## Context

[0033](0033-ui-library-design-open-questions.md) left open whether interactive components (select, checkbox, radio, switch, slider, tooltip, modal, drawer, tabs) get their accessible behaviour by hand or from an unstyled library such as Radix or React Aria. Button ([0054](0054-style-buttons-by-variant-from-one-colour.md)) and Input ([0055](0055-build-input-as-a-native-field-with-a-floating-label.md)) didn't need to answer it: they're native elements with built-in behaviour. Checkbox is the first component that needs it.

## Decision

- **Radix Primitives** (`@radix-ui/react-*`) provide the behaviour of interactive widgets: checkbox, radio, switch, select, slider, tooltip, and later composites such as modal, drawer and tabs. Our components style them with the same props as every other component (one `color`, style props, animation) and never expose Radix's own API.
- **Each widget installs its own package** (e.g. `@radix-ui/react-checkbox`), so a widget adds only what it uses.
- **Native elements stay native.** Where the browser already provides the behaviour (`<button>`, `<input>`), no library is used.

## Alternatives considered

- **React Aria:** Radix was chosen. Rationale not recorded.
- **Hand-built behaviour:** not chosen, so that accessibility relies on a widely used, tested library.

## Consequences

- Core depends on one Radix package per widget built.
- Radix's markup shapes ours: e.g. a Checkbox is a `<button role="checkbox">`, with a hidden native input added inside forms.
- The accessibility question in [0033](0033-ui-library-design-open-questions.md) is settled.
