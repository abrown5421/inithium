---
id: "0042"
title: Express spacing, sizing and other measurements in pixel numbers
status: accepted
date: "2026-10-07"
scope: core
tags: [ui, props, spacing, sizing]
related: ["0034", "0035", "0036", "0043", "0044"]
supersedes: []
---

# 0042. Express spacing, sizing and other measurements in pixel numbers

## Context

Components share style props for spacing, sizing, borders and similar measurements. They are serializable ([0035](0035-define-style-props-as-serializable-zod-schemas.md)) and support breakpoint and state keys ([0036](0036-write-state-and-breakpoint-values-as-flat-tailwind-style-keys.md)). Tailwind's spacing scale is one option for their values; plain pixel numbers are another.

## Decision

- **Spacing** (`margin`, `padding`) takes an object with any of `all`, `x`, `y`, `top`, `right`, `bottom` and `left`. Each value is a number in **pixels**, not a Tailwind spacing step: `padding={{ all: 32 }}`, `padding={{ x: 15 }}`. A more specific key overrides a less specific one (a side overrides `x`/`y`, which override `all`).
- **Sizing** (`width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`) accepts:
  - a number in pixels;
  - `'full'`: the parent's size;
  - `'screen'`: the viewport's size;
  - a fraction, as any `'n/d'` string, e.g. `'1/2'` or `'5/12'`;
  - `'auto'`;
  - `'fit'`: fit the content.
- **Other measurements are pixel numbers too:** border width, corner radius, gap, position offsets, font size and letter spacing.
  - Border width takes the same side keys as spacing.
  - Radius takes `all`, `top`, `right`, `bottom`, `left` and the four corners: `topLeft`, `topRight`, `bottomRight`, `bottomLeft`.
- **Line height** is a unitless ratio (e.g. `1.5`).
- **Shadow size** uses Tailwind's named sizes (`2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`). Its colour is a colour prop ([0040](0040-colour-prop-values-and-properties.md)).
- **Negative values** are allowed for margins and position offsets.
- Like every style prop, all of these accept breakpoint and state keys.

## Alternatives considered

- **Tailwind's spacing scale** (`4` meaning 1rem): not chosen. Values are plain pixel numbers.
- **Named scales** for radius, font size, line height and letter spacing: not chosen.
- **Disallowing negative margins and offsets**: not chosen.

## Consequences

- Because values reach CSS through variables ([0034](0034-resolve-style-props-to-static-classes-and-css-variables.md)), any pixel number works with no Tailwind configuration.
- Radius and shadow sizes are not theme tokens; only colours and fonts are ([0046](0046-theme-fonts-display-and-body.md)).
