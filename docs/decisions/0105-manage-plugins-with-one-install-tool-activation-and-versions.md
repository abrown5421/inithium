---
id: "0105"
title: Manage plugins with one install tool, runtime activation and versions
status: accepted
date: "2026-10-14"
scope: ecosystem
tags: [plugins, tooling, lifecycle, versions, activation, cms]
related: ["0002", "0015", "0016", "0017", "0018", "0019", "0103", "0104", "0106", "0107"]
supersedes: []
---

# 0105. Manage plugins with one install tool, runtime activation and versions

## Context

Plugins will be added for years as clients' needs repeat, and different clients will hold different plugins at different versions. [0002](0002-install-plugins-as-nx-libs-via-registries.md) defined how a plugin lands in a workspace (as libs, through registries, with seed and unseed). It didn't define the rest of a plugin's life:
- who installs it, and with what;
- whether an installed plugin can be switched off without removing it;
- how a client moves to a newer version;
- what the client is told before its data is deleted.

## Decision

**Where plugin code lives**
- Plugin source lives only in the Inithium repo, under `plugins/plugin-<name>/`. It's built and committed there like core updates.
- Client repos receive copies of only the plugins they use. There's no npm packaging ([0002](0002-install-plugins-as-nx-libs-via-registries.md)).
- Install always **copies**, everywhere. The sandbox doesn't link to plugin source; a plugin is edited in `plugins/` and re-copied into the sandbox.

**One install tool everywhere**
- One CLI installs and ejects plugins in every workspace: the sandbox, the showcase, and client repos (from which staging and production deploy).
- The sandbox is treated as a client repo whose client is the developer, so it tests exactly what clients get.
- Where the tool lives, and how it's run against a client repo, is still open ([0018](0018-install-eject-tooling-for-client-repos.md)).

**Four verbs**

| Verb | What it does | Done with | Data |
| --- | --- | --- | --- |
| **Install** | Copies the plugin's libs into the workspace, registers them in the app registries and seeds its data | The CLI, then a build and deploy | Seeded |
| **Activate** | Turns an installed plugin on | A toggle on a CMS **Plugins** screen, instantly, with no deploy | Kept |
| **Deactivate** | Turns an installed plugin off, without removing anything | The same toggle | Kept |
| **Eject** (the same as uninstall) | Removes the plugin's data, then its code | Two steps, below | Removed |

- **Activation** is a runtime flag stored in the client's database. **Owners and dev** can toggle it; it's a new permission, which owners hold and dev holds along with every other.
- **Inactive means switched off:** core must stop showing and serving an inactive plugin, so every slot honours activation ([0015](0015-slot-catalogue.md)). Exactly what each slot does while inactive is still open ([0107](0107-plugin-lifecycle-mechanics.md)).

**Ejecting takes two steps.** The unseed needs the plugin's own code, so:
1. **Unseed from the running site,** while the code is still installed, which removes the plugin's data.
2. **Remove the code** with the CLI (registry entries, then `libs/plugins/<name>/`) and deploy.

Afterwards the workspace must type-check and build exactly as before the install ([0002](0002-install-plugins-as-nx-libs-via-registries.md)).

**Warning before data is lost (nice to have, not a requirement)**
- Before the unseed, the client is told what will be deleted ("This plugin holds 312 bookings and 40 services") and offered three choices:
  - **Export first:** download the plugin's data;
  - **Eject anyway;**
  - **Cancel.**
- The export format is still open ([0107](0107-plugin-lifecycle-mechanics.md)).

**Plugin settings**
- A plugin can expose settings in the CMS, so one plugin can behave differently per client without being forked.
- The Inithium developer decides when a difference becomes a setting and when it needs a different plugin.
- Truly one-off code still goes in `libs/client/`.

**Versions**
- **Every plugin has a version.** Each client repo has a **manifest** recording its core version and each installed plugin with its version.
- **Clients stay on the version they installed** until they ask to upgrade.
- **Upgrading copies the newer plugin in** and runs the plugin's **data migrations** between the two versions. So a plugin keeps every migration it has ever had (v1→v2→v3).
- **Each plugin declares the minimum core version** it works with. A client may need a core update before a plugin upgrade.
- **Client repos never edit plugin files**, as with core files: an upgrade overwrites them.
- `plugins/` holds only each plugin's latest version; older versions remain in git history.

**Demo data**
- A plugin may ship **demo data**, separate from its seed. The seed creates what the plugin needs to work; demo data is sample content (example products, bookings, pages).
- Demo data is used by the showcase and the sandbox. Its shape is still open ([0107](0107-plugin-lifecycle-mechanics.md), [0110](0110-showcase-content-and-access.md)).

## Alternatives considered

- **npm packages for plugins:** rejected. All code stays in the Inithium repo, and clients receive copies of only what they use.
- **Linking the sandbox to plugin source:** not needed. Plugins are always edited in `plugins/`, and the sandbox receives copies exactly as clients do.
- **Separate install tooling for the sandbox:** rejected. The sandbox would then not be testing what clients get.
- **Eject as the only way to switch a plugin off:** rejected. Clients need to turn a plugin off without losing its data or waiting for a deploy.
- **Pushing plugin upgrades to every client automatically:** rejected. Clients choose when to upgrade.

## Consequences

- **Core gains:**
  - a runtime plugin-state store;
  - a CMS Plugins screen with activation toggles and each plugin's settings;
  - a new permission, held by owners;
  - activation built into every slot contract ([0015](0015-slot-catalogue.md)).
- **The install tool owns:**
  - copying (without spec files, [0103](0103-test-with-vitest-and-a-plugin-contract-kit.md));
  - registry entries;
  - the manifest;
  - version and core-compatibility checks.
- **Plugin updates don't arrive through core's upstream merges** ([0017](0017-upstream-mechanism.md)): the install tool delivers them.
- **Every plugin ships:**
  - a version;
  - its minimum core version;
  - its migrations;
  - its seed and unseed;
  - optionally, settings and demo data.
- **Still open** ([0107](0107-plugin-lifecycle-mechanics.md)):
  - how seeds and migrations run against a hosted database;
  - what each slot does while inactive;
  - the export format;
  - the shape of demo data.
