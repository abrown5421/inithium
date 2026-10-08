---
id: "0011"
title: Use Tailwind CSS v4 for styling and theming
status: superseded
date: "2026-10-07"
scope: core
tags: [styling, theming, tailwind, frontend]
related: ["0013"]
supersedes: []
supersededBy: "0037"
---

# 0011. Use Tailwind CSS v4 for styling and theming

## Context

Every client site is themed from configuration, so core needs a consistent colour system to theme against. Components also need a simple way to accept styling overrides where they are used.

## Decision

`web`, `cms` and the React libs are styled with Tailwind CSS v4, wired in through `@tailwindcss/vite`. Theming is built on Tailwind's colour system, and components accept Tailwind classes at the call site to adjust their styling.

## Alternatives considered

- **Tailwind v3**: rejected in favour of v4, which is configured entirely in CSS rather than through a JavaScript config file.

## Consequences

- Nx 23's React generators no longer set up Tailwind, so new React apps and libs need it wired in by hand.
- The theming system will be expressed in Tailwind colour terms.
