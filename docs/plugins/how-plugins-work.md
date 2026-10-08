---
title: How plugins work
description: How a plugin is laid out, installed as libs, wired in through slot registries, seeded, and ejected.
scope: ecosystem
tags: [plugins, architecture, seeding]
order: 1
decisions: ["0002", "0015", "0016", "0019", "0026", "0029"]
---

# How plugins work

A plugin adds one optional capability to a core clone, end to end. It's built so that a client who doesn't use it has none of its code, and a client who does gets it installed rather than rebuilt ([0002](../decisions/0002-install-plugins-as-nx-libs-via-registries.md)). No plugins exist yet; this page describes the design they'll follow.

## A plugin's layout

In the Inithium repo, each plugin is a folder of layers, and each layer is an Nx lib:

```
plugins/plugin-<name>/
  api/         Express routes, Mongoose models, services, seed and unseed
  web/         React components for the end-user site, and their RTK Query endpoints
  cms/         React components for the client portal, and their RTK Query endpoints
  contracts/   Zod schemas and inferred types shared by the layers above
  docs/        The plugin's manual pages and decisions (never installed into a client)
```

## Installing: libs, never app code

Installed into a core clone, a plugin lands as libs. Nothing goes inside an app:

```
core/libs/plugins/<name>/
  api/        -> @inithium/plugin-<name>-api
  web/        -> @inithium/plugin-<name>-web
  cms/        -> @inithium/plugin-<name>-cms
  contracts/  -> @inithium/plugin-<name>-contracts
```

A plugin may depend on core libs and on its own layers. Whether one plugin may depend on another (e.g. `ecom` using `storage`) is still open ([0016](../decisions/0016-plugin-to-plugin-dependencies.md)).

## Slots: how a plugin plugs in

Core defines **slot points**: typed extension contracts such as API route mounts, Mongoose models, `web` pages and routes, `cms` screens and navigation entries.

- **Registry files:** each app has a registry file that core ships **empty**. Installing a plugin adds one registration to the registry of each app it touches, and ejecting removes it.
- **The install/eject tooling owns the registries.** Don't hand-edit them, and core never adds entries itself. With empty registries, the apps build and run with no plugin code at all.
- **New extension points are slot contracts.** When core needs one, it adds a new slot contract and wires it in through the registry; core never looks for a particular plugin.

Exactly which slots core exposes, and their shapes, is still open ([0015](../decisions/0015-slot-catalogue.md)). Known candidates include a "user deleted" hook and a storage-driver slot.

## Seeding and unseeding

- **Seed:** every plugin ships an idempotent seed, run on install. It creates the plugin's default `cms` pages, settings, navigation entries and any required data, and running it twice creates nothing new.
- **Unseed:** every plugin ships an unseed, run on eject, which removes **only** what its own seed created.
- **Where they live:** both live in the plugin's `api` lib.

How unseed identifies exactly what its seed created is still open ([0019](../decisions/0019-seed-tracking.md)).

## A plugin's data

- **Plugins never add fields to `users`,** or to the core user schema or contract. A plugin keeps per-user data in its own collections, each document carrying a `userId`. For example, `ecom` would own `addresses` ([0026](../decisions/0026-plugins-keep-user-data-in-their-own-collections.md)).
- **Data comes from the plugin's own endpoints.** Anything a frontend needs is served there, never added to `GET /api/auth/me`.
- **Deleting a user** will need the "user deleted" slot, so plugins can remove that user's data without core knowing which plugins exist.
- **Uploads:** whether plugin uploads (e.g. product images) require a scalable storage driver is still open ([0029](../decisions/0029-storage-requirements-for-plugin-uploads.md)).

## Ejecting

Ejecting a plugin is:
1. run its unseed;
2. remove its registry entries;
3. delete `libs/plugins/<name>/`.

Afterwards the workspace must type-check and build exactly as it did before the plugin was installed.
