---
id: "0017"
title: Choose how clients merge core without plugin source
status: proposed
date: "2026-10-07"
scope: ecosystem
tags: [clients, git, upstream]
related: ["0004"]
supersedes: []
---

# 0017. Choose how clients merge core without plugin source

## Context

Clients receive core updates through upstream merges ([0004](0004-deliver-core-changes-via-upstream-merges.md)). Core lives in `core/` inside the Inithium repo, next to `plugins/`, `sandbox/` and `docs/`. A client's upstream merges must bring in core only, never plugin source or Inithium's documentation.

## Decision

Undecided. Options raised so far: a separate core repository, or a subtree split of `core/`.

## Alternatives considered

None evaluated yet.

## Consequences

Client provisioning can't be finalised until this is decided.
