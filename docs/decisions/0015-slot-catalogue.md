---
id: "0015"
title: Define the slot catalogue and contract shapes
status: proposed
date: "2026-10-07"
scope: core
tags: [plugins, slots, contracts]
related: ["0002", "0026", "0028"]
supersedes: []
---

# 0015. Define the slot catalogue and contract shapes

## Context

Plugins and client libs extend core only through slots: typed extension contracts defined in a core lib, filled through each app's registry file ([0002](0002-install-plugins-as-nx-libs-via-registries.md)). No slot contracts or registry files exist in core yet.

## Decision

Undecided. Open questions:

- Exactly which slots core exposes. Examples raised so far: API route mounts, Mongoose models, web pages and routes, CMS screens, and navigation entries.
- A **"user deleted" hook**, so plugins can remove a deleted user's data from their own collections ([0026](0026-plugins-keep-user-data-in-their-own-collections.md)) without core knowing which plugins exist.
- A **storage driver slot**, through which the storage plugin registers an object-storage driver ([0028](0028-store-assets-behind-pluggable-storage-drivers.md)).
- The contract shape of each slot.

## Alternatives considered

None recorded yet.

## Consequences

No plugin can be built until the slots it needs are defined.
