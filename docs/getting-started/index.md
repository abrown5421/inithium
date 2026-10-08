---
title: Getting started
description: What Inithium is, how to run it locally, and how work on it is done.
scope: ecosystem
tags: [setup]
order: 1
---

# Getting started

Inithium is a template-and-plugins ecosystem. Every client application starts as a clone of **core**: an Nx monorepo with an Express `api`, a `web` site and a `cms` client portal. Features that only some clients need are added as **plugins**.

| Page | Covers |
| --- | --- |
| [Local setup](local-setup.md) | Install, configure the environment and run the apps |

Read this manual in the docs app (`npx nx serve docs`, then http://localhost:5175): a sidebar of sections, search, and live examples with their code.

More pages (the working protocol and how the repo is organised) are being written as part of the manual backfill.
