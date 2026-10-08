---
title: Getting started
description: Run core locally, connected to MongoDB, with all three apps.
scope: core
tags: [setup, local-development]
order: 1
decisions: ["0006", "0009", "0010", "0020", "0023"]
---

# Getting started

This guide runs `api`, `web` and `cms` locally against a MongoDB database.

## Prerequisites

- Node 22 or later
- A MongoDB connection string that includes a database name

## 1. Install

```sh
cd core
npm install
```

## 2. Configure the environment

Copy the template:

```sh
cp .env.example .env
```

Then fill in:

- `MONGODB_URI`: must name a database, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/inithium`. If it doesn't, the api refuses to start.
- `JWT_ACCESS_SECRET`: generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.
- `SEED_DEV_EMAIL` and `SEED_DEV_PASSWORD`: the dev account the api creates on first startup. This is the account you sign in to the CMS with.

See [Environment variables](../backend/environment-variables.md).

## 3. Start the apps

Run each in its own terminal:

```sh
npx nx serve api   # http://localhost:3000/api
npx nx serve web   # http://localhost:5173/
npx nx serve cms   # http://localhost:5174/cms/
npx nx serve docs  # http://localhost:5175/ (this manual)
```

The api logs `[ db ] connected to "<database>"`, then `[ seed ] created dev user <email>` (first startup only), then `[ ready ] http://localhost:3000`. If it can't connect or the environment is invalid, it logs `[ startup failed ]` and exits.

Open http://localhost:5174/cms/. You'll be sent to the sign-in page; sign in with `SEED_DEV_EMAIL` and `SEED_DEV_PASSWORD`. See [Authentication](../backend/authentication.md).

The Vite dev servers proxy `/api` to port 3000, so both frontends reach the API with relative URLs, the same way they will in production. See [Routing and hosting](../reference/routing-and-hosting.md).

## 4. Verify before committing

```sh
npx nx run-many -t lint typecheck build
```

If something fails to start, see [Commands: Troubleshooting](../reference/commands.md#troubleshooting).
