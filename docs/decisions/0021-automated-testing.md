---
id: "0021"
title: Decide when and how to add automated tests
status: proposed
date: "2026-10-07"
scope: ecosystem
tags: [testing, verification]
related: []
supersedes: []
---

# 0021. Decide when and how to add automated tests

## Context

There are no automated tests yet. Verification is lint, type-check, build and the docs check, and libs are generated with `--unitTestRunner=none`.

## Decision

Undecided. For now there are no automated tests. This will be revisited when libs gain real logic.

## Alternatives considered

None recorded yet.

## Consequences

Regressions are caught only by type-checking, building, and manual browser testing.
