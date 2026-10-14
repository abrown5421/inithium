---
id: "0107"
title: Decide the mechanics of the plugin lifecycle
status: proposed
date: "2026-10-14"
scope: ecosystem
tags: [plugins, lifecycle, seeding, migrations, activation, tooling]
related: ["0002", "0015", "0018", "0019", "0105", "0106", "0110"]
supersedes: []
---

# 0107. Decide the mechanics of the plugin lifecycle

## Context

[0105](0105-manage-plugins-with-one-install-tool-activation-and-versions.md) settled the plugin lifecycle: four verbs, one install tool, runtime activation, versions with migrations, two-step eject and demo data. It left open the mechanics below. They were raised in planning but not decided.

## Decision

Undecided. Open questions, with the suggestions raised so far.

**1. How seeds, migrations and unseeds run against a hosted database.**
- **The problem:** on staging and production, nobody runs a seed by hand against the client's database.
- **Suggestion:** the api does it on startup.
  - The repo's manifest says which plugins are present, at which versions.
  - A `plugins` collection in the database records what has already been done.
  - On boot the api compares the two and runs what's missing: the seed on first install, migrations on an upgrade.
  - Installing and upgrading then work the same in the sandbox, staging and production: change the code, deploy, and the data follows.
- **Still to settle:**
  - what happens if a migration fails on startup;
  - whether eject's unseed (step 1 of [0105](0105-manage-plugins-with-one-install-tool-activation-and-versions.md)'s two-step eject) is a CMS action (dev only), a CLI command against the running site, or both.

**2. What an inactive plugin's slots do.** Suggested:
- its api routes answer 404;
- its CMS screens and sidebar entries are hidden;
- its `web` page templates drop out of routing and menus;
- its profile tabs, sidebar sections and actions disappear;
- its Navbar extras disappear;
- its **user deletion hook still runs**, because its data still exists.

Also to settle:
- whether its seeded page records stay published but unreachable, or are hidden from the CMS Pages list;
- whether its settings stay editable while it's inactive.

**3. The activation permission.** Owners and dev hold it ([0105](0105-manage-plugins-with-one-install-tool-activation-and-versions.md)). Its name (suggested `plugins.manage`), and whether one permission also covers plugin settings, are open.

**4. Re-copying while developing in the sandbox.** Suggested: a `sync` (or `watch`) command that re-copies a plugin's changed files from `plugins/` into a sandbox workspace while the developer works.

**5. The eject export format.**
- **Suggestion:** JSON first, since it's lossless and could be restored if the plugin is reinstalled. CSV (one file per collection, zipped) later, for clients who want spreadsheets.
- **Also open:** how a plugin declares the collections it owns, so the warning can count their records.

**6. The shape of demo data.**
- Is demo data a function in the plugin's `api` lib (like the seed), or data files?
- Can it be removed separately from the plugin?
- How do the showcase and sandbox load it ([0110](0110-showcase-content-and-access.md))?

**7. How versions are written.** The manifest's file name and format (e.g. `inithium.json`), the version scheme (e.g. semantic versions), and where a plugin declares its version and minimum core version.

## Alternatives considered

None evaluated yet.

## Consequences

- The sandbox tooling ([0106](0106-run-the-sandbox-as-a-local-generated-workspace-beside-core.md)) and the first plugin need questions 1, 2 and 4 answered.
- Question 1 overlaps with seed tracking ([0019](0019-seed-tracking.md)) and should be settled together with it.
