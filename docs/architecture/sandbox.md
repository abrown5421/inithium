---
title: The sandbox
description: The local development environment for plugins, a generated copy of core run beside it, and what the sandbox tooling does today.
scope: ecosystem
tags: [architecture, sandbox, plugins, testing]
order: 5
decisions: ["0106", "0104", "0105", "0107", "0002", "0019", "0103"]
---

# The sandbox

The sandbox is the **local development environment for plugins**. It's a full copy of core's apps (`api`, `web`, `cms` and `docs`), with plugins installed, activated, deactivated, ejected and reinstalled one at a time, so you can watch each step in the browser ([0106](../decisions/0106-run-the-sandbox-as-a-local-generated-workspace-beside-core.md)). Core itself never contains plugin code.

> **Status:** decided, not built yet. The scripts in `sandbox/` today predate this design (see [The tooling today](#the-tooling-today)).

## How it works

- **Generated, never maintained.**
  - Workspaces are generated from `core/` + `plugins/` into `sandbox/workspaces/<name>/`, which git ignores. `sandbox/` holds only the tooling.
  - A workspace can be kept between sessions and regenerated whenever core moves on. Nobody maintains a sandbox copy by hand, so it can't drift from core.
- **Local only.** It's never hosted; the hosted marketing site is the showcase ([Environments](environments.md)).
- **Driven by the CLI, checked in the browser.**
  - Plugins go in and out through the same install tool clients use ([Plugin lifecycle](../plugins/plugin-lifecycle.md)).
  - Activation can also be toggled on the sandbox's CMS Plugins screen, as a client would.
- **Beside core.** The sandbox runs on its own ports, so core (3000, 5173, 5174, 5175) and the sandbox can run at the same time for comparison. Its frontends' `/api` proxy points at the sandbox's own api.
- **Its own database** on Inithium's shared Atlas cluster, so its data survives between sessions and never mixes with core development's.
- **Plugin manuals.** The sandbox's docs app shows the core manual plus each installed plugin's manual (`plugins/plugin-<name>/docs/`). Plugin manuals never reach client repos.
- **Editing a plugin.** Plugins are edited in `plugins/`, never inside the workspace, because the sandbox receives copies exactly as clients do. A `sync`/`watch` command to re-copy changes while you work is suggested ([0107](../decisions/0107-plugin-lifecycle-mechanics.md)).

## What the rebuilt tooling needs

- Generate and regenerate workspaces, each with its own ports and database.
- Install plugins as libs under `libs/plugins/<name>/` (api, web, cms and contracts layers), and register them in each app's registry.
- Support every lifecycle verb: install, activate, deactivate, and eject in two steps (unseed, then remove the code).
- Load plugins' demo data when asked.
- Re-copy a plugin's changed source while you work on it.
- Show installed plugins' manuals in the docs app.
- **Run the lifecycle check**, each plugin's acceptance gate: install, build, seed, seed again, unseed, eject, then type-check and build again exactly as before the install. Each plugin's tests run here too, since they aren't installed into client repos ([Testing plugins](../plugins/testing-plugins.md), [0103](../decisions/0103-test-with-vitest-and-a-plugin-contract-kit.md)).
- Generate the showcase the same way, and push it to the repo Render deploys ([0110](../decisions/0110-showcase-content-and-access.md)).

**Still open:**
- the exact ports and database name;
- how seeds run against a running site, and seed tracking ([0107](../decisions/0107-plugin-lifecycle-mechanics.md), [0019](../decisions/0019-seed-tracking.md));
- where the tool lives ([0018](../decisions/0018-install-eject-tooling-for-client-repos.md)).

## The tooling today

The current scripts predate the plugin design and will be rebuilt before the first plugin. They need no dependencies; run them from `sandbox/` (Node 22+):

```bash
cd sandbox

# Copy core into sandbox/workspaces/demo (--install runs npm install, --force replaces an existing copy)
npm run clone -- demo --install

# Copy plugins into it ("plugin-" prefix optional)
npm run inject -- demo blog gallery
```

- `clone` copies `core/` without `node_modules`, `dist`, `tmp`, `out-tsc` or `.nx`.
- `inject` still copies a plugin's `api/` and `web/` folders into the apps (`apps/*/src/plugins/`). That's the old model: plugins now install as libs and register through slots ([0002](../decisions/0002-install-plugins-as-nx-libs-via-registries.md)).
