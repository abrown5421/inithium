---
title: Users
description: The users collection, covering its fields and roles, the user service functions, profiles and how plugins relate to users.
scope: core
tags: [users, roles, mongodb, backend]
order: 5
decisions: ["0022", "0024", "0025", "0026", "0074"]
---

# Users

Every account, whether CMS staff or `web` end users, lives in one `users` collection, told apart by its **role** ([0022](../decisions/0022-store-all-users-in-one-collection-with-roles.md)). Sign-in, cookies and permissions are covered in [Authentication](authentication.md).

## The user document

`UserModel` in `@inithium/api-users`:

| Field | Type | Notes |
| --- | --- | --- |
| `email` | string | Unique, stored lowercase and trimmed |
| `passwordHash` | string | scrypt hash. **Never returned by queries** unless selected with `+passwordHash`. |
| `role` | `'dev'`, `'owner'`, `'admin'`, `'editor'`, `'user'` | Default `'user'` |
| `passwordChangeRequired` | boolean | Default `false`; `true` on accounts created with a temporary password |
| `createdAt`, `updatedAt` | Date | Set automatically |

What the API returns is the **`User`** shape from `@inithium/shared-contracts`:
- `id`, `email`, `role`, `passwordChangeRequired`, `createdAt` (ISO);
- never the password hash.

`toUser(document)` converts a stored user to it.

## Roles

| Role | Who | CMS access |
| --- | --- | --- |
| `dev` | The Inithium developer; holds every permission | Yes |
| `owner` | The client's main point of contact | Yes |
| `admin` | Client staff | Yes |
| `editor` | Client staff, semi-restricted | Yes |
| `user` | `web` end users (the default) | No |

`dev` can never be assigned through the API or CMS, only directly in MongoDB. The full permission matrix is in [Authentication](authentication.md#roles-and-permissions).

## Service functions

From `@inithium/api-users`:

| Function | Returns |
| --- | --- |
| `findUserById(id)` | The user, or `null` (also for an invalid id) |
| `findUserByEmailWithPassword(email)` | The user including `passwordHash`, for verifying a login |
| `userExistsWithEmail(email)` | `boolean` |
| `userExistsWithRole(role)` | `boolean` |
| `createUser({ email, passwordHash, role, passwordChangeRequired? })` | The new user |
| `toUser(document)` | The `User` shape the API returns |

## Creating accounts

- **The dev account** is created automatically on startup ([Authentication](authentication.md#the-dev-account)).
- **Owner, admin and editor accounts** will be created from the CMS once user management exists. That's blocked on deciding who may assign which roles ([0025](../decisions/0025-role-assignment-rules.md)). Until then, other accounts can only be created directly in MongoDB, and their `passwordHash` must be a valid scrypt hash.
- **A first-sign-in password change** for accounts with `passwordChangeRequired` is planned. It's blocked on the password policy ([0024](../decisions/0024-password-policy.md)).

## Profiles (planned)

Avatars and profile banners will live in a `profile` subdocument, kept separate from the authentication fields ([0074](../decisions/0074-generate-banners-as-our-own-poly-pattern.md)). Each image is either a generator recipe (Dicebear for avatars; for banners, a [PolyBanner](../ui-library/composites/poly-banner.md) recipe) or an uploaded asset, and falls back to the generated image when there's none. Not built yet.

## Plugins and users

Plugins never add fields to `users`. A plugin stores per-user data in its own collections with a `userId`, and serves it from its own endpoints ([0026](../decisions/0026-plugins-keep-user-data-in-their-own-collections.md)).
