---
id: "0009"
title: Read the environment only through api-config, and require a database name
status: accepted
date: "2026-10-07"
scope: core
tags: [environment, config, mongodb, zod]
related: ["0008", "0010"]
supersedes: []
---

# 0009. Read the environment only through api-config, and require a database name

## Context

Environment variables are untyped strings that can be missing or malformed. Mongoose silently falls back to a database called `test` when the connection string has no database name, which could quietly write data to the wrong place.

## Decision

- Only `@inithium/api-config` reads `process.env`. Everything else calls `loadEnv()`, which validates the variables once against `envSchema` and returns a typed result.
- Adding a variable means adding it to both `envSchema` and `core/.env.example`.
- `MONGODB_URI` must include a database name; validation rejects it otherwise.

## Alternatives considered

None recorded. The database-name rule is preventive; no data had been lost to the `test` fallback.

## Consequences

- A misconfigured environment fails at startup with a readable list of problems.
- See [Environment variables](../backend/environment-variables.md) for the current variables.
