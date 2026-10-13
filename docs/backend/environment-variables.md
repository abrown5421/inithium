---
title: Environment variables
description: Every environment variable the api reads, its default and how it's validated.
scope: core
tags: [environment, config, mongodb, auth]
order: 2
decisions: ["0009", "0010", "0005", "0020", "0023", "0098", "0099"]
---

# Environment variables

Only `@inithium/api-config` reads `process.env`. Everything else calls `loadEnv()`, which validates the environment once against `envSchema` and returns a typed `Env`. If validation fails, the api exits at startup with a list of the problems.

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | | Must start with `mongodb://` or `mongodb+srv://` and include a database name: `.../<database>?...`. |
| `HOST` | No | `localhost` | Interface the api listens on. Set `0.0.0.0` on Render. |
| `PORT` | No | `3000` | Coerced to a positive integer. Render provides it. |
| `NODE_ENV` | No | `development` | `development`, `production` or `test`. Set `production` on Render: auth cookies are only marked `Secure` in production. |
| `JWT_ACCESS_SECRET` | Yes | | Signs access tokens. At least 32 characters; use a different value for every client. |
| `JWT_ACCESS_TTL_MINUTES` | No | `15` | Access token and cookie lifetime. |
| `JWT_REFRESH_TTL_DAYS` | No | `30` | Refresh token and cookie lifetime. |
| `SEED_DEV_EMAIL` | Yes | | Email of the dev account created on startup when no dev user exists. Trimmed and lowercased. |
| `SEED_DEV_PASSWORD` | Yes | | That account's temporary password. Use a different one for every client. |
| `STORAGE_MODE` | No | `database` | Where uploaded files go ([0098](../decisions/0098-store-assets-by-storage-mode-with-a-2-mb-limit.md)): `database` (MongoDB, staff uploads only), `cloud-staff` (R2, staff uploads only) or `cloud-all` (R2, members' avatars and banners too). The cloud modes need the `R2_*` settings below. |
| `STORAGE_DATABASE_QUOTA_MB` | No | `250` | In `database` mode, the most space uploaded files may take, in MB. Uploads past it are refused. |
| `R2_ACCOUNT_ID` | In cloud modes | | The Cloudflare account id, shown on the R2 overview page. Builds the endpoint; not needed with `R2_ENDPOINT`. See [Cloudflare R2](assets.md#cloudflare-r2) ([0099](../decisions/0099-store-cloud-files-in-r2-and-let-members-upload-profile-pictures.md)). |
| `R2_ACCESS_KEY_ID` | In cloud modes | | An R2 API token's access key id (Object Read & Write on the bucket). |
| `R2_SECRET_ACCESS_KEY` | In cloud modes | | That token's secret access key. Unique per client. |
| `R2_BUCKET` | In cloud modes | | The bucket's name, one per site. |
| `R2_ENDPOINT` | No | `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com` | Another S3 endpoint, e.g. `https://<account>.eu.r2.cloudflarestorage.com` for an EU bucket. |
| `R2_PUBLIC_URL` | No | | The bucket's public address (a custom domain). Files then redirect there instead of streaming through the api; add the safety headers at Cloudflare first ([Cloudflare R2](assets.md#cloudflare-r2)). |

The `R2_*` settings are optional in `database` mode (left empty, they count as unset), but keep them while R2 still holds files from a cloud mode, so those stay readable.

`NODE_VERSION=22` is also set on Render, but only to select the Node runtime; the app doesn't read it.

Generate a `JWT_ACCESS_SECRET` with:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Where values come from

| Context | Source |
| --- | --- |
| `npx nx serve api` | `core/.env`, loaded automatically by Nx |
| `node dist/apps/api/main.js` | Pass `--env-file=.env` |
| Render | The service's Environment settings |

`core/.env` is git-ignored. `core/.env.example` is committed and is the template for every `.env` and every set of Render env vars.

## Adding a variable

1. Add it to `envSchema` in `core/libs/api/config/src/lib/env.schema.ts`.
2. Add it, with a comment, to `core/.env.example`.
3. Read it from `loadEnv()`, never from `process.env`.
4. Add a row to the table above.

## Connection strings

`mongodb+srv://` strings need an SRV DNS lookup. On Windows with a VPN, Node's resolver can fail with `querySrv ECONNREFUSED`. Use Atlas's standard connection string locally instead, which connects to the same cluster:

```
mongodb://host1,host2,host3/<database>?tls=true&replicaSet=…&authSource=admin
```
