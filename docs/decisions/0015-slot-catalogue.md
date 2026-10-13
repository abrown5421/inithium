---
id: "0015"
title: Define the slot catalogue and contract shapes
status: proposed
date: "2026-10-12"
scope: core
tags: [plugins, slots, contracts]
related: ["0002", "0026", "0028", "0076", "0078", "0080", "0081", "0090", "0098"]
supersedes: []
---

# 0015. Define the slot catalogue and contract shapes

## Context

Plugins and client libs extend core only through slots: typed extension contracts defined in a core lib, filled through each app's registry file ([0002](0002-install-plugins-as-nx-libs-via-registries.md)). No slot contracts or registry files exist in core yet.

## Decision

Partly settled. Slots decided so far, with contract shapes defined when each is built:

- **Web page templates:** core, plugins and client libs register page templates in `web` ([0078](0078-store-pages-as-records-rendered-by-code-templates.md)).
- **Navbar ancillary:** extras before the Navbar's user section, e.g. a cart button ([0076](0076-navigate-with-a-navbar-that-collapses-into-a-drawer.md)).
- **Profile tabs, sidebar sections and header actions,** each aware of who is viewing ([0081](0081-extend-the-profile-page-through-slots-by-viewer.md)). Their contract shapes are settled in [0090](0090-generate-and-show-user-profiles.md): entries `{ key, order, viewers, component }` registered as `registeredProfileSlots` in the web registry.

Plugin menu entries aren't a slot: plugins seed page records with navigation settings ([0080](0080-build-menus-from-page-navigation-settings.md)).

Still open:

- Which other slots core exposes. Raised so far: API route mounts, Mongoose models, CMS screens and CMS sidebar entries.
- A **"user deleted" hook**, so plugins can remove a deleted user's data from their own collections ([0026](0026-plugins-keep-user-data-in-their-own-collections.md)) without core knowing which plugins exist.
- ~~A **storage driver slot**~~: no longer needed. The R2 driver ships in core, chosen by `STORAGE_MODE` ([0098](0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)).
- The contract shape of each slot.

## Alternatives considered

None recorded yet.

## Consequences

No plugin can be built until the slots it needs are defined.
