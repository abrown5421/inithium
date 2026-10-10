---
id: "0082"
title: Keep site-wide settings in one record, starting with the brand and copyright
status: accepted
date: "2026-10-10"
scope: core
tags: [cms, settings, branding]
related: ["0067", "0076", "0077", "0079"]
supersedes: []
---

# 0082. Keep site-wide settings in one record, starting with the brand and copyright

## Context

The Navbar needs a site title and logo and the Footer a copyright holder ([0076](0076-navigate-with-a-navbar-that-collapses-into-a-drawer.md), [0077](0077-close-pages-with-a-two-row-footer.md)); these vary per client and must be edited in the CMS, not code.

## Decision

- **One `settings` record** per site, with a Zod contract in `@inithium/shared-contracts`. It starts with `siteTitle`, `logo` `{ src, alt }` (a URL until assets exist) and `copyright` (the holder).
- `web` receives it in its startup bundle ([0079](0079-route-web-pages-through-a-shell-with-audiences-and-sequential-transitions.md)); the CMS edits it on a Settings screen, behind `settings.edit`.
- The API creates default settings on first start if none exist, and never overwrites them.
- **Later:** the theme's colours (as hex values, [0067](0067-colour-values-with-the-full-palette-in-cms-controls.md)) and fonts, SEO defaults, and an uploaded logo.

## Alternatives considered

- **Brand in environment variables or code:** clients couldn't change it.

## Consequences

- A new client gets working defaults and sets the brand in the CMS.
