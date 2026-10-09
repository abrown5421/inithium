---
id: "0068"
title: Switch panels with Tabs built from data, with a sliding underline
status: accepted
date: "2026-10-09"
scope: core
tags: [ui, composites, navigation, accessibility]
related: ["0048", "0056", "0061", "0062"]
supersedes: []
---

# 0068. Switch panels with Tabs built from data, with a sliding underline

## Context

Screens need to show one of several panels at a time, and the colour picker needs a Theme / More colours switch. Tabs is a planned composite, built on Radix ([0056](0056-use-radix-primitives-for-interactive-widgets.md)). Like RadioGroup and Select ([0061](0061-build-radio-groups-from-option-data-with-a-card-variant.md), [0062](0062-draw-select-as-an-input-field-opening-a-list-below.md)), its options should be data.

## Decision

- **Tabs are data:** `tabs={[{ value, label, icon?, disabled?, content }]}`. Value, label, icon and disabled can be stored; `content` is runtime only.
- **Behaviour** comes from `@radix-ui/react-tabs`: `value` / `defaultValue` (default: the first enabled tab) / `onValueChange`; automatic activation (the arrow keys switch tabs immediately).
- **Look:** 40px tabs over a 1px divider; labels `surface-600`, darker on hover, `surface-900` when active; a 2px underline in `color` (default `primary`) that slides to the active tab over 200ms; the new panel fades in over 150ms. No motion under reduced motion.
- **`fill`** stretches tabs to share the bar's width; otherwise they size to their labels and the bar scrolls sideways when they don't fit. Horizontal only.
- **`keepMounted`** keeps inactive panels rendered but hidden, so their state survives switching.
- **Composite stylesheets** are rendered by the composite itself as a React 19 hoisted `<style href precedence>`, so one copy is kept however many render, like AlertStack's.
- **`toCssColor`** is exported from `@inithium/shared-ui-components`, turning a colour value into CSS (e.g. `var(--color-emerald-500)`) for parts style props can't reach, like a composite's stylesheet.
- **Stored props:** `tabs` (without content), `color`, `fill`, margin, padding and animation.

## Alternatives considered

- **Composable `<Tabs.List>` / `<Tabs.Panel>` children:** not storable; data was chosen.
- **A `pills` variant:** left for later.
- **Manual activation** (arrows move focus, Enter switches): automatic was chosen.

## Consequences

- The colour picker uses Tabs for its Theme and More colours tabs.
