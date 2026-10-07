---
id: "0001"
title: Split the ecosystem into core, plugins and sandbox
status: accepted
date: "2026-10-07"
scope: ecosystem
tags: [architecture, plugins]
related: ["0002", "0003", "0004"]
supersedes: []
---

# 0001. Split the ecosystem into core, plugins and sandbox

## Context

Inithium is the base for many client applications, but clients need different features: a blog has no use for ecommerce. Optional features have to be available to any client that needs them without being present for clients that don't.

## Decision

The Inithium repo has three root directories:

- **`core/`**: the clonable Nx workspace every client app starts from. It holds the shared contracts, the UI library, the `api`, `web` and `cms` apps, and the core libs. It contains no plugin code and never references a plugin.
- **`plugins/`**: a library of optional capabilities. Each plugin is added to a client only when that client needs it.
- **`sandbox/`**: tooling that rebuilds a copy of core with every plugin installed, for testing plugins (see [0003](0003-regenerate-the-sandbox-on-demand.md)).

## Alternatives considered

- **Shipping every feature in core**: rejected. Plugin code should only ever be added when a client needs it; there is no sense in a blog application carrying ecommerce code.

## Consequences

- Core has to be heavily abstracted. Anything that varies per client is configuration or a plugin.
- Core needs extension points (slots) that plugins can fill without core knowing they exist. See [0002](0002-install-plugins-as-nx-libs-via-registries.md).
- Plugins can't be tested in core itself, which is why the sandbox exists.
