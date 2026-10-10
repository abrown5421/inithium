---
id: "0024"
title: Require 10 characters with upper and lower case, a number and a special character
status: accepted
date: "2026-10-10"
scope: core
tags: [auth, security, passwords]
related: ["0020", "0023", "0083"]
supersedes: []
---

# 0024. Require 10 characters with upper and lower case, a number and a special character

## Context

Passwords are hashed with `scrypt` ([0020](0020-authentication.md)), but nothing yet constrains what a password can be. `SEED_DEV_PASSWORD` only has to be non-empty. The planned first-sign-in flow, which makes accounts with a temporary password change it ([0023](0023-seed-the-dev-account-on-startup.md)), will be the first place a user chooses a password.

## Decision

A password someone chooses must have:

- at least 10 characters;
- a lowercase letter and an uppercase letter;
- a number;
- a special character (anything that isn't a letter or a number).

It's `newPasswordSchema` in `@inithium/shared-contracts` (with `passwordPolicy` and `passwordPolicyHint`), checked in the form and again by the API. It applies wherever a password is chosen: sign-up now ([0083](0083-let-visitors-sign-up-for-user-accounts.md)), and the first-sign-in password change when it's built. Signing in only requires a password, since existing ones may predate the policy.

## Alternatives considered

None recorded.

## Consequences

- The first-sign-in password change flow is no longer blocked on the policy.
- **Still undecided:** checking passwords against known-breached lists, and whether `SEED_DEV_PASSWORD` must meet the policy (today it only has to be non-empty).
