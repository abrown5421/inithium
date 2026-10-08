---
id: "0037"
title: Style with Tailwind v4, and style components only through typed props
status: accepted
date: "2026-10-07"
scope: core
tags: [styling, tailwind, ui, components, props]
related: ["0013", "0034", "0035"]
supersedes: ["0011"]
---

# 0037. Style with Tailwind v4, and style components only through typed props

## Context

[0011](0011-use-tailwind-v4-for-styling-and-theming.md) chose Tailwind v4 and said components would accept Tailwind classes at the call site to adjust their styling. Since then, style props were made serializable Zod schemas ([0035](0035-define-style-props-as-serializable-zod-schemas.md)) so that page sections can be stored and edited in the CMS. A free-form class string can't be validated or edited that way.

## Decision

- `web`, `cms` and the React libs are styled with **Tailwind CSS v4**, wired in through `@tailwindcss/vite` (unchanged from 0011).
- **UI library components don't accept `className`.** They are styled only through their typed style props.
- When a component can't express something, the fix is a new or extended prop, not a class string.

## Alternatives considered

- **Accepting `className` as a discouraged escape hatch**: rejected. Anything styled through it couldn't be stored or edited by the page framework, and it would gradually bypass the prop system.
- **Tailwind v3**: rejected in 0011, in favour of v4's CSS-only configuration.

## Consequences

- Everything a developer can style in code can also be stored and edited through the CMS.
- The prop system has to cover real needs, and gaps show up as prop requests rather than one-off classes.
- Nx 23's React generators don't set up Tailwind, so new React apps and libs need it wired in by hand (unchanged from 0011).
