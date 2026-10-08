---
title: Architecture
description: How the Inithium ecosystem is organised (core, plugins, sandbox and client repositories) and why.
scope: ecosystem
tags: [architecture]
order: 2
decisions: ["0001", "0002", "0003", "0004", "0005"]
---

# Architecture

The Inithium repo holds four parts: **core** (the clonable Nx workspace every client starts from), **plugins** (optional features installed into a clone), the **sandbox** (a regenerated replica of core with every plugin installed, for testing) and **docs** (this manual). Client repositories receive core plus only the plugins they use.

This section is being written as part of the manual backfill. Until then, the reasoning is in the decision records: [0001](../decisions/0001-split-core-plugins-and-sandbox.md) (core, plugins and sandbox), [0002](../decisions/0002-install-plugins-as-nx-libs-via-registries.md) (plugins as libs and registries), [0003](../decisions/0003-regenerate-the-sandbox-on-demand.md) (the sandbox), [0004](../decisions/0004-deliver-core-changes-via-upstream-merges.md) (upstream merges) and [0005](../decisions/0005-give-each-client-their-own-infrastructure.md) (client infrastructure).
