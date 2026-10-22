---
title: User management
description: Creating, changing and deleting accounts from the CMS - the role rules, the temporary password, signing accounts out, and the deletion hooks plugins use.
scope: core
tags: [users, roles, permissions, cms, plugins]
order: 11
decisions: ["0100", "0025", "0015", "0088"]
---

# User management

Staff manage accounts on the CMS's [Users screen](../architecture/cms.md#users), through `/api/users` in `@inithium/api-user-management` ([0100](../decisions/0100-manage-accounts-from-the-cms.md)). Sign-ups and the seeded dev account work as before ([Authentication](authentication.md)).

## Who may do what

One rule covers every role change ([0025](../decisions/0025-role-assignment-rules.md)): **an account may give any role up to and including its own, never `dev`**, and may change or delete only accounts **at its own level or below**.

| Role | Sees accounts | Creates | Changes names and roles, resets passwords | Deletes |
| --- | --- | --- | --- | --- |
| dev | Everyone | Any role but dev | Everyone but dev | Everyone but dev |
| owner | Everyone but dev | Owners and below | Owners and below | Owners and below |
| admin | Everyone but dev | Admins and below | Admins and below | Admins and below |
| editor | Everyone but dev | Editors and members | — | — |

- **Yourself:** nobody changes their own role, resets their own password or deletes their own account here. Your password is changed from your profile.
- **The last owner** can't be demoted or deleted. A site may have several owners.
- **Dev accounts** are hidden from everyone but dev: they're left out of the list and answer 404.

The permissions are `users.view` and `users.create` (owner, admin, editor) and `users.edit` and `users.delete` (owner, admin) ([Authentication](authentication.md#roles-and-permissions)). `assignableRoles(role)` and `canManageRole(actor, target)` in `@inithium/shared-permissions` encode the rule, so the api and the CMS agree.

## The temporary password

Every account created here, and every password reset, gets **the site's temporary password**: `USER_TEMP_PASSWORD` ([Environment variables](environment-variables.md)). It must meet the password policy, or the api won't start.

- The account is marked `passwordChangeRequired`, so after signing in it can only choose a new password, exactly like the dev account ([Temporary passwords](authentication.md#temporary-passwords)).
- Tell the person their email and the temporary password yourself; there's no email sending yet.
- **The password is shared.** Everyone who creates accounts knows it, and anyone who knows it and a new account's email can sign in as that account until it's changed. Use a strong value, unique to the site, and keep it out of chat logs.
- Without `USER_TEMP_PASSWORD`, creating accounts and resetting passwords are switched off: the api answers 409, and the CMS shows why.

New accounts go through `createUser()`, so they get the same generated initials avatar on `primary` and random banner as a sign-up ([Profiles](profiles.md#generated-on-creation)). Each one records `createdBy`, the id of the account that created it.

## Signing accounts out

Changing an account's role, resetting its password or deleting it signs it out everywhere **at once**:

- `revokeSessions(userId)` from `@inithium/api-auth` revokes its refresh tokens;
- it also refuses its access tokens issued up to that second, so the change doesn't wait for the 15-minute token to expire.

The refused tokens are tracked in memory for one access-token lifetime. An api restart forgets them, which reopens that short window.

## Deleting accounts

`POST /api/users/delete` takes one id or up to 100. Each is checked against the rules above. Refused ones come back in `failed` with the account's name and the reason; the rest are deleted in this order:

1. **Plugins' data:** every `UserDeletionHook` in the api registry runs with the batch's ids ([below](#plugin-deletion-hooks)).
2. **Sessions:** their access tokens are refused and their refresh tokens removed (`endSessionsOfDeletedUsers()`).
3. **Their pictures:** the avatars and banners they uploaded are deleted (`deleteMemberUploads()`, [Assets](assets.md#members-pictures)). Files staff uploaded for the site stay.
4. **Their CMS dashboards** (`deleteDashboardsOfUsers()`, [The CMS dashboard](dashboard.md)).
5. **The records.**

If any hook fails, **nothing in that batch is deleted**, and every account in it comes back in `failed` saying which data couldn't be removed. Deleting again finishes the job.

### Plugin deletion hooks

A plugin (or `libs/client/`) that keeps data about users removes it with a hook, the "user deleted" slot ([0015](../decisions/0015-slot-catalogue.md)):

```ts
// apps/api/src/app/plugins.registry.ts (written by the install tooling; core ships it empty)
import type { UserDeletionHook } from '@inithium/api-user-management';
import { ecomUserDeletion } from '@inithium/plugin-ecom-api';

export const registeredUserDeletionHooks: UserDeletionHook[] = [ecomUserDeletion];
```

```ts
// In the plugin's api lib
export const ecomUserDeletion: UserDeletionHook = {
  key: 'ecom',
  label: 'orders and addresses',
  async deleteUserData(userIds) {
    await AddressModel.deleteMany({ userId: { $in: userIds } });
    await OrderModel.deleteMany({ userId: { $in: userIds } });
  },
};
```

- **Make it safe to repeat.** A hook may run again for the same ids, after another hook failed. `deleteMany` already is.
- **Throw if it can't finish.** The accounts then stay, and the CMS shows "Their `label` couldn't be removed".
- Hooks run one after another, in registry order, before core removes anything.

## API

Mounted at `/api/users`:

| Route | Permission | Body | Answers |
| --- | --- | --- | --- |
| `GET /info` | `users.view` | | `UserManagementInfo` `{ tempPasswordSet }` |
| `GET /` | `users.view` | Query `page` (from 1), `pageSize` (25, at most 100), `q` (every word in the name or email), `role` | `UserListResponse` `{ users: ManagedUser[], total, page, pageSize }`, newest first |
| `POST /` | `users.create` | `CreateUserRequest` `{ firstName, lastName?, email, role }` | `201` `ManagedUser`; `409` `email` taken or no temporary password; `403` `role` not yours to give |
| `PATCH /:id` | `users.edit` | `UpdateUserRequest` `{ firstName?, lastName?, role? }` (empty `lastName` removes it) | `ManagedUser`; `403` more senior or your own role; `409` the last owner |
| `POST /:id/reset-password` | `users.edit` | | `ManagedUser`; `403` yourself or more senior |
| `POST /delete` | `users.delete` | `DeleteUsersRequest` `{ ids }` (1–100) | `DeleteUsersResponse` `{ deleted: string[], failed: { id, name, reason }[] }` |

`ManagedUser` is `{ id, email, role, firstName?, lastName?, avatar, avatarAssetId?, passwordChangeRequired, createdBy?, createdAt }`. All of these contracts are in `@inithium/shared-contracts`; the frontends call them through the hooks in [Calling the API](calling-the-api.md) (`useGetUsersQuery()` and the rest, in `@inithium/shared-data-access`).
