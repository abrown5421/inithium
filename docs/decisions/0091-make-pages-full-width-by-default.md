---
id: "0091"
title: Make pages full width by default
status: accepted
date: "2026-10-12"
scope: core
tags: [ui, layouts, pages]
related: ["0079", "0090"]
supersedes: []
---

# 0091. Make pages full width by default

## Context

New pages and layouts kept capping their content at a maximum width of 1200px (for example the first profile page). Most pages should use the whole width of the screen.

## Decision

- **Pages, layouts and page-level content are full width by default.** Don't cap content at a maximum width (e.g. 1200px) unless a design calls for it.
- Padding at the sides is fine; a narrow column for something like a sign-in card ([BareLayout](../ui-library/layouts/bare-layout.md)) is a deliberate exception, not the default.

## Alternatives considered

- **A centred column up to 1200px:** what had been used; rejected because most pages should be full width.

## Consequences

- DefaultLayout, FullWidthLayout and ProfileLayout have no maximum width. Forms inside a page take the width they're given.
