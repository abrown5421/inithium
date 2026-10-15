---
id: "0106"
title: Run the sandbox as a local generated workspace beside core
status: accepted
date: "2026-10-14"
scope: ecosystem
tags: [sandbox, plugins, tooling, testing, docs]
related: ["0001", "0002", "0052", "0053", "0103", "0104", "0105", "0107"]
supersedes: ["0003"]
---

# 0106. Run the sandbox as a local generated workspace beside core

## Context

[0003](0003-regenerate-the-sandbox-on-demand.md) settled that the sandbox is regenerated from `core/` and `plugins/` rather than committed, so it can't drift from core. New plugins will be built continuously over the years. Each must be checked in the browser through repeated cycles: install, activate, deactivate, eject, reinstall and eject again. Core itself must never contain plugin code.

## Decision

**What it is**
- The sandbox is the **local development environment for plugins**: a full copy of core's apps (`api`, `web`, `cms` and `docs`) with plugins installed into it.
- It's never hosted ([0104](0104-separate-development-showcase-staging-and-production-environments.md)).

**Generated, never maintained**
- Sandbox workspaces are generated from `core/` + `plugins/` into `sandbox/workspaces/<name>/`, which git ignores. `sandbox/` holds only the tooling.
- A workspace can be kept between sessions, with its database, and regenerated whenever core moves on. Nobody maintains a sandbox copy by hand.

**Driven by the CLI, checked in the browser**
- Plugins are installed, activated, deactivated, ejected and reinstalled **one at a time**, with the same install tool clients use ([0105](0105-manage-plugins-with-one-install-tool-activation-and-versions.md)).
- Activation can also be toggled on the CMS Plugins screen, as a client would.
- The developer watches each step in the sandbox's `web` and `cms`.

**Beside core, not instead of it**
- The sandbox runs on its own ports, so core and the sandbox can run at the same time and be compared side by side.
- The tool sets each generated workspace's ports, and its Vite proxy targets to match.

**Its own database**
- The sandbox uses its own database on Inithium's shared Atlas cluster, so data survives between sessions and never mixes with core development's.

**Plugin manuals**
- The sandbox's docs app shows the core manual **plus the manuals of the installed plugins** (`plugins/plugin-<name>/docs/`).
- Plugin manuals still never reach client repos ([0052](0052-keep-a-self-documenting-developer-manual.md)).

**Tests**
- Each plugin's tests run in the Inithium repo and the sandbox, never in client repos ([0103](0103-test-with-vitest-and-a-plugin-contract-kit.md)).
- The sandbox also runs each plugin's lifecycle check as its acceptance gate: install, build, seed, seed again, unseed, eject, then type-check and build exactly as before the install.

## Alternatives considered

- **A separately maintained sandbox repository:** rejected. Every core change would need copying across, and it would drift. Generating it gives the same full copy of the apps without that upkeep.
- **Running the sandbox instead of core** (as [0003](0003-regenerate-the-sandbox-on-demand.md) put it): replaced. Running both at once is rarely needed but worth supporting, so core can be compared with the sandbox.
- **Hosting the sandbox:** rejected in [0104](0104-separate-development-showcase-staging-and-production-environments.md).

## Consequences

- **The current `sandbox/` scripts must be rebuilt.** They copy plugin folders into the apps and have no seeding.
- **The tool must support:**
  - generating and regenerating workspaces;
  - giving each one its own ports and database;
  - re-copying a plugin's changed source while the developer works on it ([0107](0107-plugin-lifecycle-mechanics.md));
  - every lifecycle verb;
  - the lifecycle check.
- **The docs app needs a way to include installed plugins' manuals** in the sandbox, without that ever happening in a client clone.
- **The exact sandbox ports and database name** are set when the tooling is designed.
