---
id: "0044"
title: Give Text props for size, weight, alignment, line height, letter spacing, truncation and font family
status: accepted
date: "2026-10-07"
scope: core
tags: [ui, components, props, typography]
related: ["0030", "0042", "0046"]
supersedes: []
---

# 0044. Give Text props for size, weight, alignment, line height, letter spacing, truncation and font family

## Context

Text ([0030](0030-organise-the-ui-library-as-theme-components-composites-and-layouts.md)) needs typography controls, and the theme defines two font families ([0046](0046-theme-fonts-display-and-body.md)).

## Decision

Text supports:

- **font size**: pixels;
- **font weight**;
- **text alignment**;
- **line height**: a unitless ratio;
- **letter spacing**: pixels;
- **truncation**;
- **font family**: `display` or `body`, the theme's two families.

Units follow [0042](0042-size-and-space-in-pixel-numbers.md).

## Alternatives considered

None recorded.

## Consequences

The exact value sets (e.g. weights as 100–900 numbers, and whether truncation is single-line only or a line count) are settled when Text is built (`feat/ui-foundation`) and documented in the UI reference.
