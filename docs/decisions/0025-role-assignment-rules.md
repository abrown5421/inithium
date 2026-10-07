---
id: "0025"
title: Decide which roles may assign which roles
status: proposed
date: "2026-10-07"
scope: core
tags: [auth, users, roles, permissions]
related: ["0022"]
supersedes: []
---

# 0025. Decide which roles may assign which roles

## Context

The `dev` role can never be assigned through the API or CMS ([0022](0022-store-all-users-in-one-collection-with-roles.md)). Owner, admin and editor accounts will be added on the client's behalf as they're needed, which requires user-management endpoints and screens. Those don't exist yet.

## Decision

Undecided. Open questions: who may create or change `owner`, `admin` and `editor` accounts (e.g. can an admin create another admin, or demote an owner?), and whether a client can have more than one owner.

## Alternatives considered

None recorded yet.

## Consequences

User management can't be built until this is decided. Until then, accounts other than the seeded dev account can only be created directly in MongoDB.
