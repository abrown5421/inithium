---
id: "0018"
title: Decide where install/eject tooling lives for client repos
status: proposed
date: "2026-10-07"
scope: ecosystem
tags: [plugins, tooling, clients]
related: ["0002", "0003", "0016", "0103"]
supersedes: []
---

# 0018. Decide where install/eject tooling lives for client repos

## Context

Plugins are installed and ejected by tooling that owns the registry files ([0002](0002-install-plugins-as-nx-libs-via-registries.md)). The sandbox needs this tooling to build its workspaces, but real client repos need it too, and those don't contain `plugins/`.

## Decision

Undecided. Open questions:

- Where does the install/eject tooling live?
- How is it run against a real client repo, as opposed to the sandbox?

Already required, whatever the answer: installing copies a plugin's libs without their `*.spec.ts(x)` files, which run only in the Inithium repo and the sandbox ([0103](0103-test-with-vitest-and-a-plugin-contract-kit.md)).

## Alternatives considered

None recorded yet.

## Consequences

Plugins can be exercised in the sandbox before this is decided, but not installed into a client.
