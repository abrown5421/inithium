---
id: "0030"
title: Organise the UI library as theme, components, composites and layouts
status: accepted
date: "2026-10-07"
scope: core
tags: [ui, frontend, components, design-system]
related: ["0007", "0011", "0031", "0033"]
supersedes: []
---

# 0030. Organise the UI library as theme, components, composites and layouts

## Context

`web`, `cms` and plugin UIs need one shared UI library, so that every screen is built from the same pieces and themed the same way.

## Decision

The UI library is divided into four layers. Each layer builds only on the layers above it:

| Layer | Level | What it is | Known members |
| --- | --- | --- | --- |
| **Theme** | Foundation | The single source of truth for branding. | Colour tokens ([0031](0031-theme-colour-tokens-and-scales.md)). |
| **Components** | Atoms | Reusable, single-purpose UI elements that share a common set of style props (margin, padding, background, text and border colour, and so on). | container, text, button, input, select, checkbox, radio, switch, slider, icon, divider, spinner, tooltip |
| **Composites** | Molecules | UI elements built by combining components (e.g. a modal from containers, text, buttons and dividers). | modal, alert, drawer, pagination, breadcrumbs, tabs, auto-incrementing list, colour picker (list not final) |
| **Layouts** | Organisms | Page-level structures built from components and composites. | A collection view (a card per document, with filters); a page that fills the viewport height minus the navbar and scrolls on overflow (list not final) |

## Alternatives considered

None recorded.

## Consequences

- Whether the layers are one Nx lib or four, and how the layering is enforced, is still open: [0033](0033-ui-library-design-open-questions.md).
- The shared style props must be designed before the components: [0033](0033-ui-library-design-open-questions.md).
