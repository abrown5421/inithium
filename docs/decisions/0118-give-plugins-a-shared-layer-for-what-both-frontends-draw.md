---
id: "0118"
title: Give plugins a shared layer for what both frontends draw
status: accepted
date: "2026-10-16"
scope: ecosystem
tags: [plugins, architecture, content, boundaries]
related: ["0002", "0015", "0116"]
supersedes: []
---

# 0118. Give plugins a shared layer for what both frontends draw

## Context

A plugin's content element ([0116](0116-build-content-pages-from-a-tree-of-library-elements.md)) is drawn in two places: on the site (`web`) and in the page builder's preview (the CMS). Core's own elements manage it because their renderer lives in `@inithium/shared-content`, a shared lib both apps import. A plugin's layers were `api`, `web`, `cms` and `contracts` ([0002](0002-install-plugins-as-nx-libs-via-registries.md)), and none of them could hold a renderer both apps import:

- `scope:cms` libs may not import `scope:web` libs, so the CMS can't use the plugin's `web` lib;
- `contracts` is `type:util`, which can't use React or the UI library.

## Decision

- **Plugins may have a fifth layer, `shared/`**, for React that both frontends draw. It starts with content element renderers.
- **Where it lands:** `plugins/plugin-<name>/shared/` in the Inithium repo, installed as `core/libs/plugins/<name>/shared` → `@inithium/plugin-<name>-shared`.
- **Tags:** `scope:shared`, `type:feature`, `origin:plugin`. Like any shared lib, it may use the UI library and the plugin's `contracts`, and never api, web-only or cms-only code.
- **Optional:** a plugin without content elements (or other things both frontends draw) has none.
- **Registered by both apps:** `web`'s registry and the CMS's registry both list the plugin's renderers from this layer, so the preview draws exactly what the site does.

## Alternatives considered

- **The renderer in the plugin's `web` lib, with a placeholder in the preview:** keeps four layers, but the page builder would show plugin elements as a labelled box instead of drawing them. Not chosen.
- **Letting the CMS import plugins' `web` libs:** a live preview, but core's scope rule would need an exception. Not chosen.

## Consequences

- The plugin layout in CLAUDE.md and the manual lists five layers, `shared` optional.
- The install tooling (still to be rebuilt, [0105](0105-manage-plugins-with-one-install-tool-activation-and-versions.md)) copies and ejects the `shared` layer like the others.
- Core's boundary rules are unchanged: `scope:shared` and `origin:plugin` already allow it.
