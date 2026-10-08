---
title: Authentication
description: Auth endpoints, cookies, roles and permissions, and how frontends and API routes use them.
scope: core
tags: [auth, security, roles, permissions]
order: 4
decisions: ["0020", "0022", "0023"]
---

# Authentication

Sign-in is cookie-based and same-origin. Access tokens are short-lived JWTs, and refresh tokens are random values that rotate on every use and are stored hashed. Frontends never handle tokens directly: the browser sends the cookies, and the current user comes from `GET /api/auth/me`. See [0020](../decisions/0020-authentication.md).

## Endpoints

All are under `/api/auth` and exchange JSON. Errors are `{ "message": "..." }`.

| Method and path | Body | Success | Failure |
| --- | --- | --- | --- |
| `POST /api/auth/login` | `{ email, password }` | `200 { user }`, sets both cookies | `400` invalid body, `401` wrong credentials, `429` after 10 failed attempts per IP in 15 minutes |
| `POST /api/auth/refresh` | none | `200 { user }`, rotates both cookies | `401`, clears both cookies |
| `POST /api/auth/logout` | none | `204`, revokes the refresh token and clears both cookies | n/a |
| `GET /api/auth/me` | none | `200 { user }` | `401` |

`user` matches `userSchema` in `@inithium/shared-contracts`: `id`, `email`, `role`, `passwordChangeRequired`, `createdAt`. It never includes the password hash.

## Cookies

| Cookie | Contains | Path | Lifetime |
| --- | --- | --- | --- |
| `inithium_access` | JWT with `sub` (user id) and `role` | `/api` | `JWT_ACCESS_TTL_MINUTES` (default 15) |
| `inithium_refresh` | Random token (only its SHA-256 is stored) | `/api/auth` | `JWT_REFRESH_TTL_DAYS` (default 30) |

Both are `HttpOnly` and `SameSite=Strict`, and `Secure` when `NODE_ENV=production`.

Each refresh revokes the old refresh token and issues a new one. If an already-revoked token is presented more than 10 seconds after it was revoked, every session for that user is revoked, because the token must have been copied. A role change takes effect at the next refresh.

## Roles and permissions

| Role | CMS access | Notes |
| --- | --- | --- |
| `dev` | Yes | Holds every permission. Can only be set directly in MongoDB, never through the API or CMS. |
| `owner` | Yes | The client's chief point of contact. |
| `admin` | Yes | |
| `editor` | Yes | |
| `user` | No | Default role, for `web` end users. |

| Permission | Granted to |
| --- | --- |
| `cms.access` | `owner`, `admin`, `editor` (and `dev`) |

The permission names are in `permissions.schema.ts` in `@inithium/shared-contracts`, and the role-to-permission matrix is in `@inithium/shared-permissions`. See [0022](../decisions/0022-store-all-users-in-one-collection-with-roles.md).

### Adding a permission

1. Add the name to `permissions` in `core/libs/shared/contracts/src/lib/permissions/permissions.schema.ts`.
2. Grant it to roles in `rolePermissions` in `core/libs/shared/permissions/src/lib/permissions.config.ts`.
3. Protect the API route with `requirePermission('<name>')`.
4. Optionally hide the UI with `hasPermission(user.role, '<name>')`. That only affects what's shown; the API check is what enforces it.

## Protecting an API route

```ts
import { requireAuth, requirePermission, getAuth } from '@inithium/api-auth';

router.get('/profile', requireAuth, (req, res) => {
  const { sub, role } = getAuth(res); // the signed-in user's id and role
});

router.put('/settings', ...requirePermission('cms.access'), handler); // 401 if signed out, 403 if not allowed
```

## Frontend usage

`@inithium/shared-data-access` provides the RTK Query API and its auth endpoints:

- `useGetCurrentUserQuery()`: the signed-in user, or an error with `status: 401`.
- `useLoginMutation()`: on success, puts the user straight into the current-user cache.
- `useLogoutMutation()`: on success, clears every cached response.

Any request that gets a `401` refreshes the session once and retries. Several requests failing at once share one refresh.

The CMS wraps its routes in `CmsAccessGuard` from `@inithium/cms-auth`. The guard redirects signed-out visitors to `/cms/login` and shows a "no access" message to accounts without `cms.access`.

## The dev account

On every startup, the API creates a `dev` user from `SEED_DEV_EMAIL` and `SEED_DEV_PASSWORD` if no dev user exists. It never changes an existing account, and it won't promote a non-dev account that already has that email. The account is created with `passwordChangeRequired: true`. See [0023](../decisions/0023-seed-the-dev-account-on-startup.md).
