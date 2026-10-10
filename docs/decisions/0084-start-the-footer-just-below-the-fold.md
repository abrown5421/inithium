---
id: "0084"
title: Start the footer just below the fold
status: accepted
date: "2026-10-10"
scope: core
tags: [ui, layouts, web]
related: ["0077", "0079"]
supersedes: []
---

# 0084. Start the footer just below the fold

## Context

On short pages the Footer sat at the bottom of the screen, so it was always in view. It should only appear when the visitor scrolls past the page.

## Decision

- The Navbar and the page's content area together are at least the screen's height, so the Footer starts just below the fold. Longer content pushes it further down.
- The web shell measures the Navbar and publishes its height as the CSS variable `--ui-navbar-height` (`NAVBAR_HEIGHT_VAR` from `@inithium/shared-ui-layouts`). DefaultLayout gives its content area a minimum height of `100dvh` minus that variable.
- Outside the shell (e.g. the manual's examples) the variable is unset, the rule drops out, and the layout simply fills its frame.

## Alternatives considered

- **A fixed 64px Navbar height in the layout:** measuring keeps it right if the Navbar's padding changes.

## Consequences

- Layouts with a Footer should use the same variable to keep it below the fold.
