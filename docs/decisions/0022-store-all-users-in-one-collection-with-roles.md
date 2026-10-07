---
id: "0022"
title: Store all users in one collection, with roles mapped to a permission matrix
status: accepted
date: "2026-10-07"
scope: core
tags: [auth, users, roles, permissions]
related: ["0020", "0023", "0025"]
supersedes: []
---

# 0022. Store all users in one collection, with roles mapped to a permission matrix

## Context

Core has two kinds of users: people who manage a client's site in the CMS, and end users of the `web` engagement platform. Each needs different capabilities, and plugins (e.g. `ecom`, `friends`) will need to reference users.

## Decision

- All users live in a single `users` collection, distinguished by a `role` field.
- The roles are, from most to least privileged:

  | Role | Who | Access |
  | --- | --- | --- |
  | `dev` | The Inithium developer | Every permission. |
  | `owner` | The client's chief point of contact | Total permissions across the CMS and `web`. |
  | `admin` | Client staff | Most permissions. |
  | `editor` | Client staff | Semi-restricted by default. |
  | `user` | `web` end users (the default role) | No CMS access at all. |

- Roles map to permissions through a permission matrix in `@inithium/shared-permissions`, with the permission names in `@inithium/shared-contracts`. `dev` holds every permission and isn't listed in the matrix.
- The matrix starts minimal: the only permission is `cms.access` (held by `owner`, `admin` and `editor`). Admin and editor differences are added as each CMS feature is built.
- The `dev` role can't be assigned through the API or CMS by anyone, including owners and admins. The only way to make a dev user is to change the role directly in MongoDB (e.g. in the Atlas UI).
- The API is the authority: routes check permissions with `requirePermission()`. Frontends use `hasPermission()` only to decide what to show.

## Alternatives considered

- **Separate collections for CMS users and end users**: rejected. It needs two auth flows, two models and two sets of checks, and breaks down when one email is both a customer and a staff member. Plugins would also have to reference two kinds of user. The same separation comes from checking roles on the server and never letting a public endpoint set a role.
- **Defining a full permission matrix up front**: rejected. No CMS features exist yet, so admin/editor differences would be guesses.

## Consequences

- One login endpoint serves every role. The CMS refuses `user` accounts after sign-in, because they lack `cms.access`.
- Adding a permission means adding it to `permissions` in `@inithium/shared-contracts` and to the matrix, then checking it with `requirePermission()` on the API.
- Which roles may assign which other roles is still open: [0025](0025-role-assignment-rules.md).
