---
id: "0003"
title: Regenerate the sandbox on demand and never commit it
status: accepted
date: "2026-10-07"
scope: ecosystem
tags: [sandbox, plugins, testing]
related: ["0001", "0002"]
supersedes: []
---

# 0003. Regenerate the sandbox on demand and never commit it

## Context

Plugins need a full workspace to be tested in the browser, but core must never contain plugin code. A committed copy of core with plugins installed would fall behind as soon as core changes.

## Decision

The sandbox is rebuilt from `core/` + `plugins/` whenever it's needed. `sandbox/` holds tooling only; generated workspaces go in `sandbox/workspaces/`, which is git-ignored. The tooling must support adding and ejecting individual plugins, so that install, seed, unseed and eject can each be verified.

## Alternatives considered

None recorded. The only aim is to keep the sandbox from drifting away from core.

## Consequences

- Plugin work is done by starting the sandbox instead of core.
- The current sandbox scripts predate [0002](0002-install-plugins-as-nx-libs-via-registries.md) and still copy plugin folders into the apps. They need to be rebuilt.
