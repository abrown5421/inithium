---
id: "0020"
title: Authenticate with short-lived JWTs and rotating refresh tokens in httpOnly cookies
status: accepted
date: "2026-10-07"
scope: core
tags: [auth, security, jwt, cookies]
related: ["0006", "0007", "0022", "0023"]
supersedes: []
---

# 0020. Authenticate with short-lived JWTs and rotating refresh tokens in httpOnly cookies

## Context

The CMS needs authentication before any CMS feature can be built. JWT was the preferred approach, from experience with cross-site authentication. However, every client is served from a single origin ([0006](0006-serve-each-client-from-one-origin.md)), so the API and both frontends share a domain. That removes the cross-site and CORS problems JWTs usually solve and makes first-party cookies available. `jsonwebtoken` was already installed in core.

## Decision

- **Access token:** a JWT (HS256, signed with `JWT_ACCESS_SECRET`) carrying only the user id (`sub`) and `role`. It lives 15 minutes by default and is sent in the `inithium_access` cookie (path `/api`).
- **Refresh token:** a random value, stored only as a SHA-256 hash in the `refreshtokens` collection. It lives 30 days by default and is sent in the `inithium_refresh` cookie (path `/api/auth`). Every refresh rotates it. Presenting an already-rotated token more than 10 seconds after rotation revokes every session the user has.
- **Cookies:** both are `httpOnly` and `SameSite=Strict`, and `Secure` when `NODE_ENV=production`. Frontends never read, store or send tokens themselves.
- **User object:** personalisation comes from `GET /api/auth/me` (into the RTK Query cache), not from the token.
- **Passwords:** hashed with Node's built-in `scrypt`, with the cost parameters stored in each hash.
- **Login:** failed logins are rate-limited to 10 per IP per 15 minutes.
- **Libs:** the API side lives in `@inithium/api-auth` (with users in `@inithium/api-users`), and the frontend side in `@inithium/shared-data-access` and `@inithium/cms-auth`.

## Alternatives considered

- **Server-side sessions stored in MongoDB**: slightly simpler for a single-origin, single-service deployment. JWT was preferred: it is the familiar approach, `jsonwebtoken` was already installed, and it leaves room for non-browser consumers (a mobile app or third-party API) later.
- **Tokens in `localStorage`**: rejected. Any injected script could read them, whereas httpOnly cookies are invisible to JavaScript.
- **Long-lived JWTs without refresh tokens**: rejected. A JWT can't be revoked before it expires, so logout and "sign out everywhere" wouldn't work. Stored refresh tokens provide both.

## Consequences

- No CORS configuration and no allowed-origin env vars: everything is same-origin.
- A role change (e.g. flipping a user to `dev` in Atlas) takes effect at the next refresh, within 15 minutes, because the role is read from the access token.
- Every client needs its own `JWT_ACCESS_SECRET`.
- See [Authentication](../reference/authentication.md) for the endpoints, cookies and frontend usage.
