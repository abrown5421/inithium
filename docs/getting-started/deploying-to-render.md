---
title: Deploying to Render
description: Step by step, deploying Inithium (or a client's copy) as one Render web service, and checking it works.
scope: core
tags: [deployment, render, hosting]
order: 4
decisions: ["0006", "0089"]
---

# Deploying to Render

Each site runs as **one Render web service**: the api serves the API under `/api`, `web` at `/` and the CMS at `/cms`, all from the same origin ([0006](../decisions/0006-serve-each-client-from-one-origin.md)). Inithium's own deploys use your personal Render and Atlas accounts; each client's use theirs ([Client repositories](../architecture/client-repositories.md#provisioning-a-client)).

The settings below have been verified in a fresh clone, a production-mode local run ([0089](../decisions/0089-build-for-render-with-dev-dependencies-and-a-health-check.md)) and a first deploy on Render, where the build completed and sign-in, uploads and the Media library worked.

## Before you start

- **The repo** is on GitHub, and Render can see the account it's on.
- **A MongoDB database** exists, and you have its connection string. Include the database name after the host. In Atlas, also allow Render's outbound IPs (or `0.0.0.0/0`) under Network Access.
- **Two secrets** are generated, both unique to this site:
  - a `JWT_ACCESS_SECRET` of 32+ characters, e.g. from `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`;
  - a temporary `SEED_DEV_PASSWORD`, which you'll change on first sign-in.

## 1. Create the web service

In Render, choose **New → Web Service** and connect the repo. Then set:

| Setting | Value |
| --- | --- |
| Language | Node |
| Branch | `main` |
| Root directory | `core` |
| Build command | `npm ci --include=dev && npx nx run-many -t build --projects=api,web,cms` |
| Start command | `node dist/apps/api/main.js` |
| Health check path | `/api/health` (under Advanced) |

**Why this build command:**
- `--include=dev` installs Nx and the build tools, which `npm ci` would otherwise skip because `NODE_ENV=production`.
- `--projects=api,web,cms` leaves out the manual's viewer, which a site never serves.

## 2. Set the environment variables

Under **Environment**, add:

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | The connection string, including the database name |
| `NODE_ENV` | `production` (auth cookies are only `Secure` in production) |
| `HOST` | `0.0.0.0` (Render routes to all interfaces) |
| `NODE_VERSION` | `22` |
| `JWT_ACCESS_SECRET` | Your generated secret |
| `SEED_DEV_EMAIL` | The dev account's email |
| `SEED_DEV_PASSWORD` | The temporary password |

Render provides `PORT`. The full list, with optional variables, is on [Environment variables](../backend/environment-variables.md).

## 3. Deploy and check

Create the service. The build takes a few minutes. When it's live, the log ends with:

```
[ db ] connected to "<database>"
[ seed ] created dev user …        (first deploy only)
[ seed ] created default site settings
[ seed ] created page 'home' at /  (and the other core pages)
[ ready ] http://0.0.0.0:<port>
```

Then check, on the service's URL:

1. `/api/health` answers `{"status":"ok","database":"connected"}`.
2. `/` shows the site, titled "Inithium" with its logo.
3. `/cms` shows the CMS sign-in. Sign in as the dev account. You'll be asked to choose a new password ([Temporary passwords](../backend/authentication.md#temporary-passwords)); then the Dashboard opens.
4. In the CMS, set the site's title, logo and colours under **Settings**, and check them on `/` after a reload.
5. On `/sign-up`, create an end-user account. Reload the page and you should stay signed in, which shows the cookies work.

## If sign-in fails with 401

`SEED_DEV_EMAIL` and `SEED_DEV_PASSWORD` only create the dev account when the database has **no dev user yet**; an existing account is never changed. If `MONGODB_URI` points at a database that already has one (e.g. the one you use locally, or an earlier deploy's), the log has no `[ seed ] created dev user` line and the env var's password doesn't work. Sign in with that account's own password, or give the deploy its own database (change the name in `MONGODB_URI`) and redeploy.

Also check the password in Render's field has no trailing space or quotes: it's used exactly as entered.

## Still to confirm

- **Proxy:** Express `trust proxy` is `1`, assuming one proxy in front of the api. Check that login rate limiting sees visitors' own addresses, not the proxy's: after 10 failed sign-ins from one browser, the 11th is refused, while another network can still sign in.

## Updating

Pushing to `main` redeploys automatically. Seeds run on every start but never change what the CMS edits ([Pages](../backend/pages.md#seeding)).
