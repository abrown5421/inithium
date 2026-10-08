---
title: Repository layout
description: What lives where in the Inithium repo and inside the core workspace.
scope: ecosystem
tags: [setup, architecture]
order: 2
decisions: ["0001", "0007", "0038", "0052"]
---

# Repository layout

## The Inithium repo

```
inithium/
  core/       The clonable Nx workspace every client app starts from. Contains no plugin code.
  plugins/    Optional features, one folder per plugin, installed into a core clone on demand.
  sandbox/    Tooling that builds a throwaway copy of core with plugins installed, for testing.
  docs/       This manual and the decision records. Never copied into a client repo.
  CLAUDE.md   The rules for working in this repo.
```

Why it's split this way is covered in [Architecture](../architecture/index.md) and [0001](../decisions/0001-split-core-plugins-and-sandbox.md).

## Inside core

`core/` is a standalone Nx workspace with the package scope `@inithium`.

```
core/
  apps/
    api/        Express server: the API, and in production both built frontends
    web/        The end-user site
    cms/        The client portal, served under /cms
    docs/       This manual's viewer (development only; never reaches clients)
  libs/
    api/        Libs for the api only:  config, database, users, auth
    shared/     Libs for any app:       contracts, permissions, data-access, ui-theme, ui-components
    cms/        Libs for the cms only:  auth
    web/        Libs for web only       (none yet)
    plugins/    Installed plugins       (none yet)
    client/     A client's one-off code (never used by core)
  .env.example  The template for every environment's variables
```

- **Apps are thin.** They start up, compose libs and route to what libs provide. Business logic lives in libs, one lib per concern ([0007](../decisions/0007-keep-apps-thin-and-logic-in-libs.md)).
- **Libs live in `libs/<scope>/<name>/`** and are imported as `@inithium/<scope>-<name>`, e.g. `@inithium/api-database`. Every lib, what it owns and how to create one are listed in [Core libs](../reference/libs.md).
- **Tags control who may import what.** Lint enforces them; see [Conventions](../reference/conventions.md#tags-and-module-boundaries).

## Where to look for…

| You want to… | Look in |
| --- | --- |
| Change how the api starts, its routes or error handling | `core/apps/api/src/main.ts`; [The api app](../backend/api-app.md) |
| Add an environment variable | `core/libs/api/config`; [Environment variables](../backend/environment-variables.md) |
| Work on sign-in, roles or permissions | `core/libs/api/auth`, `core/libs/shared/permissions`; [Authentication](../backend/authentication.md) |
| Add or change a shared data shape | `core/libs/shared/contracts` |
| Call the API from a frontend | `core/libs/shared/data-access`; [Calling the API](../backend/calling-the-api.md) |
| Build or change a UI component | `core/libs/shared/ui-components`; [UI library](../ui-library/index.md) |
| Change the theme | `core/libs/shared/ui-theme`; [Theme](../ui-library/theme/index.md) |
| Add a live example to this manual | `core/apps/docs/src/examples/` |
| Write or move a manual page | `docs/`; [Working on Inithium](working-on-inithium.md#documenting-your-change) |
