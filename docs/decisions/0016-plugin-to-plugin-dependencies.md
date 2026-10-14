---
id: "0016"
title: Decide whether plugins can depend on other plugins
status: proposed
date: "2026-10-14"
scope: ecosystem
tags: [plugins, dependencies]
related: ["0002", "0018", "0105"]
supersedes: []
---

# 0016. Decide whether plugins can depend on other plugins

## Context

A plugin may depend on core libs and on its own layers. Some plugins may also want to build on another plugin, for example an `ecom` plugin using a `storage` plugin.

## Decision

Undecided. Open questions:

- Can a plugin depend on another plugin?
- If so, how do install and eject order work, and how are module boundaries enforced between plugins?
- With versions and runtime activation ([0105](0105-manage-plugins-with-one-install-tool-activation-and-versions.md)): does a plugin declare which versions of another it needs, and can a plugin be deactivated while another active plugin depends on it?

## Alternatives considered

None recorded yet.

## Consequences

Until this is decided, plugins depend only on core libs and their own layers.
