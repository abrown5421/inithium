---
id: "0004"
title: Deliver core changes to clients via upstream merges
status: accepted
date: "2026-10-07"
scope: ecosystem
tags: [clients, git, maintenance]
related: ["0001", "0005", "0017"]
supersedes: []
---

# 0004. Deliver core changes to clients via upstream merges

## Context

Every client app is a clone of core. Bugs and vulnerabilities will keep turning up as more client sites are built. A fix found on the fifteenth client has to reach the fourteen before it without patching each repository by hand.

## Decision

- Each client repo keeps Inithium core as an upstream git remote and merges core improvements from it.
- Client repos never edit core files. Client-specific needs go, in order of preference, into configuration stored through the CMS, plugins from the library, or `libs/client/` for genuinely one-off code. Core never puts anything in `libs/client/`.
- If a client needs core to behave differently, the change is made in Inithium core, generalised for every client, and merged upstream.

## Alternatives considered

- **Letting clients fork and patch core freely**: rejected. A fix would have to be repeated by hand in every client repository.

## Consequences

- Upstream merges stay clean only while clients leave core files alone.
- Client libs use the same slot registries and conventions as plugins, tagged `origin:client`.
- How a client merges core without receiving plugin source is still open: [0017](0017-upstream-mechanism.md).
