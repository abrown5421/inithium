---
id: "0046"
title: Theme two font families, display and body, with core defaults a client can replace
status: accepted
date: "2026-10-07"
scope: core
tags: [ui, theme, typography, fonts, assets]
related: ["0028", "0031", "0044"]
supersedes: []
---

# 0046. Theme two font families, display and body, with core defaults a client can replace

## Context

The theme is the single source of truth for branding. Alongside colour ([0031](0031-theme-colour-tokens-and-scales.md)), branding includes typefaces: a branding or logo-style font, and a font for everything else.

## Decision

- The theme defines two font families:
  - **`display`**: branding and logo-style text;
  - **`body`**: everything else.
- Core ships **default font files** for both. The files will be provided and added to core.
- A client can **replace** either font by uploading their own in the CMS. Uploaded fonts are stored as assets ([0028](0028-store-assets-behind-pluggable-storage-drivers.md)).
- The theme holds colours and fonts only. Radius and shadow sizes are not theme tokens.

## Alternatives considered

- **Fixed fonts in core**, the same for every client: not chosen.
- **A curated set** of fonts the client picks from: not chosen.

## Consequences

- Uploading a custom font depends on the assets feature. Until it exists, every client uses the defaults.
- An uploaded font must fit the active storage driver's per-asset limit (2 MB with the database driver). Typical `woff2` web font files are well under that.
