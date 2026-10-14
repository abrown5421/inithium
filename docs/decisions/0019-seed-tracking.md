---
id: "0019"
title: Decide how unseed identifies what its seed created
status: proposed
date: "2026-10-14"
scope: ecosystem
tags: [plugins, seeding, mongodb]
related: ["0002", "0103", "0105", "0107"]
supersedes: []
---

# 0019. Decide how unseed identifies what its seed created

## Context

Every plugin ships an idempotent seed, run on install, and an unseed, run on eject, which must remove only what that plugin's seed created ([0002](0002-install-plugins-as-nx-libs-via-registries.md)). Seeds create things such as default CMS pages, settings and nav entries.

## Decision

Undecided. Open question: how does unseed identify exactly the records its seed created?

Related, but not dependent on this:
- **The tests don't need it.** They check "unseed removes exactly what its seed created" by comparing database snapshots, whatever the tracking ([0103](0103-test-with-vitest-and-a-plugin-contract-kit.md)).
- **One record could serve both.** The suggested startup step keeps a `plugins` collection recording what has been seeded and migrated in each database ([0107](0107-plugin-lifecycle-mechanics.md)). It could also hold what unseed needs, so the two should be settled together.
- **Eject's warning** must count the plugin's records before unseeding, so whatever tracks seeded data may also serve that count ([0105](0105-manage-plugins-with-one-install-tool-activation-and-versions.md)).

## Alternatives considered

None recorded yet.

## Consequences

Seed and unseed can't be implemented until this is decided.
