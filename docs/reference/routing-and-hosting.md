---
title: Routing and hosting
description: How api, web and cms share one origin in production and in development.
scope: core
tags: [hosting, routing, render, vite]
order: 2
decisions: ["0006", "0005"]
---

# Routing and hosting

Each client deploys as one Render web service. The `api` process serves the API and both built frontends from a single domain.

| App | Path | Dev port |
| --- | --- | --- |
| `web` | `/` | 5173 |
| `cms` | `/cms` | 5174 |
| `api` | `/api` | 3000 |

## API routes

- Every API route is mounted under `/api`.
- Unknown `/api/*` paths return a JSON 404 (`{ "message": "Not found" }`), never the SPA.

## Frontends

- Call the API with relative `/api/...` URLs. Never hardcode a host.
- In development, both Vite dev servers proxy `/api` to `http://localhost:3000`, so the same code works locally and in production.
- `cms` is built with Vite `base: '/cms/'`, and its router `basename` comes from `import.meta.env.BASE_URL`. To change the base path, change it only in `apps/cms/vite.config.mts`.
- Dev and preview ports use `strictPort`. If a port is taken, Vite fails rather than moving to another port.

## Production

In production the api serves `dist/apps/cms` at `/cms` and `dist/apps/web` at `/`, each with an SPA fallback to its `index.html`. It resolves `dist/apps` from the working directory, so start it from `core/`:

```sh
node dist/apps/api/main.js
```

A frontend that hasn't been built is skipped, and only the API is served.

## Render service settings

Not yet verified on a first deploy.

| Setting | Value |
| --- | --- |
| Root directory | `core` |
| Build command | `npm ci && npx nx run-many -t build` |
| Start command | `node dist/apps/api/main.js` |
| Environment | `MONGODB_URI`, `HOST=0.0.0.0`, `NODE_VERSION=22`, `NODE_ENV=production`, `JWT_ACCESS_SECRET`, `SEED_DEV_EMAIL`, `SEED_DEV_PASSWORD` (Render provides `PORT`) |

The api sets Express `trust proxy` to `1`, assuming Render puts one proxy in front of it, so that `req.ip` (used by login rate limiting) is the client's address. Confirm this on the first deploy.
