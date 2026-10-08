---
title: The ecosystem
description: Core, plugins, the sandbox and the docs, and how they relate.
scope: ecosystem
tags: [architecture, plugins]
order: 1
decisions: ["0001", "0002", "0003", "0052", "0053"]
---

# The ecosystem

The Inithium repo has four parts ([0001](../decisions/0001-split-core-plugins-and-sandbox.md)):

| Part | What it is | Reaches a client? |
| --- | --- | --- |
| `core/` | The Nx workspace every client app is cloned from: the `api`, `web` and `cms` apps, the UI library and the core libs | Yes: it **is** the client app |
| `plugins/` | Optional features, each packaged end to end (API, `web` pages, `cms` screens, data) | Only the plugins that client installs |
| `sandbox/` | Tooling that regenerates a copy of core with plugins installed, for testing | No |
| `docs/` | This manual and the decision records | No |

## Core

Core is the repeated, central pattern for every application. Because it's copied to every client, it's **heavily abstracted**:

- **No client-specific values in core:** no copy, branding or business rules. Anything that varies per client is configuration (stored through the `cms`) or a plugin.
- **Core never references plugins:** no imports, routes, seeds or settings. Its only point of contact with plugins is a set of empty slot registries that installing a plugin fills in ([0002](../decisions/0002-install-plugins-as-nx-libs-via-registries.md)).

See [The core workspace](core-workspace.md).

## Plugins

A plugin packages one optional capability end to end, e.g. ecommerce:
- its API routes, models and seed data;
- its pages in `web`;
- its management screens in `cms`.

A client that doesn't use a plugin has **none of its code**; a client that does gets it installed rather than rebuilt. No plugins exist yet. See [Plugins](../plugins/index.md).

## The sandbox

The sandbox is a copy of core with **every** plugin installed, for testing plugins in the browser. It's regenerated from `core/` and `plugins/` rather than committed, so it can't drift from core ([0003](../decisions/0003-regenerate-the-sandbox-on-demand.md)). See [The sandbox](sandbox.md).

## The docs

`docs/` is this manual, written alongside the code ([0052](../decisions/0052-keep-a-self-documenting-developer-manual.md)). It's read in `core/apps/docs`, a development-only app that client clones leave out ([0053](../decisions/0053-view-the-manual-in-a-docs-app.md)).
