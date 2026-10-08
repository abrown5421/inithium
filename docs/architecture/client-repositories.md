---
title: Client repositories
description: How a client app is created, kept up to date with core, customised and hosted on the client's own accounts.
scope: ecosystem
tags: [architecture, clients, provisioning, render, mongodb]
order: 3
decisions: ["0004", "0005", "0017", "0018", "0053"]
---

# Client repositories

A client app is a clone of core, plus only the plugins that client uses.

## Who owns what

Every client owns their own infrastructure. Their usage, and any paid upgrades they need, never land on the Inithium accounts ([0005](../decisions/0005-give-each-client-their-own-infrastructure.md)).

| | Inithium, sandbox, plugins, personal projects | Each client |
| --- | --- | --- |
| GitHub | The Inithium owner's account | The client's own GitHub account and repo |
| MongoDB | One shared Atlas cluster, with a separate database per project | The client's own Atlas account and cluster, with a single database |
| Render | The Inithium owner's account | The client's own Render account, signed in with their GitHub |

Moving an app to a different database or cluster is only ever a change to `MONGODB_URI`; nothing in code is tied to a cluster.

## Provisioning a client

1. Clone core, install the client's plugins, and push one initial commit to a new repo on the client's GitHub.
2. Create the client's Atlas account, cluster and database.
3. Create the client's Render account through their GitHub, deploy the repo, and set the environment variables.

The Render web service settings below are not yet confirmed by a first deploy:

| Setting | Value |
| --- | --- |
| Root directory | `core` |
| Build command | `npm ci && npx nx run-many -t build` |
| Start command | `node dist/apps/api/main.js` |
| Environment | `MONGODB_URI`, `HOST=0.0.0.0`, `NODE_VERSION=22`, `NODE_ENV=production`, `JWT_ACCESS_SECRET` and `SEED_DEV_PASSWORD` (both unique per client), `SEED_DEV_EMAIL`. Render provides `PORT`. |

See [Environment variables](../backend/environment-variables.md) and [Routing and hosting](../reference/routing-and-hosting.md).

## Keeping clients up to date

Core improvements reach clients through **git upstream merges**: each client repo keeps Inithium core as an upstream remote and merges updates ([0004](../decisions/0004-deliver-core-changes-via-upstream-merges.md)).

How upstream merges bring in core *only*, without plugin source or the docs, is still open ([0017](../decisions/0017-upstream-mechanism.md)), and so is the tooling that installs plugins into a real client repo ([0018](../decisions/0018-install-eject-tooling-for-client-repos.md)). Both must also leave out `core/apps/docs` ([0053](../decisions/0053-view-the-manual-in-a-docs-app.md)).

## Customising a client

To keep upstream merges clean, **client repos don't edit core files.** Client-specific work goes in one of three places:

| Place | For |
| --- | --- |
| **Configuration**, through the `cms` (preferred) | Anything a client can set: content, settings, theme |
| **Plugins** from the library | Optional features shared by several clients |
| **`libs/client/`** | Genuinely one-off code for this client. It uses the same slot registries and conventions as plugins, and core never puts anything here. |

If a client needs core to behave differently, change Inithium core, generalised for every client, and merge it upstream.
