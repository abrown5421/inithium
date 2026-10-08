---
title: Backend
description: The api app and its libs, covering environment, database, authentication, users, assets and how frontends call the API.
scope: core
tags: [api, backend]
order: 3
decisions: ["0006", "0007"]
---

# Backend

The `api` app is an Express server and the only thing that talks to MongoDB. It serves the API under `/api` and, in production, both frontends from the same origin ([0006](../decisions/0006-serve-each-client-from-one-origin.md)). Its logic lives in libs under `core/libs/api/` ([0007](../decisions/0007-keep-apps-thin-and-logic-in-libs.md)).

| Page | Covers |
| --- | --- |
| [The api app](api-app.md) | Startup, routes, errors, serving the frontends, adding routes |
| [Environment variables](environment-variables.md) | Every variable the api reads, its default and validation |
| [Database](database.md) | MongoDB, the connection lifecycle, connection strings and collections |
| [Authentication](authentication.md) | Sign-in, cookies, roles, permissions and the dev account |
| [Users](users.md) | The users collection, roles, service functions and planned profiles |
| [Assets](assets.md) | Stored files behind storage drivers (designed, not built) |
| [Calling the API](calling-the-api.md) | How `web` and `cms` call the API with RTK Query |
