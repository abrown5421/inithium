---
title: Environment variables
description: Every environment variable the api reads, its default and how it's validated.
scope: core
tags: [environment, config, mongodb]
order: 1
decisions: ["0009", "0010", "0005"]
---

# Environment variables

Only `@inithium/api-config` reads `process.env`. Everything else calls `loadEnv()`, which validates the environment once against `envSchema` and returns a typed `Env`. If validation fails, the api exits at startup with a list of the problems.

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | | Must start with `mongodb://` or `mongodb+srv://` and include a database name: `.../<database>?...`. |
| `HOST` | No | `localhost` | Interface the api listens on. Set `0.0.0.0` on Render. |
| `PORT` | No | `3000` | Coerced to a positive integer. Render provides it. |

`NODE_VERSION=22` is also set on Render, but only to select the Node runtime; the app doesn't read it.

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
