---
title: Architecture
description: How the Inithium ecosystem is organised (core, plugins, sandbox and client repositories) and why.
scope: ecosystem
tags: [architecture]
order: 2
decisions: ["0001", "0002", "0004", "0104", "0106"]
---

# Architecture

Inithium is built so that every client gets the same well-maintained foundation, plus only the features they use, on infrastructure they own.

| Page | Covers |
| --- | --- |
| [The ecosystem](ecosystem.md) | Core, plugins, the sandbox and the docs, and how they relate |
| [Environments](environments.md) | Core development, the sandbox, the showcase, and each client's staging and production sites, and on whose accounts |
| [The core workspace](core-workspace.md) | Apps, libs, layers and the rules that keep them apart |
| [Client repositories](client-repositories.md) | How a client app is created, kept up to date, customised and hosted |
| [The sandbox](sandbox.md) | The local development environment for plugins: a generated copy of core run beside it |
| [The CMS](cms.md) | The client portal: its frame, screens, sign-in and the Pages editor, and adding a screen |
| [Pages and routing](pages-and-routing.md) | Page records, code templates, layouts, routing, transitions and menus in `web` |
| [Content pages](content-pages.md) | Pages clients build in the CMS from sections, columns and blocks |

How plugins plug in is covered in [Plugins](../plugins/index.md).
