---
id: "0025"
title: Decide which roles may assign which roles
status: accepted
date: "2026-10-13"
scope: core
tags: [auth, users, roles, permissions]
related: ["0022", "0100"]
supersedes: []
---

# 0025. Decide which roles may assign which roles

## Context

The `dev` role can never be assigned through the API or CMS ([0022](0022-store-all-users-in-one-collection-with-roles.md)). Owner, admin and editor accounts will be added on the client's behalf as they're needed, which requires user-management endpoints and screens. Those don't exist yet.

## Decision

Settled with user management ([0100](0100-manage-accounts-from-the-cms.md)):

- An account may give any role up to and including its own, never `dev`: owners make owners, admins make admins, editors make editors and members.
- It may change or delete only accounts at its own level or below. So admins can demote other admins but never touch owners.
- Nobody changes their own role or deletes their own account through the CMS.
- A client may have several owners. The last owner can't be demoted or deleted.
- `dev` stays unassignable, and dev accounts are hidden from everyone but dev.

## Alternatives considered

None recorded.

## Consequences

The CMS's Users screen and `/api/users` follow these rules; `assignableRoles()` and `canManageRole()` in `@inithium/shared-permissions` encode them, so the api and the CMS agree.
