---
id: "0088"
title: Make accounts with a temporary password change it before doing anything else, enforced by the API
status: accepted
date: "2026-10-12"
scope: core
tags: [auth, security, passwords, cms, web]
related: ["0020", "0023", "0024", "0083"]
supersedes: []
---

# 0088. Make accounts with a temporary password change it before doing anything else, enforced by the API

## Context

Accounts created with a temporary password, such as the seeded dev account ([0023](0023-seed-the-dev-account-on-startup.md)), carry `passwordChangeRequired`. They must choose their own password before doing anything else. That was blocked on the password policy, now decided ([0024](0024-password-policy.md)).

## Decision

- **The API enforces it.** The access token carries the flag ([0020](0020-authentication.md)), and `requireAuth` answers `403 { code: 'PASSWORD_CHANGE_REQUIRED' }` to such a session, so no protected route works until the password changes. `requireSession` accepts it, for `GET /api/auth/me` and the change itself; signing out and refreshing still work.
- **`POST /api/auth/change-password`** `{ currentPassword, newPassword }` (`changePasswordRequestSchema`):
  - checks the current password (a wrong one is a 400 naming the field, not a 401, so the client doesn't try to refresh);
  - requires the new one to meet the policy and differ from the current one;
  - clears the flag, signs out every other session, issues fresh cookies and returns the user.
- **Both apps show one screen** until it's done: `PasswordChangeScreen` (`@inithium/shared-auth-ui`), a card on the dark backdrop with the current password, a new one (with the policy as helper text) and its confirmation, plus "Sign out instead". Problems show like every form's ([0083](0083-let-visitors-sign-up-for-user-accounts.md)). The CMS shows it after its access check; `web`'s shell shows it in place of the site.

## Alternatives considered

- **Enforcing it only in the apps:** the API would still answer a flagged session's requests.

## Consequences

- The same endpoint and screen can serve a voluntary password change later, e.g. from a profile.
- Accounts created by sign-up never carry the flag.
