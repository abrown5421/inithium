---
id: "0017"
title: Choose how clients merge core without plugin source
status: proposed
date: "2026-10-14"
scope: ecosystem
tags: [clients, git, upstream]
related: ["0004", "0103", "0105", "0108"]
supersedes: []
---

# 0017. Choose how clients merge core without plugin source

## Context

Clients receive core updates through upstream merges ([0004](0004-deliver-core-changes-via-upstream-merges.md)). Core lives in `core/` inside the Inithium repo, next to `plugins/`, `sandbox/` and `docs/`. A client's upstream merges must bring in core only, never plugin source or Inithium's documentation.

## Decision

Undecided. Options raised so far: a separate core repository, or a subtree split of `core/`.

Settled around it, whatever the mechanism:
- **Plugin updates don't travel through upstream merges.** Clients stay on their installed plugin versions until they ask to upgrade, and the install tool copies the newer version in ([0105](0105-manage-plugins-with-one-install-tool-activation-and-versions.md)).

Also to settle:
- **Recording the core version.** The client's manifest records its core version, so plugins can check compatibility. How does an upstream merge update that record?
- **CI in client repos.** The CI workflow lives at the Inithium repo root (`.github/workflows/verify.yml`, [0103](0103-test-with-vitest-and-a-plugin-contract-kit.md)), outside `core/`, so client repos don't get it. Should cloning or merging give clients a workflow of their own?
- **Reaching staging first.** Core updates should land on a client's staging site before production ([0108](0108-client-staging-workflow-and-data.md)).

## Alternatives considered

None evaluated yet.

## Consequences

Client provisioning can't be finalised until this is decided.
