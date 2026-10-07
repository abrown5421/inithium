---
id: "0010"
title: Connect to the database before listening, and exit if it fails
status: accepted
date: "2026-10-07"
scope: core
tags: [api, mongodb, startup]
related: ["0009"]
supersedes: []
---

# 0010. Connect to the database before listening, and exit if it fails

## Context

The `web` site's colours, pages and settings will all be dynamic, stored in MongoDB and served by the API. Without a database connection there is nothing to render.

## Decision

`@inithium/api-database` owns the Mongoose connection. The api connects before it starts listening and exits if the connection fails. On SIGTERM or SIGINT it stops accepting requests and then disconnects.

## Alternatives considered

- **Starting the server and retrying the connection in the background**: rejected. The app would accept requests while having nothing to serve.

## Consequences

- A bad `MONGODB_URI` or an unreachable cluster stops the process at startup, so the deploy fails visibly instead of serving an empty site.
- The connection string is never logged, because it contains credentials.
