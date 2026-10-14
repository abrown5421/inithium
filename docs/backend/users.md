---
title: Users
description: The users collection, covering its fields and roles, the user service functions, profiles and how plugins relate to users.
scope: core
tags: [users, roles, mongodb, backend]
order: 5
decisions: ["0022", "0024", "0025", "0026", "0074", "0075", "0090", "0098", "0099", "0100"]
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
| `profile` | `{ firstName?, lastName?, bio?, avatar, banner }` | Profile data, apart from the auth fields. Every account has one, with a generated avatar and banner ([Profiles](profiles.md)). |
| `createdAt`, `updatedAt` | Date | Set automatically |

What the API returns is the **`User`** shape from `@inithium/shared-contracts`:
- `id`, `email`, `role`, `passwordChangeRequired`, `profile`, `createdAt` (ISO);
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
| `findUserByIdWithPassword(id)` | The user including `passwordHash`, for checking the current password |
| `createUser({ email, passwordHash, role, passwordChangeRequired?, names?, createdBy? })` | The new user, always with a generated avatar and banner ([Profiles](profiles.md#generated-on-creation)) |
| `toUser(document)` | The `User` shape the API returns |
| `toPublicProfile(document, { owner })` | The `PublicProfile` shape, with the email only for its owner |
| `toManagedUser(document)` | The `ManagedUser` shape the CMS's Users screen gets |
| `listUsers({ skip, limit, search?, role?, excludeRoles? })` | A page of users, newest first, and the total; every word of `search` must appear in the email or names |
| `findUsersByIds(ids)`, `countUsersWithRole(role)` | For bulk deletion and the last-owner check |
| `deleteUserRecords(ids)` | Deletes the records only; use user management's deletion, which removes everything else first |
| `updateUserProfile(document, changes)` | The user with a validated profile edit applied |
| `backfillUserProfiles()` | Gives accounts without a stored avatar or banner their generated ones; runs on every api start |

## Creating accounts

- **The dev account** is created automatically on startup ([Authentication](authentication.md#the-dev-account)).
- **Any account, including owners, admins and editors,** can be created from the CMS's Users screen, on the site's temporary password ([User management](user-management.md), [0100](../decisions/0100-manage-accounts-from-the-cms.md)). Created accounts record `createdBy`.
- **`user` accounts** are created by signing up on `web` ([Authentication](authentication.md#sign-up-and-the-password-policy)).
- **Accounts with `passwordChangeRequired`** must choose their own password, meeting the policy ([0024](../decisions/0024-password-policy.md)), before doing anything else ([Authentication](authentication.md#temporary-passwords)).

## Profiles

The `profile` subdocument holds profile data, kept apart from the authentication fields: optional `firstName`, `lastName` (set at sign-up, [0083](../decisions/0083-let-visitors-sign-up-for-user-accounts.md)) and `bio` (rich text, [0102](../decisions/0102-edit-rich-text-fields-with-tiptap-and-store-json.md)), plus the `avatar` and `banner` recipes every account gets when it's created. [Profiles](profiles.md) covers them, the profile API and the Profile page.

`userDisplayName(user)` from `@inithium/shared-contracts` gives the name to show a user for themselves: first and last name, or their email when they have none. Others see `publicProfileName(profile)`, which says "Member" instead of ever showing the email.

An uploaded picture may replace either (`profile.avatarAssetId`, `profile.bannerAssetId`) in the `cloud-all` storage mode, with the recipe kept as its fallback ([Profiles](profiles.md#uploaded-pictures), [0099](../decisions/0099-store-cloud-files-in-r2-and-let-members-upload-profile-pictures.md)). `findUsersWithProfileImage()` and `clearProfileImage()` find and clear the profiles showing an asset.

## Plugins and users

Plugins never add fields to `users`. A plugin stores per-user data in its own collections with a `userId`, and serves it from its own endpoints ([0026](../decisions/0026-plugins-keep-user-data-in-their-own-collections.md)).
