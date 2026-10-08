---
title: The core workspace
description: The apps, the libs, the UI layers and the rules that keep them apart.
scope: core
tags: [architecture, nx, libs]
order: 2
decisions: ["0006", "0007", "0008", "0035", "0038", "0039"]
---

# The core workspace

`core/` is a standalone Nx workspace with the package scope `@inithium`.

## Apps

Apps are **thin orchestrators**: they start up, compose libs and route to what libs provide. They contain no business logic: no data access, validation rules or domain decisions ([0007](../decisions/0007-keep-apps-thin-and-logic-in-libs.md)).

| App | Role | Dev URL |
| --- | --- | --- |
| `api` | Express server. The single source of truth and the only thing that talks to MongoDB. In production it also serves both frontends. | http://localhost:3000/api |
| `web` | The end-user site, built at runtime from the settings and pages configured in the `cms` | http://localhost:5173/ |
| `cms` | The client portal, where clients manage the `web` site | http://localhost:5174/cms/ |
| `docs` | This manual's viewer. Development only; never reaches clients. | http://localhost:5175/ |

### How data flows

```
cms  --(RTK Query)-->  api  -->  MongoDB  <--  api  <--(RTK Query)--  web
     edits settings/pages                           fetches config at runtime
```

Nothing about a particular client's site is hard-coded in `web`; it renders whatever the API returns. All three client-facing apps share one origin per client ([0006](../decisions/0006-serve-each-client-from-one-origin.md)), so the frontends call the API with relative `/api/...` URLs. See [Routing and hosting](../reference/routing-and-hosting.md).

## Libs

Libs hold the logic, split **by concern**: a lib for configuration, one for the database, one for authentication, and so on.

- **Where they live:** `libs/<scope>/<name>/`.
- **How they're imported:** as `@inithium/<scope>-<name>`.
- **How they're built:** they're source libs, compiled by the app that uses them.

Every lib is listed in [Core libs](../reference/libs.md).

### Tags and boundaries

Every lib carries tags, and lint enforces the boundaries between them ([Conventions](../reference/conventions.md#tags-and-module-boundaries)):

- **`scope:`** says which app may use it. Frontend libs never import `api` code and vice versa; `shared` is usable by all.
- **`type:`** sets the layering: `feature` → `data-access` / `ui` → `util`.
- **`origin:`** separates core from plugin and client code. Core libs never import plugin or client libs.
- **`ui:`** orders the UI library's layers: theme → components → composites → layouts ([0038](../decisions/0038-split-the-ui-library-into-four-libs-with-layer-tags.md)).

### Shared contracts

Every data shape shared between apps is a **Zod schema** in `@inithium/shared-contracts`, with its TypeScript type inferred from it ([0008](../decisions/0008-use-zod-as-the-contract-source-of-truth.md)). The same schema validates API requests and frontend forms. The UI library's prop schemas live there too, so the API and plugins can validate stored page sections without React ([0035](../decisions/0035-define-style-props-as-serializable-zod-schemas.md), [0039](../decisions/0039-keep-style-prop-schemas-in-shared-contracts.md)).

## The UI library

Every screen is built from one shared UI library: theme → components → composites → layouts, styled only through typed props. See [UI library](../ui-library/index.md).
