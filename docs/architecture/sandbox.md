---
title: The sandbox
description: Testing plugins in a regenerated copy of core, and what the sandbox tooling does today.
scope: ecosystem
tags: [architecture, sandbox, plugins, testing]
order: 4
decisions: ["0002", "0003", "0019"]
---

# The sandbox

The sandbox is a copy of core with **every plugin installed**, used to test plugins in the browser. When working on a plugin, you run the sandbox instead of core ([0003](../decisions/0003-regenerate-the-sandbox-on-demand.md)).

- **It's regenerated, never committed.** `sandbox/` holds tooling only; generated workspaces go in `sandbox/workspaces/`, which git ignores. Because it's always rebuilt from `core/` and `plugins/`, it can't drift from core.
- **The goal:** add and eject plugins one at a time, so that each plugin's installation, seeding, unseeding and ejection can be verified on its own.

## The tooling today

The current scripts predate the plugin design and will be rebuilt before the first plugin. They need no dependencies; run them from `sandbox/` (Node 22+):

```bash
cd sandbox

# Copy core into sandbox/workspaces/demo (--install runs npm install, --force replaces an existing copy)
npm run clone -- demo --install

# Copy plugins into it ("plugin-" prefix optional)
npm run inject -- demo blog gallery
```

`clone` copies `core/` without `node_modules`, `dist`, `tmp`, `out-tsc` or `.nx`. `inject` still copies a plugin's `api/` and `web/` folders into the apps (`apps/*/src/plugins/`). That's the old model: plugins now install as libs and register through slots ([0002](../decisions/0002-install-plugins-as-nx-libs-via-registries.md)).

## What the rebuilt tooling needs

- Install plugins as libs under `libs/plugins/<name>/` (api, web, cms and contracts layers).
- Register them in each app's slot registry, and unregister them on eject.
- Run each plugin's seed on install and its unseed on eject. How unseed identifies what its seed created is still open ([0019](../decisions/0019-seed-tracking.md)).
- Add and eject single plugins, and regenerate with every plugin installed.
- Keep `apps/docs`: unlike client clones, the sandbox is for development.
