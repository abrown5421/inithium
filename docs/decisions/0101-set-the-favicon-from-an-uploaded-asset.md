---
id: "0101"
title: Set the favicon from an uploaded ICO, PNG or SVG in site settings
status: accepted
date: "2026-10-14"
scope: core
tags: [settings, assets, branding, cms]
related: ["0082", "0098"]
supersedes: []
---

# 0101. Set the favicon from an uploaded ICO, PNG or SVG in site settings

## Context

Every site showed Inithium's default `favicon.ico` from the apps' `index.html`. Assets had a `favicon` purpose ([0098](0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)) that nothing used yet. The user asked for a favicon set the same way as the logo ([0082](0082-keep-site-wide-settings-in-one-record.md)), configured for icon files.

## Decision

- **Site settings hold an optional `favicon`, `{ assetId }`,** set in the CMS's Settings under the logo with the same asset field. Its picker lists only files uploaded as favicons.
- **ICO, PNG and SVG are accepted:**
  - ICO files are kept as they are.
  - SVGs are sanitised as for any staff upload.
  - Other raster images get the square crop step and are stored as **PNG** (not WebP, which some browsers don't take as a favicon), up to 512 px, first frame only.
- **Both `web` and the CMS use it.** `useFavicon()` points the `index.html`'s icon link at the asset, and restores the default when none is set.
- **Like the logo, its file can't be deleted while it's the favicon.**

## Alternatives considered

- **ICO only**: suggested first by the user; ICO, PNG and SVG were chosen, since most people have a PNG and modern browsers take all three. No further rationale recorded.

## Consequences

- A site's favicon comes from the api, so it appears once the site settings load; until then, and if the asset is missing, the browser shows the default.
- Apple touch icons, web app manifests and multiple sizes aren't covered.
