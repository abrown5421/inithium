---
id: "0006"
title: Serve the API and both frontends from one origin
status: accepted
date: "2026-10-07"
scope: core
tags: [hosting, routing, render]
related: ["0005"]
supersedes: []
---

# 0006. Serve the API and both frontends from one origin

## Context

Each client has three apps: `api`, `web` and `cms`. Hosting them separately puts them on different origins, which brings CORS configuration and cross-site cookie problems. On Render, separate `*.onrender.com` subdomains count as separate sites.

## Decision

Each client deploys as a single Render web service. The `api` process serves the API under `/api`, the built `cms` at `/cms` and the built `web` at `/`, with SPA fallbacks for both frontends. Frontends call the API with relative `/api/...` URLs; in development, both Vite dev servers proxy `/api` to the API. See [Routing and hosting](../reference/routing-and-hosting.md).

## Alternatives considered

- **A separate service per app**: rejected because of CORS and cross-site concerns.

## Consequences

- No CORS setup is needed, and auth cookies are first-party.
- Unknown `/api/*` paths must return a JSON 404, never the SPA.
- The api must be started from `core/` so it can find `dist/apps`.
- Dev ports are fixed with `strictPort` so the two Vite servers can't collide.
