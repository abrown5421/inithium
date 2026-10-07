---
title: Core libs
description: The libs core ships, what each owns, and how to create a new one.
scope: core
tags: [nx, libs]
order: 3
decisions: ["0007", "0009", "0010"]
---

# Core libs

Apps are thin orchestrators. Business logic lives in libs, one lib per concern. Core libs live in `core/libs/<scope>/<name>/` with the alias `@inithium/<scope>-<name>`. Next to them are `libs/plugins/` (installed plugins) and `libs/client/` (client-only code, never used by core).

## Current libs

| Lib | Path | Tags | Exports |
| --- | --- | --- | --- |
| `@inithium/api-config` | `libs/api/config` | `scope:api`, `type:util`, `origin:core` | `loadEnv()`, `envSchema`, `Env` |
| `@inithium/api-database` | `libs/api/database` | `scope:api`, `type:data-access`, `origin:core` | `connectDatabase(uri)`, `disconnectDatabase()` |

### `@inithium/api-config`

The only code that reads `process.env`. `loadEnv()` validates the environment once against `envSchema`, caches the result and returns it typed as `Env`. It throws a readable error listing every invalid variable. See [Environment variables](environment-variables.md).

### `@inithium/api-database`

Owns the Mongoose connection.

- `connectDatabase(uri)` connects with a 10-second server-selection timeout and logs the database name, never the URI. Error and disconnect listeners are attached only after the first connection succeeds, so a failed startup reports a single error.
- `disconnectDatabase()` removes the disconnect listener and closes the connection.

The api calls `connectDatabase` before it listens and `disconnectDatabase` on SIGTERM or SIGINT.

## Creating a lib

Libs are non-buildable source libs; the consuming app compiles them. From `core/`:

```sh
npx nx g @nx/node:library --directory=libs/<scope>/<name> --name=<scope>-<name> \
  --importPath=@inithium/<scope>-<name> --tags=scope:<scope>,type:<type>,origin:core \
  --buildable=false --unitTestRunner=none --linter=eslint --strict --useProjectJson --no-interactive
```

Use `@nx/react:library` for React libs. Then:

1. Delete the generated placeholder file and README.
2. Check the lib has an `eslint.config.mjs` that spreads the root config.
3. Add the lib to the table above.

Tags and the boundary rules they enforce are listed in [Conventions](conventions.md#tags-and-module-boundaries).
