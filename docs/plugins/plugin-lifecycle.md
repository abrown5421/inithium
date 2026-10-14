---
title: Plugin lifecycle
description: How a plugin is installed, activated, deactivated, upgraded and ejected, with versions, a manifest, settings and demo data.
scope: ecosystem
tags: [plugins, lifecycle, versions, activation, seeding]
order: 2
decisions: ["0105", "0107", "0002", "0015", "0018", "0019"]
---

# Plugin lifecycle

Plugins are added over the years as clients' needs repeat, and each client holds its own set at its own versions ([0105](../decisions/0105-manage-plugins-with-one-install-tool-activation-and-versions.md)).

> **Status:** decided, not built yet. No plugins, install tool, Plugins screen or manifest exist so far. Open details are in [0107](../decisions/0107-plugin-lifecycle-mechanics.md).

## Where plugin code lives

- **Source:** plugin source lives only in this repo, under `plugins/plugin-<name>/`, built and committed like core.
- **Copies:** a workspace gets a **copy** of each plugin it installs, as libs under `libs/plugins/<name>/` ([0002](../decisions/0002-install-plugins-as-nx-libs-via-registries.md)). That workspace can be a client repo, the sandbox or the showcase. There's no npm packaging and no linking.
- **No editing copies:** client repos never edit plugin files. An upgrade overwrites them, just as an upstream merge updates core.

## One install tool

A single CLI installs and ejects plugins in every workspace: the sandbox, the showcase and client repos. Because the sandbox uses the same tool, it tests exactly what clients get. The tool:
- copies the plugin's libs, without spec files ([Testing plugins](testing-plugins.md#where-plugin-tests-run));
- adds and removes the plugin's entries in the app registries;
- keeps the workspace's manifest up to date;
- checks versions and core compatibility.

Where it lives, and how it's run against a client repo, are open ([0018](../decisions/0018-install-eject-tooling-for-client-repos.md)).

## The four verbs

| Verb | What it does | How | Data |
| --- | --- | --- | --- |
| **Install** | Copies the plugin in, registers it and seeds its data | The CLI, then a build and deploy | Seeded |
| **Activate** | Turns an installed plugin on | A toggle on the CMS **Plugins** screen; instant, no deploy | Kept |
| **Deactivate** | Turns it off without removing anything | The same toggle | Kept |
| **Eject** (also called uninstall) | Removes its data, then its code | Two steps, below | Removed |

### Activation

**Who:** owners and dev can activate or deactivate plugins. Activation is a new permission, held by owners; dev holds every permission.

**What "inactive" means:** core stops showing and serving the plugin, so every slot contract must let core leave an inactive plugin out ([0015](../decisions/0015-slot-catalogue.md)). The suggested behaviour, still to be decided ([0107](../decisions/0107-plugin-lifecycle-mechanics.md)):
- its routes answer 404;
- its CMS screens and its `web` pages and menu entries disappear;
- its profile and Navbar extras disappear;
- its user deletion hook keeps running, because its data still exists.

### Ejecting

The unseed is the plugin's own code, so it has to run before that code is removed:

1. **Unseed from the running site,** removing the plugin's data.
2. **Remove the code** with the CLI (registry entries, then `libs/plugins/<name>/`), and deploy.

Afterwards the workspace must type-check and build exactly as before the install.

**Before step 1 (nice to have):** the client is told what will be lost, e.g. "This plugin holds 312 bookings and 40 services". They can **export first**, **eject anyway**, or **cancel**. The export format is open; JSON first, then CSV, is suggested.

## Settings

A plugin can expose settings on the CMS Plugins screen, so one plugin can behave differently for different clients without being forked. The Inithium developer decides when a difference becomes a setting and when it needs a different plugin. Truly one-off code goes in `libs/client/`.

## Versions and upgrades

- **Every plugin has a version** and declares the **minimum core version** it works with.
- **Each workspace has a manifest** recording its core version and every installed plugin's version. Its name and format are open; `inithium.json` is suggested.
- **Clients stay on the version they installed** until they ask to upgrade.
- **Upgrading** copies the newer version in and runs the plugin's **data migrations** between the two versions (v1→v2→v3). A plugin therefore keeps every migration it has ever had. A client may need a core update first.
- `plugins/` holds only each plugin's latest version; older ones remain in git history.
- Plugin upgrades don't arrive through core's upstream merges ([0017](../decisions/0017-upstream-mechanism.md)).

## Seeds, migrations and demo data

- **Seed:** creates what the plugin needs to work. It's idempotent, and its unseed removes exactly what it created ([How plugins work](how-plugins-work.md#seeding-and-unseeding)).
- **Migrations:** move the plugin's data from one version to the next.
- **Demo data (optional):** sample content, such as example products or bookings, kept separate from the seed. The showcase and the sandbox use it. Its shape is open.

How these run against a hosted database is open ([0107](../decisions/0107-plugin-lifecycle-mechanics.md)). The suggestion is that the api runs them on startup: it compares the manifest with a `plugins` collection recording what each database has already had, then runs what's missing. That overlaps with seed tracking ([0019](../decisions/0019-seed-tracking.md)).
