---
id: "0024"
title: Decide the password policy
status: proposed
date: "2026-10-07"
scope: core
tags: [auth, security, passwords]
related: ["0020", "0023"]
supersedes: []
---

# 0024. Decide the password policy

## Context

Passwords are hashed with `scrypt` ([0020](0020-authentication.md)), but nothing yet constrains what a password can be. `SEED_DEV_PASSWORD` only has to be non-empty. The planned first-sign-in flow, which makes accounts with a temporary password change it ([0023](0023-seed-the-dev-account-on-startup.md)), will be the first place a user chooses a password.

## Decision

Undecided. Open questions: minimum length and any character requirements, whether to check passwords against known-breached lists, and whether the same rules apply to `SEED_DEV_PASSWORD`.

## Alternatives considered

None recorded yet.

## Consequences

The first-sign-in password change flow can't validate new passwords until this is decided.
