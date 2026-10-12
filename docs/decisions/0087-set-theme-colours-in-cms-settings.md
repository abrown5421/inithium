---
id: "0087"
title: Set the theme's colours as hex codes in the CMS's Settings, applied by web and the CMS at runtime
status: accepted
date: "2026-10-12"
scope: core
tags: [cms, settings, theme, branding]
related: ["0031", "0041", "0067", "0082", "0086"]
supersedes: []
---

# 0087. Set the theme's colours as hex codes in the CMS's Settings, applied by web and the CMS at runtime

## Context

Each client brands their site with their own colours. The theme already generates every token's 50–950 scale from one colour per token ([0031](0031-theme-colour-tokens-and-scales.md), [0041](0041-generate-theme-scales-in-oklch.md)), and theme colours are set as hex codes, never picked ([0067](0067-colour-values-with-the-full-palette-in-cms-controls.md)). Site settings were planned to hold them ([0082](0082-keep-site-wide-settings-in-one-record.md)).

## Decision

- **Where:** the CMS's Settings screen (`settings.edit`, [0086](0086-run-the-cms-in-a-sidebar-frame-with-a-pages-screen.md)), with the site title, logo and copyright holder.
- **What:** six hex codes, stored as the settings record's optional `theme` (`themeConfigSchema`): the 500 of `primary`, `secondary`, `tertiary`, `quaternary` and `accent`, and the **100** of `surface`, as the theme has always taken them. The rest of each scale is generated.
- **Editing:** each colour is a hex field with a swatch and a live row of its generated scale, the client's own step outlined. "Reset to defaults" restores Inithium's colours and, once saved, removes the stored theme so the site follows core's defaults.
- **Applying:** both apps keep `UiProvider`'s default theme and render the client's over it once settings load: `web`'s shell from its startup bundle (visitors see a change on their next full load), and the CMS from the site bundle (straight after saving, so the CMS looks like the client's own).

## Alternatives considered

- **Surface set at 500:** the theme takes surface's 100, the page background, which says more about the site's look.
- **A colour picker for theme colours:** theme colours are hex codes ([0067](0067-colour-values-with-the-full-palette-in-cms-controls.md)).

## Consequences

- Until settings load, both apps show the default theme for a moment.
- Fonts and dark mode are still to come in settings.
