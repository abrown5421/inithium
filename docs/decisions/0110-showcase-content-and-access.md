---
id: "0110"
title: Decide what the showcase shows and how prospects use it
status: proposed
date: "2026-10-14"
scope: ecosystem
tags: [showcase, marketing, plugins, demo-data, hosting]
related: ["0104", "0105", "0106", "0107", "0109"]
supersedes: []
---

# 0110. Decide what the showcase shows and how prospects use it

## Context

`inithium.onrender.com` becomes the showcase: Inithium's primary marketing tool, where prospective clients click around a site with plugins installed ([0104](0104-separate-development-showcase-staging-and-production-environments.md)). It's generated from `core/` + `plugins/` by the same tooling as the sandbox, and pushed to a repo Render deploys, so nobody maintains it by hand ([0106](0106-run-the-sandbox-as-a-local-generated-workspace-beside-core.md)). Plugins may ship demo data for it ([0105](0105-manage-plugins-with-one-install-tool-activation-and-versions.md)).

## Decision

Undecided. Open questions:

**1. Which plugins it shows:** every plugin, or a curated set. Are inactive plugins shown in its CMS Plugins screen so prospects can toggle them?

**2. Demo content:** which demo data loads, and core's own demo pages and settings (Inithium's branding rather than a client's).

**3. Demo accounts:** can prospects sign in, for example as a demo owner, to explore the CMS? What may they change, and what's locked (e.g. account management, ejecting)?

**4. Resetting:** if prospects can change things, the showcase needs a reset (nightly, or on demand) so one prospect's changes don't greet the next. How is it triggered, and from what snapshot?

**5. Showcase staging:** whether to also run a showcase staging service on Inithium's Render account, to check a new plugin or core update before the showcase gets it ([0109](0109-client-hosting-plans-and-backups.md) covers the free-hour cost).

**6. Generating and pushing:**
- which repo the showcase deploys from;
- how the tooling updates it;
- how its database is seeded with demo data on each deploy.

## Alternatives considered

None evaluated yet.

## Consequences

Until this is settled, `inithium.onrender.com` keeps running core as it is today.
