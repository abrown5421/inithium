---
id: "0023"
title: Seed the dev account on every startup from per-client env vars
status: accepted
date: "2026-10-07"
scope: core
tags: [auth, users, seeding, environment, security]
related: ["0005", "0009", "0022"]
supersedes: []
---

# 0023. Seed the dev account on every startup from per-client env vars

## Context

Every client deployment needs a `dev` account ([0022](0022-store-all-users-in-one-collection-with-roles.md)) so the Inithium developer can sign in. Owner, admin and editor accounts are added later, on the client's behalf, as they're needed. The original plan was a fixed temporary password, `Inithium12345!`, written into the seed. However, core's source code is copied into every client's repository ([0005](0005-give-each-client-their-own-infrastructure.md)), so a password in core would be readable by every client and anyone with access to their repo. Until it was changed, it would give `dev` access to every deployment.

## Decision

- On every startup, after connecting to MongoDB, the API creates a `dev` user **if no user with the `dev` role exists**.
- The email and temporary password come from `SEED_DEV_EMAIL` and `SEED_DEV_PASSWORD`, set per client. Both are required.
- The seed never modifies an existing account: a changed password is never reset. If the email already belongs to a non-dev account, the seed logs a warning and does nothing rather than promoting that account.
- The seeded account is created with `passwordChangeRequired: true`.
- A first-sign-in flow (not built yet) will make an account with a temporary password change it before doing anything else. It will detect that through `passwordChangeRequired`.

## Alternatives considered

- **A fixed temporary password in core**: rejected for the reason above.
- **An explicit command run while provisioning**: rejected in favour of a seed that runs automatically on every deploy.
- **A first-run setup screen in the CMS**: not chosen. Whoever opens a fresh deployment first could claim it.

## Consequences

- Each client's `.env` and Render settings need `SEED_DEV_EMAIL` and a temporary `SEED_DEV_PASSWORD` unique to that client.
- Deleting the dev account recreates it, with the temporary password, on the next startup.
- This is a core seed, not a plugin seed, so it has no unseed; [0019](0019-seed-tracking.md) doesn't apply to it.
- The minimum strength of passwords is still open: [0024](0024-password-policy.md).
