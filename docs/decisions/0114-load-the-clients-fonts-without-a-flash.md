---
id: "0114"
title: Write the client's font rules into each app's page so fonts load without a flash
status: accepted
date: "2026-10-15"
scope: core
tags: [ui, theme, fonts, api, performance, hosting]
related: ["0006", "0082", "0111"]
supersedes: []
---

# 0114. Write the client's font rules into each app's page so fonts load without a flash

## Context

`web` and the CMS load settings at runtime, after their JavaScript. If the client's fonts were declared only then, every visit would draw the page in the default font first and jump when the client's font arrives, shifting the layout.

The api already serves both built apps' `index.html` from one origin ([0006](0006-serve-each-client-from-one-origin.md)).

## Decision

- **The api writes the font rules into `index.html`** when it serves `web` or the CMS: an `@font-face` rule for every library family (a declared font downloads only when text uses it), the `--font-display` / `--font-body` values, and a `<link rel="preload">` for the theme fonts' main files. The result is cached and rebuilt when settings or the library change.
- **Fallbacks are sized to match.** Each family's fallback face uses `size-adjust` and ascent/descent overrides computed from the font's metrics when its files are uploaded ([0111](0111-keep-uploaded-font-families-in-a-library.md)), so the swap barely moves the layout.
- **Fonts still use `font-display: swap`,** so text is never invisible while a font loads.
- **The apps also apply fonts at runtime** from the settings they load, so a change saved in the CMS shows at once without a reload.

## Alternatives considered

- **Declaring fonts only at runtime:** not chosen; it causes the flash and layout shift above.

## Consequences

- In development, Vite serves `index.html`, so the dev servers only get the runtime rules and may show the flash. Production and the production-style run don't.
- The api's static serving gains an `index.html` transform, which must keep the SPA fallbacks and `/api` 404s as they are.
- Library families used only in page content (not by the theme) aren't preloaded; they load when a page uses them.
