---
title: Plugins
description: Optional features installed into a core clone, and how plugins are built.
scope: ecosystem
tags: [plugins]
order: 5
decisions: ["0002", "0026"]
---

# Plugins

Plugins add optional features to a core clone: their API routes and models, `web` pages, `cms` screens and seed data, installed as Nx libs and wired in through slot registries ([0002](../decisions/0002-install-plugins-as-nx-libs-via-registries.md)). A client that doesn't use a plugin has none of its code.

| Page | Covers |
| --- | --- |
| [How plugins work](how-plugins-work.md) | Layout, installing as libs, slots, seeding, data ownership and ejecting |

No plugins exist yet. Each plugin will document itself in `plugins/plugin-<name>/docs/`, using the same section structure as this manual. To test plugins, see [The sandbox](../architecture/sandbox.md).
