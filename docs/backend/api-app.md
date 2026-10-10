---
title: The api app
description: How the api starts, how its routes are organised, how errors are returned and how it serves the frontends.
scope: core
tags: [api, express, backend]
order: 1
decisions: ["0006", "0007", "0010", "0023"]
---

# The api app

`core/apps/api` is an Express server. It's the only thing that talks to MongoDB, and in production it also serves both built frontends from the same origin ([0006](../decisions/0006-serve-each-client-from-one-origin.md)). Like every app, it's thin: routes, models and logic live in libs, and `main.ts` wires them together ([0007](../decisions/0007-keep-apps-thin-and-logic-in-libs.md)).

## Startup

On start, `main.ts`:

1. Validates the environment with `loadEnv()`. Invalid or missing variables stop the process with a list of problems ([Environment variables](environment-variables.md)).
2. Connects to MongoDB **before** listening, and exits if it can't ([0010](../decisions/0010-connect-to-the-database-before-listening.md), [Database](database.md)).
3. Creates the dev account if no dev user exists ([0023](../decisions/0023-seed-the-dev-account-on-startup.md), [Authentication](authentication.md#the-dev-account)), then the default [site settings](site-settings.md#seeding) and core's [pages](pages.md#seeding) if they're missing.
4. Listens on `HOST`:`PORT` and logs `[ ready ] http://<host>:<port>`.

On `SIGTERM` or `SIGINT` (e.g. Render redeploying, or Ctrl+C), it stops accepting connections, disconnects from MongoDB and exits.

```
[ db ] connected to "inithium"
[ seed ] created dev user dev@example.com     (first start only)
[ ready ] http://localhost:3000
```

## Routes

Every API route is under `/api`, on one router:

| Path | Provided by |
| --- | --- |
| `GET /api` | A health response, `{ "message": "Hello API" }` |
| `/api/auth/*` | `authRouter` from `@inithium/api-auth`. See [Authentication](authentication.md). |
| `/api/site` | `siteRouter` from `@inithium/api-pages`: the site bundle `web` loads. See [Pages](pages.md). |
| `/api/pages/*` | `pagesRouter` from `@inithium/api-pages`. See [Pages](pages.md). |
| `/api/settings` | `settingsRouter` from `@inithium/api-settings`. See [Site settings](site-settings.md). |
| any other `/api/*` | `404 { "message": "Not found" }`, always JSON, never a page |

The router parses JSON bodies (`express.json()`) and cookies (`cookie-parser`). Express is configured with `trust proxy = 1`, so `req.ip` is the client's address behind Render's proxy (still to be confirmed on the first deploy).

### Adding routes

Routes belong in a lib, not in the app. A feature lib exports an Express `Router`, and `main.ts` mounts it:

```ts
// libs/api/<feature>/src/lib/<feature>.routes.ts
export const settingsRouter = Router();
settingsRouter.get('/', requireAuth, async (_req, res) => { … });
settingsRouter.put('/', ...requirePermission('cms.access'), async (req, res) => { … });

// apps/api/src/main.ts
api.use('/settings', settingsRouter);
```

Protect routes with `requireAuth` and `requirePermission()` from `@inithium/api-auth`, and validate request bodies with the Zod schemas in `@inithium/shared-contracts`.

## Errors

Errors thrown or rejected in a handler reach one error handler for `/api`, so async route handlers don't need their own `try`/`catch`:

| Error | Response |
| --- | --- |
| Has a `status` below 500 (e.g. malformed JSON → 400) | That status with `{ "message": <the error's message> }` |
| Anything else | `500 { "message": "Something went wrong" }`, with the error logged as `[ error ]` |

## Serving the frontends

If the frontends have been built, the api serves them:
- `dist/apps/cms` at `/cms`;
- `dist/apps/web` at `/`.

Each has an SPA fallback, so a deep link like `/cms/settings` reloads correctly. A frontend that hasn't been built is skipped. The api finds `dist/apps` from its working directory, so it must be started from `core/`:

```bash
cd core
npx nx run-many -t build && node --env-file=.env dist/apps/api/main.js
```

See [Routing and hosting](../reference/routing-and-hosting.md).
