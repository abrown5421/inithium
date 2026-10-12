---
id: "0089"
title: Build on Render with dev dependencies, only the client-facing apps, and a health check
status: accepted
date: "2026-10-12"
scope: core
tags: [deployment, render, hosting]
related: ["0006", "0053"]
supersedes: []
---

# 0089. Build on Render with dev dependencies, only the client-facing apps, and a health check

## Context

Each client deploys as one Render web service serving the API and both frontends ([0006](0006-serve-each-client-from-one-origin.md)). The planned settings had never been tried. Running them in a fresh clone showed two problems:

- With `NODE_ENV=production` set as the plan requires, `npm ci` skips devDependencies, which include Nx, Vite and every build tool, so `npx nx` isn't installed and the build fails.
- `nx run-many -t build` also builds the docs app ([0053](0053-view-the-manual-in-a-docs-app.md)), which a deploy never serves and which reads the manual from outside `core/`, so it fails in client repos.

## Decision

- **Build command:** `npm ci --include=dev && npx nx run-many -t build --projects=api,web,cms`.
- **Health check:** `GET /api/health` answers `200 { status: 'ok', database: 'connected' }` while the database is connected and `503` otherwise; Render's health check path is `/api/health`.
- **The rest of the plan stands:** root directory `core`; start command `node dist/apps/api/main.js`; environment `MONGODB_URI`, `HOST=0.0.0.0`, `NODE_VERSION=22`, `NODE_ENV=production`, `JWT_ACCESS_SECRET`, `SEED_DEV_EMAIL`, `SEED_DEV_PASSWORD` (Render provides `PORT`).
- The settings, verified locally in a fresh clone and a production-mode run, are kept in the manual's "Deploying to Render" guide.

## Alternatives considered

- **Moving build tools to dependencies:** a larger, riskier change to the workspace than one flag.
- **A `render.yaml` blueprint:** not decided; the service is set up in the dashboard for now.

## Consequences

- Still to confirm on the first real deploy: Express `trust proxy = 1` against Render's proxy, and the build's memory use on Render's plan.
