---
id: "0051"
title: Browser-test the UI library in a development-only gallery at /ui
status: accepted
date: "2026-10-08"
scope: core
tags: [ui, components, testing, local-development]
related: ["0030", "0049"]
supersedes: []
---

# 0051. Browser-test the UI library in a development-only gallery at /ui

## Context

Every new component is browser-tested before it's merged. Until now, all UI demos lived on `web`'s placeholder home page, which grew longer with each component and mixed unrelated demos together. Components are being built one at a time ([0049](0049-document-every-ui-component-on-its-own-page.md)), so each needs its own place to be tested.

## Decision

- `web` has a **UI gallery at `/ui`** with a page per part of the library (theme, animation, and one page per component), selected from a sidebar.
- The gallery exists **only in development**. The route is behind `import.meta.env.DEV`, so production builds leave it out entirely and client sites never ship it.
- Every new component, composite and layout **adds a gallery page** in the same change as its docs page. The page shows its props in use, its states, breakpoints and accessibility behaviour.

## Alternatives considered

- **Keeping demos on the home page**: rejected. It was already long, and testing one component meant scrolling past everything else.

## Consequences

- Browser-testing a component means opening `http://localhost:5173/ui/<component>`.
- Gallery pages are composed only from the UI library, so they also show how components combine.
- The gallery is a natural starting point for live examples on the future docs site.
