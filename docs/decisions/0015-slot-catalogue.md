---
id: "0015"
title: Define the slot catalogue and contract shapes
status: proposed
date: "2026-10-07"
scope: core
tags: [plugins, slots, contracts]
related: ["0002"]
supersedes: []
---

# 0015. Define the slot catalogue and contract shapes

## Context

Plugins and client libs extend core only through slots: typed extension contracts defined in a core lib, filled through each app's registry file ([0002](0002-install-plugins-as-nx-libs-via-registries.md)). No slot contracts or registry files exist in core yet.

## Decision

Undecided. Open questions:

- Exactly which slots core exposes. Examples raised so far: API route mounts, Mongoose models, web pages and routes, CMS screens, and navigation entries.
- The contract shape of each slot.

## Alternatives considered

None recorded yet.

## Consequences

No plugin can be built until the slots it needs are defined.
