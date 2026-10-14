---
id: "0018"
title: Decide where install/eject tooling lives for client repos
status: proposed
date: "2026-10-14"
scope: ecosystem
tags: [plugins, tooling, clients]
related: ["0002", "0016", "0103", "0105", "0106", "0107"]
supersedes: []
---

# 0018. Decide where install/eject tooling lives for client repos

## Context

Plugins are installed and ejected by tooling that owns the registry files ([0002](0002-install-plugins-as-nx-libs-via-registries.md)). The sandbox needs this tooling to build its workspaces, but real client repos need it too, and those don't contain `plugins/`.

## Decision

Partly settled by [0105](0105-manage-plugins-with-one-install-tool-activation-and-versions.md):
- **One tool for every workspace:** the sandbox, the showcase, and client repos (which staging and production deploy from).
- **Always copying:** it copies plugin libs from `plugins/` and never links them.
- **Owning the registries and the manifest,** including version and core-compatibility checks.
- **Removing code is eject's second step.** The plugin's data is unseeded first, from the running site.

Still open:

- Where does the tool live (e.g. under `sandbox/`, or a `tools/` folder at the repo root), and is it one CLI for generating sandbox workspaces as well?
- How is it run against a real client repo, which doesn't contain `plugins/`? For example, run from the Inithium repo with the client repo's path as an argument.

Already required, whatever the answer: installing copies a plugin's libs without their `*.spec.ts(x)` files, which run only in the Inithium repo and the sandbox ([0103](0103-test-with-vitest-and-a-plugin-contract-kit.md)).

## Alternatives considered

None recorded yet.

## Consequences

Plugins can be exercised in the sandbox before this is decided, but not installed into a client.
