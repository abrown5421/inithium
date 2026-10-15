---
id: "0104"
title: Separate development, showcase, staging and production environments
status: accepted
date: "2026-10-14"
scope: ecosystem
tags: [environments, hosting, clients, staging, showcase, render, mongodb]
related: ["0003", "0006", "0053", "0089", "0105", "0106", "0108", "0109", "0110"]
supersedes: ["0005"]
---

# 0104. Separate development, showcase, staging and production environments

## Context

Inithium is a client-oriented product built up over years. New plugins are added as several clients turn out to need the same thing. Four different jobs had been folded into "the sandbox" and "staging":
- building core;
- building and checking plugins;
- letting a client approve a change on their own site before it goes live;
- running the client's live site.

A fifth job came up too: showing prospective clients what Inithium and its plugins can do.

Each job has a different user, lifespan and host. Mixing them would put plugin experiments in front of clients, or client data where it doesn't belong. [0005](0005-give-each-client-their-own-infrastructure.md) already gave each client their own accounts, but with one database and one site. Clients will need to see updates before they reach their live site, so each client now also gets a staging site.

Expected scale: one client today, about 2 by the end of 2026, about 5 a year later, and perhaps 15–20 within three years. Upgrades and deploys done client by client are acceptable at that size.

## Decision

**The environments**

| Environment | Who uses it | What runs | Where |
| --- | --- | --- | --- |
| **Core development** | The Inithium developer | `core/`, no plugins | Locally (ports 3000, 5173, 5174, 5175) |
| **Sandbox** | The Inithium developer | A generated copy of core, with plugins installed, activated and ejected one at a time ([0106](0106-run-the-sandbox-as-a-local-generated-workspace-beside-core.md)) | Locally only, on its own ports, alongside core |
| **Showcase** | Prospective clients | Core plus plugins, with demo content: Inithium's marketing site | Inithium's Render account at `inithium.onrender.com`, with its own database on Inithium's shared Atlas cluster |
| **Client staging** | The client, their owners, admins and editors; never their end users | The client's site plus the change awaiting approval | The client's own Render account |
| **Client production** | The client's visitors and staff | The client's live site | The client's own Render account, on the client's domain |

The sandbox is never hosted. It's a development tool for checking that plugins install, activate, deactivate and eject cleanly beside core.

**Accounts (replaces the table in [0005](0005-give-each-client-their-own-infrastructure.md))**

| | Inithium: core, sandbox, showcase, plugins, personal projects | Each client |
| --- | --- | --- |
| GitHub | Personal account | The client's own account and repo |
| MongoDB | One shared Atlas cluster, one database per project or environment (e.g. the sandbox's, the showcase's) | The client's own Atlas account and cluster, with **two databases**: production and staging |
| Render | Personal account: the showcase (and a showcase staging service if wanted) | The client's own account, signed in with their GitHub: **two web services**, production and staging |
| Cloudflare R2 (if needed) | Personal account | The client's own account |

- **One environment, one service.** Each environment that's hosted runs as one Render web service serving `api`, `web` and `cms` from one origin ([0006](0006-serve-each-client-from-one-origin.md)).
- **The docs app is never deployed.** That holds for clients, staging and the showcase ([0053](0053-view-the-manual-in-a-docs-app.md)).
- **Switching an environment's database or cluster** is only ever a change to `MONGODB_URI`. Nothing in code is tied to a cluster or account.

**Staging**
- **Every client gets one,** set up when the client is first provisioned. Inithium never pays for client staging: it lives on the client's accounts.
- **The workflow:**
  1. The client's first site is built and reviewed on staging.
  2. When the client approves, the site goes live on their domain.
  3. Later changes are deployed to staging first. The client reviews them there, and production stays untouched until the client gives the final OK.
  4. The change then moves to production.
- **The client keeps both addresses** and uses staging to review every new request.
- **Not yet decided:** the staging mechanics (one repo or two, how changes move to production, staging data, access and isolation). They're in [0108](0108-client-staging-workflow-and-data.md), and staging tooling will be built later.

**Showcase**
- `inithium.onrender.com` becomes the showcase: Inithium's primary marketing tool, where prospects click around a site with plugins installed.
- What gets copied to clients is core, rebranded per client through settings.
- The showcase's content and access are still open ([0110](0110-showcase-content-and-access.md)).

## Alternatives considered

- **One Inithium deployment hosting production, staging and the sandbox:** not possible. One Render service runs one copy of the app with one database and one set of plugins. Each environment is its own service.
- **A hosted sandbox:** rejected. The sandbox's install and eject loop needs the CLI and a rebuild after every step, which on Render would mean slow redeploys that use up free instance hours. It stays a local tool.
- **Client staging on Inithium's Render account:** rejected. Inithium won't pay for every client's staging site, and it would break the rule that a client's usage stays on the client's accounts.
- **No staging, deploying straight to production:** rejected. Clients need to see updates in the browser before they reach their live site.

## Consequences

- **Provisioning a client** creates two Render services and two databases on one cluster.
- **Free tiers, as reported in October 2026 (check before relying on them):**
  - Render gives each workspace 750 free instance hours a month, and free services sleep after 15 minutes idle and take about a minute to wake. Two free services fit only because they sleep.
  - The Atlas free cluster (commonly reported as about 512 MB) has no backups, and its storage is shared by production and staging.
  - Whether clients need paid tiers is open in [0109](0109-client-hosting-plans-and-backups.md).
- **The showcase** needs demo content, and possibly demo accounts and a reset ([0110](0110-showcase-content-and-access.md)).
- **Pages that cite [0005](0005-give-each-client-their-own-infrastructure.md)'s account table** now cite this record.
