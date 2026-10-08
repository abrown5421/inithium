---
title: Getting started
description: What Inithium is, how to run it locally, and how work on it is done.
scope: ecosystem
tags: [setup]
order: 1
decisions: ["0001", "0005", "0006"]
---

# Getting started

Inithium is a template-and-plugins ecosystem for building client web applications.

- **Every client app starts as a clone of core:** an Nx workspace with three apps.
  - `api`: an Express server backed by MongoDB.
  - `web`: the site the client's visitors use.
  - `cms`: a portal where the client manages that site.
- **Optional features are plugins,** installed into a client's clone only when that client needs them.
- **Each client owns their own infrastructure:** their own GitHub repo, MongoDB Atlas cluster and Render account ([0005](../decisions/0005-give-each-client-their-own-infrastructure.md)).
- **Each client is served from one domain:** the `api` serves the API at `/api`, `web` at `/` and `cms` at `/cms` ([0006](../decisions/0006-serve-each-client-from-one-origin.md)).

| Page | Covers |
| --- | --- |
| [Local setup](local-setup.md) | Install, configure the environment and run the apps |
| [Repository layout](repository-layout.md) | What lives where in the repo and in core |
| [Working on Inithium](working-on-inithium.md) | How a change goes from request to `main`: branches, verification, documentation, review |

Read this manual in the docs app (`npx nx serve docs`, then http://localhost:5175): a sidebar of sections, search, and live examples with their code.
