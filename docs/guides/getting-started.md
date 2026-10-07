---
title: Getting started
description: Run core locally, connected to MongoDB, with all three apps.
scope: core
tags: [setup, local-development]
order: 1
decisions: ["0006", "0009", "0010"]
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

Copy the template and fill in `MONGODB_URI`:

```sh
cp .env.example .env
```

The URI must name a database, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/inithium`. If it doesn't, the api refuses to start. See [Environment variables](../reference/environment-variables.md).

## 3. Start the apps

Run each in its own terminal:

```sh
npx nx serve api   # http://localhost:3000/api
npx nx serve web   # http://localhost:5173/
npx nx serve cms   # http://localhost:5174/cms/
```

The api logs `[ db ] connected to "<database>"` and then `[ ready ] http://localhost:3000`. If it can't connect, it logs `[ startup failed ]` and exits.

The Vite dev servers proxy `/api` to port 3000, so both frontends reach the API with relative URLs, the same way they will in production. See [Routing and hosting](../reference/routing-and-hosting.md).

## 4. Verify before committing

```sh
npx nx run-many -t lint typecheck build
```

If something fails to start, see [Commands: Troubleshooting](../reference/commands.md#troubleshooting).
