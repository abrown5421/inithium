---
id: "0008"
title: Use Zod schemas as the single source of truth for shared data shapes
status: accepted
date: "2026-10-07"
scope: core
tags: [contracts, zod, validation, typescript]
related: ["0009"]
supersedes: []
---

# 0008. Use Zod schemas as the single source of truth for shared data shapes

## Context

The same data shapes cross `api`, `web` and `cms`. They need runtime validation in the API, form validation in the frontends, and TypeScript types everywhere. Maintaining these separately would let them drift apart.

## Decision

Every shared data shape is a Zod schema in a `scope:shared` contracts lib. Types are inferred with `z.infer`, never written by hand alongside the schema. The same schema validates API requests and responses and frontend forms.

## Alternatives considered

None recorded. Zod was chosen because a single schema provides runtime checks, data parsing and TypeScript types.

## Consequences

- Schemas go in `[entity].schema.ts` and inferred types in `[entity].types.ts`.
- The contracts lib doesn't exist yet. `api-config` already follows the pattern for env vars.
