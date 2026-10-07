---
id: "0026"
title: Plugins keep user data in their own collections, keyed by userId
status: accepted
date: "2026-10-07"
scope: ecosystem
tags: [plugins, users, mongodb, data-model]
related: ["0002", "0015", "0022"]
supersedes: []
---

# 0026. Plugins keep user data in their own collections, keyed by userId

## Context

The user model ([0022](0022-store-all-users-in-one-collection-with-roles.md)) holds core fields only. Plugins will need their own per-user data: for example, an ecommerce plugin needs shipping and billing addresses. That data could either be added to the `users` document or kept in collections the plugin owns.

## Decision

- Plugins never add fields to the `users` collection or to the core user schema and contract.
- A plugin stores its per-user data in its own collections, each document carrying a `userId` that references the user (e.g. `ecom` owns `addresses` and, later, `orders`).
- Plugin data the UI needs is served by the plugin's own endpoints, not added to `GET /api/auth/me`.

## Alternatives considered

- **Plugins adding fields to `users`**: rejected for several reasons:
  - Ejecting would leave orphaned fields in every user document, or need a migration to remove them.
  - The core user schema and contract would change with every installed plugin, which breaks "core never references plugins" and complicates upstream merges.
  - Two plugins could collide on the same field name.

## Consequences

- Ejecting a plugin only touches its own collections.
- Separate collections follow the usual MongoDB guidance: embed data that is always read with its parent and owned by the same module, and reference data owned by another module or that grows without bound (like orders).
- When a user is deleted, plugins must be able to remove that user's data. That needs a "user deleted" hook in the slot catalogue: [0015](0015-slot-catalogue.md).
