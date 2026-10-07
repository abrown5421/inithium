---
id: "0019"
title: Decide how unseed identifies what its seed created
status: proposed
date: "2026-10-07"
scope: ecosystem
tags: [plugins, seeding, mongodb]
related: ["0002"]
supersedes: []
---

# 0019. Decide how unseed identifies what its seed created

## Context

Every plugin ships an idempotent seed, run on install, and an unseed, run on eject, which must remove only what that plugin's seed created ([0002](0002-install-plugins-as-nx-libs-via-registries.md)). Seeds create things such as default CMS pages, settings and nav entries.

## Decision

Undecided. Open question: how does unseed identify exactly the records its seed created?

## Alternatives considered

None recorded yet.

## Consequences

Seed and unseed can't be implemented until this is decided.
