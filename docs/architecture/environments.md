---
title: Environments
description: Where Inithium runs, from local core development and the plugin sandbox to the showcase and each client's staging and production sites, and on whose accounts.
scope: ecosystem
tags: [architecture, environments, hosting, staging, showcase, clients]
order: 2
decisions: ["0104", "0105", "0106", "0108", "0109", "0110"]
---

# Environments

Inithium runs in five kinds of environment. Each has its own user, lifespan and host ([0104](../decisions/0104-separate-development-showcase-staging-and-production-environments.md)).

> **Status:** decided, mostly not built yet. Today core development runs locally, and `inithium.onrender.com` runs core. The sandbox, showcase and client staging are planned.

| Environment | Who uses it | What runs | Where |
| --- | --- | --- | --- |
| **Core development** | The Inithium developer | `core/`, no plugins | Locally: api 3000, web 5173, cms 5174, docs 5175 |
| **Sandbox** | The Inithium developer | A generated copy of core, with plugins installed, activated and ejected one at a time | Locally only, on its own ports, alongside core ([The sandbox](sandbox.md)) |
| **Showcase** | Prospective clients | Core plus plugins, with demo content: Inithium's marketing site | `inithium.onrender.com`, on Inithium's Render account |
| **Client staging** | The client and their staff (owners, admins, editors); never their end users | The client's site plus the change awaiting approval | The client's own Render account |
| **Client production** | The client's visitors and staff | The client's live site | The client's own Render account, on the client's domain |

Two rules apply to every hosted environment:
- **One environment, one service.** Each runs as one Render web service, serving `api`, `web` and `cms` from one origin ([0006](../decisions/0006-serve-each-client-from-one-origin.md)).
- **The docs app is never deployed** anywhere ([0053](../decisions/0053-view-the-manual-in-a-docs-app.md)).

## Accounts

| | Inithium: core, sandbox, showcase, plugins | Each client |
| --- | --- | --- |
| GitHub | Inithium's personal account | The client's own account and repo |
| MongoDB | One shared Atlas cluster, one database per project or environment | The client's own Atlas account and cluster, with **two databases**: production and staging |
| Render | Inithium's personal account: the showcase | The client's own account: **two web services**, production and staging |
| Cloudflare R2 (if needed) | Inithium's personal account | The client's own account |

Inithium never pays for a client's sites, staging included. Moving an environment to another database or cluster is only ever a change to `MONGODB_URI`.

## How the environments are used

**Building a plugin.** Several salons ask for online booking, so a booking plugin is built in `plugins/plugin-booking/`. In the sandbox, the developer:
1. installs it, then activates it on the CMS Plugins screen;
2. clicks through `web` and `cms`;
3. deactivates it, then ejects it and checks nothing is left behind;
4. reinstalls it, and repeats as often as needed.

Core can run on its own ports at the same time for comparison.

**Selling it.** A prospect asks what booking looks like and is sent to the showcase, where the plugin runs with demo bookings.

**The first client takes it.** The plugin is installed into Salon A's repo and deployed to Salon A's staging site. The owner signs in there, sets up their services and tries a booking. When they approve, the change goes to production.

**A change request.** Salon A asks for a change. It's built, deployed to their staging site and reviewed there; their production site doesn't change until they approve.

**A content edit.** Salon A rewrites their About page in production's CMS. Content has its own preview (drafts and Publish), so this doesn't go through staging.

**An upgrade.** A year later the booking plugin reaches v2. Salon A stays on v1 until they ask to upgrade. The upgrade then goes through their staging site first, running the plugin's migrations ([Plugin lifecycle](../plugins/plugin-lifecycle.md)).

## Staging

Every client gets a staging site when they're first provisioned:
1. The client's first site is built and reviewed on staging.
2. When the client approves, the site goes live on their domain.
3. For every later change, the client reviews staging, and production stays untouched until they give the final OK.

The client keeps both addresses.

Still open ([0108](../decisions/0108-client-staging-workflow-and-data.md)):
- **One repo or two:** suggested is one repo with `staging` and `main` branches deploying to the two services, so moving to production is a merge.
- **Staging data:** suggested is copying staging's database to production once at launch, then refreshing staging from production before each review.
- **Access and isolation:** sign-in required, not indexed, separate secrets and storage, no email to real users.

## The showcase

`inithium.onrender.com` becomes Inithium's marketing site. It's generated from `core/` + `plugins/` by the same tooling as the sandbox, pushed to the repo Render deploys, and loaded with plugins' demo data ([0105](../decisions/0105-manage-plugins-with-one-install-tool-activation-and-versions.md)). What it shows, whether prospects get demo accounts, how it's reset and whether it gets a staging service of its own are open ([0110](../decisions/0110-showcase-content-and-access.md)).

## Free tiers

As reported in October 2026; check each provider before relying on these figures.

| Provider | Free allowance | For a client's production + staging |
| --- | --- | --- |
| Render | 750 instance hours per workspace a month; free services sleep after 15 minutes idle and take about a minute to wake | Fits only because both sleep. A sleeping production site is slow for the first visitor after a quiet spell. |
| MongoDB Atlas | One free cluster per project, commonly reported at about 512 MB; no backups | Tight: both databases share the space. With uploads in `database` storage mode (250 MB quota per database by default), it can run out. |
| GitHub | Unlimited private repos | Fits |
| Cloudflare R2 | 10 GB storage, 1M writes and 10M reads a month, free downloads | Fits |

Which clients need paid tiers, and how production is backed up, are open ([0109](../decisions/0109-client-hosting-plans-and-backups.md)). The suggestion is:
- a free baseline for launch, with R2 for uploads;
- a paid Render instance and an Atlas tier with backups for production, at the client's cost;
- staging always on the free tier.
