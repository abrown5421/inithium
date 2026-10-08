---
title: Backend
description: The api app and its libs, covering environment, database, authentication, users and assets.
scope: core
tags: [api, backend]
order: 3
---

# Backend

The `api` app is an Express server and the only thing that talks to MongoDB. It serves the API under `/api` and, in production, both frontends from the same origin.

| Page | Covers |
| --- | --- |
| [Environment variables](environment-variables.md) | Every variable the api reads, its default and validation |
| [Authentication](authentication.md) | Sign-in, cookies, roles, permissions and the dev account |

Database, users and assets pages are being written as part of the manual backfill.
