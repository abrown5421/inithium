---
id: "0038"
title: Split the UI library into four libs, with a ui tag group enforcing the layers
status: accepted
date: "2026-10-07"
scope: core
tags: [ui, nx, libs, eslint, conventions]
related: ["0007", "0030"]
supersedes: []
---

# 0038. Split the UI library into four libs, with a ui tag group enforcing the layers

## Context

The UI library has four layers, each building only on the layers above it: theme, components, composites and layouts ([0030](0030-organise-the-ui-library-as-theme-components-composites-and-layouts.md)). Without enforcement, a component could end up importing a composite and blur the layering.

## Decision

- Each layer is its own lib:

  | Lib | Path |
  | --- | --- |
  | `@inithium/shared-ui-theme` | `libs/shared/ui-theme` |
  | `@inithium/shared-ui-components` | `libs/shared/ui-components` |
  | `@inithium/shared-ui-composites` | `libs/shared/ui-composites` |
  | `@inithium/shared-ui-layouts` | `libs/shared/ui-layouts` |

- A new tag group, `ui:`, marks the layer: `ui:theme`, `ui:component`, `ui:composite`, `ui:layout`. These libs also carry `scope:shared`, `type:ui` and `origin:core`.
- `@nx/enforce-module-boundaries` enforces the layering:

  | A lib tagged | May depend on |
  | --- | --- |
  | `ui:theme` | no other `ui:` lib |
  | `ui:component` | `ui:theme` |
  | `ui:composite` | `ui:component`, `ui:theme` |
  | `ui:layout` | `ui:composite`, `ui:component`, `ui:theme` |

## Alternatives considered

- **One lib with four folders**: rejected. Simpler imports, but the layering would rely on review instead of lint.

## Consequences

- The `ui:` tag group is added to the conventions, and its rules to `core/eslint.config.mjs`, when the UI libs are created.
- Imports name the layer explicitly, e.g. `@inithium/shared-ui-components`.
