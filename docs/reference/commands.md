---
title: Commands
description: Commands for running, verifying and building core, plus known environment workarounds.
scope: core
tags: [nx, commands, tooling]
order: 5
decisions: ["0013", "0014"]
---

# Commands

Run Nx from inside `core/`.

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies. `core/.npmrc` sets `legacy-peer-deps=true`. |
| `npx nx run-many -t lint typecheck build` | Verify everything. The api's esbuild build also type-checks. |
| `npx nx serve api` | API at `http://localhost:3000/api`, loading `core/.env` |
| `npx nx serve web` | End-user site at `http://localhost:5173/` |
| `npx nx serve cms` | Client portal at `http://localhost:5174/cms/` |

Production-style run, with the api serving everything on port 3000:

```sh
npx nx run-many -t build && node --env-file=.env dist/apps/api/main.js
```

Check the documentation library (from `docs/`):

```sh
npm install
npm run check
```

## After running a generator

Nx 23 generators produce some outdated output. After generating a project:

- Strip `nxViteTsPaths` and `nxCopyAssetsPlugin` from any Vite config. Path aliases resolve through `resolve.tsconfigPaths: true`; don't add `vite-tsconfig-paths`.
- Delete generated placeholder files and READMEs.
- Add an `eslint.config.mjs` that spreads the root config. React projects also add `nx.configs['flat/react']`.
- For new React apps or libs, wire in Tailwind v4 with `@tailwindcss/vite`; the generator no longer does it.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Nx can't find the workspace when run from VS Code | Nx Console sets `NX_WORKSPACE_ROOT_PATH` to the repo root. In Git Bash, from `core/`: `export NX_WORKSPACE_ROOT_PATH="$(pwd -W)"` |
| The Nx daemon misbehaves | Run with `NX_DAEMON=false` |
| `querySrv ECONNREFUSED` at startup | Use a standard `mongodb://` connection string locally. See [Environment variables](environment-variables.md#connection-strings). |
| Vite exits because a port is in use | Ports are fixed with `strictPort`. Stop whatever is using 5173 or 5174. |
