---
title: Core libs
description: The libs core ships, what each owns, and how to create a new one.
scope: core
tags: [nx, libs]
order: 3
decisions: ["0007", "0009", "0010", "0020", "0022"]
---

# Core libs

Apps are thin orchestrators. Business logic lives in libs, one lib per concern. Core libs live in `core/libs/<scope>/<name>/` with the alias `@inithium/<scope>-<name>`. Next to them are `libs/plugins/` (installed plugins) and `libs/client/` (client-only code, never used by core).

## Current libs

| Lib | Path | Tags | Exports |
| --- | --- | --- | --- |
| `@inithium/api-config` | `libs/api/config` | `scope:api`, `type:util`, `origin:core` | `loadEnv()`, `envSchema`, `Env` |
| `@inithium/api-database` | `libs/api/database` | `scope:api`, `type:data-access`, `origin:core` | `connectDatabase(uri)`, `disconnectDatabase()` |
| `@inithium/api-users` | `libs/api/users` | `scope:api`, `type:data-access`, `origin:core` | `UserModel`, `toUser()`, user queries, `createUser()` |
| `@inithium/api-auth` | `libs/api/auth` | `scope:api`, `type:feature`, `origin:core` | `authRouter`, `requireAuth`, `requirePermission()`, `getAuth()`, `seedDevUser()` |
| `@inithium/shared-contracts` | `libs/shared/contracts` | `scope:shared`, `type:util`, `origin:core` | Zod schemas and inferred types: users, roles, auth, permissions, theme, UI style props, animation |
| `@inithium/shared-ui-theme` | `libs/shared/ui-theme` | `scope:shared`, `type:ui`, `origin:core`, `ui:theme` | `defaultTheme`, scale generation, `ThemeStyles`, theme fonts CSS |
| `@inithium/shared-ui-components` | `libs/shared/ui-components` | `scope:shared`, `type:ui`, `origin:core`, `ui:component` | `Button`, `Checkbox`, `Container`, `Divider`, `Icon`, `Input`, `InputAdornment`, `Loader`, `RadioGroup`, `Select`, `Slider`, `Switch`, `Text`, `UiProvider`, `useAnimation` |
| `@inithium/shared-permissions` | `libs/shared/permissions` | `scope:shared`, `type:util`, `origin:core` | `rolePermissions`, `hasPermission()` |
| `@inithium/shared-data-access` | `libs/shared/data-access` | `scope:shared`, `type:data-access`, `origin:core` | `baseApi`, auth hooks, `createAppStore()`, `getApiErrorMessage()` |
| `@inithium/cms-auth` | `libs/cms/auth` | `scope:cms`, `type:feature`, `origin:core` | `LoginPage`, `CmsAccessGuard`, `CurrentUserMenu` |

### `@inithium/api-config`

The only code that reads `process.env`. `loadEnv()` validates the environment once against `envSchema`, caches the result and returns it typed as `Env`. It throws a readable error listing every invalid variable. See [Environment variables](../backend/environment-variables.md).

### `@inithium/api-database`

Owns the Mongoose connection.

- `connectDatabase(uri)` connects with a 10-second server-selection timeout and logs the database name, never the URI. Error and disconnect listeners are attached only after the first connection succeeds, so a failed startup reports a single error.
- `disconnectDatabase()` removes the disconnect listener and closes the connection.

The api calls `connectDatabase` before it listens and `disconnectDatabase` on SIGTERM or SIGINT.

### `@inithium/api-users`

The `users` collection. `UserModel` stores `email` (unique, lowercased), `passwordHash` (excluded from queries unless selected with `+passwordHash`), `role` (default `user`) and `passwordChangeRequired`, with timestamps. `toUser()` maps a stored user to the API's `User` shape. Also exports `findUserById()`, `findUserByEmailWithPassword()`, `userExistsWithEmail()`, `userExistsWithRole()` and `createUser()`.

### `@inithium/api-auth`

Authentication for the API: the `/api/auth` routes, the `requireAuth` / `requirePermission()` middleware, `getAuth()` for reading the signed-in user inside a protected route, and `seedDevUser()`, which the api calls after connecting. Internally it owns password hashing (`scrypt`), access tokens, the `refreshtokens` collection and the auth cookies. See [Authentication](../backend/authentication.md).

### `@inithium/shared-contracts`

The Zod schemas shared by the api and both frontends, with inferred types: `roles` / `roleSchema` / `Role`, `userSchema` / `User`, `loginRequestSchema` / `LoginRequest`, `authResponseSchema` / `AuthResponse`, and `permissions` / `permissionSchema` / `Permission`.

### `@inithium/shared-ui-theme` and `@inithium/shared-ui-components`

The first two layers of the UI library. See the [UI library](../ui-library/index.md) section, with a page per component.

### `@inithium/shared-permissions`

The permission matrix (`rolePermissions`) and `hasPermission(role, permission)`. `dev` holds every permission.

### `@inithium/shared-data-access`

The frontends' RTK Query layer. `baseApi` calls `/api` and, on a `401`, refreshes the session once and retries. Features add endpoints with `baseApi.injectEndpoints()`. Also exports the auth endpoints (`useGetCurrentUserQuery`, `useLoginMutation`, `useLogoutMutation`), `createAppStore()` for an app's root `<Provider>`, and `getApiErrorMessage()`.

### `@inithium/cms-auth`

CMS sign-in: `LoginPage` (route `/login`), `CmsAccessGuard` (wrap any route that needs CMS access) and `CurrentUserMenu` (the user's email, role and a sign-out button).

## Creating a lib

Libs are non-buildable source libs; the consuming app compiles them. From `core/`:

```sh
npx nx g @nx/node:library --directory=libs/<scope>/<name> --name=<scope>-<name> \
  --importPath=@inithium/<scope>-<name> --tags=scope:<scope>,type:<type>,origin:core \
  --buildable=false --unitTestRunner=none --linter=eslint --strict --useProjectJson --no-interactive
```

For React libs, use `@nx/react:library` with `--bundler=none --style=none --component=false` instead of `--buildable=false --strict`. Then:

1. Delete the generated placeholder file and README, and a React lib's `.babelrc` (unused, because Vite compiles the lib as part of the app).
2. Check the lib has an `eslint.config.mjs` that spreads the root config.
   - Tailwind classes in libs are picked up because each app's `styles.css` contains `@source "../../../libs";`. Without that line, Tailwind only scans the app's own folder.
3. Add the lib to the table above.

Tags and the boundary rules they enforce are listed in [Conventions](conventions.md#tags-and-module-boundaries).
