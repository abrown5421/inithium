---
id: "0100"
title: Manage accounts from the CMS, with a shared temporary password and plugin deletion hooks
status: accepted
date: "2026-10-13"
scope: core
tags: [users, roles, permissions, cms, auth, plugins]
related: ["0015", "0022", "0023", "0025", "0026", "0088", "0090"]
supersedes: []
---

# 0100. Manage accounts from the CMS, with a shared temporary password and plugin deletion hooks

## Context

Until now only sign-ups and the seeded dev account existed. Owner, admin and editor accounts could only be made in MongoDB ([0025](0025-role-assignment-rules.md) was open). The user asked for a CMS module where staff create accounts as sign-up does, raise or lower their roles, and delete them one at a time or in bulk. Plugins keep their own per-user data ([0026](0026-plugins-keep-user-data-in-their-own-collections.md)), so deleting an account must reach them without core knowing which plugins exist; the "user deleted" hook was still open in the slot catalogue ([0015](0015-slot-catalogue.md)).

## Decision

**Who may give which role** (settles 0025):
- An account may give any role **up to and including its own**, never `dev`. Owners make owners, admins make admins, editors make editors and members, and nobody makes someone more senior than themselves.
- An account may change or delete only accounts **at its own level or below**.
- Nobody changes their own role or deletes their own account through the CMS.
- The **last owner** can't be demoted or deleted. A site may have several owners.
- `dev` accounts are hidden from everyone but dev.

**Permissions:**
- `users.view` and `users.create`: owner, admin, editor.
- `users.edit` (names, role, password reset) and `users.delete`: owner, admin.
- So editors can only see and create accounts.

**Creating accounts:**
- New accounts go through `createUser()`, so they get the same generated initials avatar on `primary` and random banner as a sign-up.
- Each new account records `createdBy`.
- Every new account starts on **one shared temporary password, `USER_TEMP_PASSWORD`**, which must meet the password policy. Accounts must change it on first sign-in, like the dev account ([0088](0088-make-temporary-passwords-change-on-first-sign-in.md)).
- A password reset puts the account back on the same password.
- Without the variable, creating accounts and resets are off.
- The user accepted the risk that everyone who creates accounts knows this password, and anyone who knows it and a new account's email can sign in as that account until it is changed.

**Sessions:** a role change, reset or deletion signs the account out everywhere **at once**. Its refresh tokens are revoked, and access tokens issued up to that second are refused. The revocation list is kept in memory for one access-token lifetime.

**Deleting accounts:**
- One account or many at once, up to 100 per request. Each is checked; the ones refused are reported with the reason, and the rest are deleted.
- Order for the allowed accounts:
  1. Every **`UserDeletionHook`** registered in the api's registry (`apps/api/src/app/plugins.registry.ts`, shipped empty) removes its plugin's data.
  2. Core ends their sessions.
  3. Core deletes the avatars and banners they uploaded.
  4. Core deletes the records.
- **If a hook fails, nothing in that batch is deleted**, and the CMS reports why. Hooks must therefore be safe to run again.
- Files staff uploaded are site content and stay.

**Screen:** a Users screen in the CMS lists accounts 25 per page from the server, searchable and filterable by role. Each row's checkbox selects it for bulk deletion. A details modal edits names and role and resets the password.

## Alternatives considered

- **A temporary password generated per account and shown once**: offered as safer; the user chose the shared `.env` password, like the dev account.
- **Letting a deletion go ahead when a hook fails, and logging it**: rejected, since it leaves plugin data with no owner.
- **Letting role changes take effect when the 15-minute access token expires**: rejected in favour of signing the account out at once.
- **Editors changing roles or deleting accounts**: rejected; editors only create accounts.

## Consequences

- The api has a registry file of its own, for deletion hooks now and other api slots later.
- A hook that already ran before another failed may have removed its data for accounts that still exist. Running the delete again finishes the job.
- An api restart forgets revocations, so an access token issued before a role change could work until it expires (15 minutes at most).
- There is no audit log beyond `createdBy`.
