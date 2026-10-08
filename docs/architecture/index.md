---
title: Architecture
description: How the Inithium ecosystem is organised (core, plugins, sandbox and client repositories) and why.
scope: ecosystem
tags: [architecture]
order: 2
decisions: ["0001", "0002", "0003", "0004", "0005"]
---

# Architecture

Inithium is built so that every client gets the same well-maintained foundation, plus only the features they use, on infrastructure they own.

| Page | Covers |
| --- | --- |
| [The ecosystem](ecosystem.md) | Core, plugins, the sandbox and the docs, and how they relate |
| [The core workspace](core-workspace.md) | Apps, libs, layers and the rules that keep them apart |
| [Client repositories](client-repositories.md) | How a client app is created, kept up to date, customised and hosted |
| [The sandbox](sandbox.md) | Testing plugins in a regenerated copy of core |

How plugins plug in is covered in [Plugins](../plugins/index.md).
