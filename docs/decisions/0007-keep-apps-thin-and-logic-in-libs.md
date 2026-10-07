---
id: "0007"
title: Keep apps thin and put business logic in tagged, non-buildable libs
status: accepted
date: "2026-10-07"
scope: core
tags: [nx, architecture, libs, eslint]
related: ["0002"]
supersedes: []
---

# 0007. Keep apps thin and put business logic in tagged, non-buildable libs

## Context

Core will grow across many concerns (UI and theming, auth, realtime, data access), and plugin and client code must slot in alongside it. The workspace layout should be familiar to developers who know monorepos, and features should be easy to find.

## Decision

- Apps are thin orchestrators: bootstrapping, composition, routing to lib-provided handlers and pages, and their plugin registry. They hold no business logic.
- Libs are split by concern, live in `libs/<scope>/<name>/` with the alias `@inithium/<scope>-<name>`, and are non-buildable source libs compiled by the consuming app.
- Every lib carries a `scope:`, a `type:` and an `origin:` tag, and `@nx/enforce-module-boundaries` enforces the dependency rules between them. Apps carry only their `scope:` tag. See [Libs](../reference/libs.md) and [Conventions](../reference/conventions.md).

## Alternatives considered

None recorded. This is how the project owner learned to build monorepos, and it matches what most developers expect: apps consume, libs export the business logic.

## Consequences

- Code is separated by concern, which helps readability and makes feature slicing straightforward.
- New logic means finding or creating the lib that owns that concern, never adding it to an app.
- Boundary errors are fixed by changing the dependency, never with an `eslint-disable` comment.
