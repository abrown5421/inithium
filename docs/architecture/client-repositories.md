---
title: Client repositories
description: How a client app is created, kept up to date with core, customised and hosted on the client's own accounts.
scope: ecosystem
tags: [architecture, clients, provisioning, render, mongodb]
order: 4
decisions: ["0004", "0104", "0105", "0108", "0109", "0017", "0018", "0053"]
---

# Client repositories

A client app is a clone of core, plus only the plugins that client uses.

## Who owns what

Every client owns their own infrastructure. Their usage, and any paid upgrades they need, never land on the Inithium accounts ([0104](../decisions/0104-separate-development-showcase-staging-and-production-environments.md)). Each client has a **production** site on their domain and a **staging** site where they approve changes first ([Environments](environments.md)).

| | Inithium: core, sandbox, showcase, plugins, personal projects | Each client |
| --- | --- | --- |
| GitHub | The Inithium owner's account | The client's own GitHub account and repo |
| MongoDB | One shared Atlas cluster, with a separate database per project or environment | The client's own Atlas account and cluster, with two databases: production and staging |
| Render | The Inithium owner's account: the showcase | The client's own Render account, signed in with their GitHub: two web services, production and staging |
| Cloudflare R2 (if needed) | The Inithium owner's account | The client's own account |

Moving an app to a different database or cluster is only ever a change to `MONGODB_URI`; nothing in code is tied to a cluster.

## Provisioning a client

1. Clone core, install the client's plugins, and push one initial commit to a new repo on the client's GitHub.
2. Create the client's Atlas account and cluster, with a production database and a staging database.
3. Create the client's Render account through their GitHub, deploy the repo, and set the environment variables.

The staging service is planned but not built into this process yet. How its repo, branches and data work is open ([0108](../decisions/0108-client-staging-workflow-and-data.md)), and so are which paid tiers and backups production needs ([0109](../decisions/0109-client-hosting-plans-and-backups.md)).

The Render web service settings, step by step, are in [Deploying to Render](../getting-started/deploying-to-render.md) ([0089](../decisions/0089-build-for-render-with-dev-dependencies-and-a-health-check.md)):

| Setting | Value |
| --- | --- |
| Root directory | `core` |
| Build command | `npm ci --include=dev && npx nx run-many -t build --projects=api,web,cms` |
| Start command | `node dist/apps/api/main.js` |
| Health check path | `/api/health` |
| Environment | `MONGODB_URI`, `HOST=0.0.0.0`, `NODE_VERSION=22`, `NODE_ENV=production`, `JWT_ACCESS_SECRET` and `SEED_DEV_PASSWORD` (both unique per client), `SEED_DEV_EMAIL`. Render provides `PORT`. |

See [Environment variables](../backend/environment-variables.md) and [Routing and hosting](../reference/routing-and-hosting.md).

## Keeping clients up to date

Core improvements reach clients through **git upstream merges**: each client repo keeps Inithium core as an upstream remote and merges updates ([0004](../decisions/0004-deliver-core-changes-via-upstream-merges.md)).

How upstream merges bring in core *only*, without plugin source or the docs, is still open ([0017](../decisions/0017-upstream-mechanism.md)), and so is the tooling that installs plugins into a real client repo ([0018](../decisions/0018-install-eject-tooling-for-client-repos.md)). Both must also leave out `core/apps/docs` ([0053](../decisions/0053-view-the-manual-in-a-docs-app.md)). Installing a plugin also leaves out its `*.spec.ts(x)` files. Core's own tests and test kits do reach clients, and `libs/client/` code tests itself against those kits ([0103](../decisions/0103-test-with-vitest-and-a-plugin-contract-kit.md)).

## Customising a client

To keep upstream merges clean, **client repos don't edit core files.** Client-specific work goes in one of three places:

| Place | For |
| --- | --- |
| **Configuration**, through the `cms` (preferred) | Anything a client can set: content, settings, theme |
| **Plugins** from the library | Optional features shared by several clients |
| **`libs/client/`** | Genuinely one-off code for this client. It uses the same slot registries and conventions as plugins, and core never puts anything here. |

If a client needs core to behave differently, change Inithium core, generalised for every client, and merge it upstream.

## Plugins in a client repo

A client repo receives copies of only the plugins it uses, installed by the same tool as the sandbox. Its manifest records its core version and each plugin's version ([Plugin lifecycle](../plugins/plugin-lifecycle.md), [0105](../decisions/0105-manage-plugins-with-one-install-tool-activation-and-versions.md)).
- **Upgrades are opt-in.** The client stays on its installed versions until it asks to upgrade, and upgrades don't arrive through upstream merges.
- **Plugin files are never edited** in the client repo, since an upgrade overwrites them. Per-client differences go in plugin settings on the CMS Plugins screen, or in `libs/client/`.
- **Owners can switch plugins off** (deactivate them) without removing their data. Ejecting removes the data first, then the code.
