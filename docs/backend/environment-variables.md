---
title: Environment variables
description: Every environment variable the api reads, its default and how it's validated.
scope: core
tags: [environment, config, mongodb, auth]
order: 2
decisions: ["0009", "0010", "0005", "0020", "0023"]
---

# Environment variables

Only `@inithium/api-config` reads `process.env`. Everything else calls `loadEnv()`, which validates the environment once against `envSchema` and returns a typed `Env`. If validation fails, the api exits at startup with a list of the problems.

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | | Must start with `mongodb://` or `mongodb+srv://` and include a database name: `.../<database>?...`. |
| `HOST` | No | `localhost` | Interface the api listens on. Set `0.0.0.0` on Render. |
| `PORT` | No | `3000` | Coerced to a positive integer. Render provides it. |
| `NODE_ENV` | No | `development` | `development`, `production` or `test`. Set `production` on Render: auth cookies are only marked `Secure` in production. |
| `JWT_ACCESS_SECRET` | Yes | | Signs access tokens. At least 32 characters; use a different value for every client. |
| `JWT_ACCESS_TTL_MINUTES` | No | `15` | Access token and cookie lifetime. |
| `JWT_REFRESH_TTL_DAYS` | No | `30` | Refresh token and cookie lifetime. |
| `SEED_DEV_EMAIL` | Yes | | Email of the dev account created on startup when no dev user exists. Trimmed and lowercased. |
| `SEED_DEV_PASSWORD` | Yes | | That account's temporary password. Use a different one for every client. |

`NODE_VERSION=22` is also set on Render, but only to select the Node runtime; the app doesn't read it.

Generate a `JWT_ACCESS_SECRET` with:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Where values come from

| Context | Source |
| --- | --- |
| `npx nx serve api` | `core/.env`, loaded automatically by Nx |
| `node dist/apps/api/main.js` | Pass `--env-file=.env` |
| Render | The service's Environment settings |

`core/.env` is git-ignored. `core/.env.example` is committed and is the template for every `.env` and every set of Render env vars.

## Adding a variable

1. Add it to `envSchema` in `core/libs/api/config/src/lib/env.schema.ts`.
2. Add it, with a comment, to `core/.env.example`.
3. Read it from `loadEnv()`, never from `process.env`.
4. Add a row to the table above.

## Connection strings

`mongodb+srv://` strings need an SRV DNS lookup. On Windows with a VPN, Node's resolver can fail with `querySrv ECONNREFUSED`. Use Atlas's standard connection string locally instead, which connects to the same cluster:

```
mongodb://host1,host2,host3/<database>?tls=true&replicaSet=…&authSource=admin
```
