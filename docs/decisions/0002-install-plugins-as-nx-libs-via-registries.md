---
id: "0002"
title: Install plugins as Nx libs wired in through generated registries
status: accepted
date: "2026-10-07"
scope: ecosystem
tags: [plugins, nx, slots]
related: ["0001", "0007", "0015", "0016", "0018", "0019"]
supersedes: []
---

# 0002. Install plugins as Nx libs wired in through generated registries

## Context

A plugin spans every layer: API routes and models, end-user pages in `web`, management screens in `cms`, shared contracts and seed data. Installing it must not leave unused code in core or scatter it through the apps, and ejecting it must leave the workspace exactly as it was.

## Decision

- A plugin's source is split by layer into Nx libs: `api/`, `web/`, `cms/` and `contracts/`.
- On install, the layers land in `core/libs/plugins/<name>/<layer>` with the alias `@inithium/plugin-<name>-<layer>`. They never go inside an app.
- Each app has a registry file that core ships empty. Installing a plugin adds one registration to each app it touches; ejecting removes it. Registry files are owned by the install/eject tooling and are never hand-edited.
- Every plugin ships an idempotent seed (run on install) and an unseed (run on eject) that removes only what its seed created.
- Ejecting means: unseed, remove the registry entries, delete `libs/plugins/<name>/`. Afterwards the workspace must type-check and build exactly as it did before the install.

## Alternatives considered

- **npm packages**: rejected. Keeping everything in Nx was preferred to expanding into published packages.
- **Copying plugin code into the apps**: rejected. Apps hold no plugin code (see [0007](0007-keep-apps-thin-and-logic-in-libs.md)). The original sandbox scripts that did this are due to be rebuilt.

## Consequences

- Plugin libs follow the same tags and module boundaries as core libs, tagged `origin:plugin`. Only the registry files import them.
- Which slots exist, and their contract shapes, is still open: [0015](0015-slot-catalogue.md).
- How unseed identifies its own data is still open: [0019](0019-seed-tracking.md).
