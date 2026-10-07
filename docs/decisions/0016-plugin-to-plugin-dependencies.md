---
id: "0016"
title: Decide whether plugins can depend on other plugins
status: proposed
date: "2026-10-07"
scope: ecosystem
tags: [plugins, dependencies]
related: ["0002", "0018"]
supersedes: []
---

# 0016. Decide whether plugins can depend on other plugins

## Context

A plugin may depend on core libs and on its own layers. Some plugins may also want to build on another plugin, for example an `ecom` plugin using a `storage` plugin.

## Decision

Undecided. Open questions:

- Can a plugin depend on another plugin?
- If so, how do install and eject order work, and how are module boundaries enforced between plugins?

## Alternatives considered

None recorded yet.

## Consequences

Until this is decided, plugins depend only on core libs and their own layers.
