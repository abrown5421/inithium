# Inithium core

The base of an Inithium site: an [Nx](https://nx.dev) workspace with three apps that deploy together as one web service.

| App | Serves | Dev URL |
| --- | --- | --- |
| `api` | The API under `/api`, the only thing that talks to MongoDB; in production it also serves both frontends | http://localhost:3000/api |
| `web` | The public site at `/`, built at runtime from the pages and settings managed in the CMS | http://localhost:5173/ |
| `cms` | The client portal at `/cms`, for pages and site settings | http://localhost:5174/cms/ |

Business logic lives in libs under `libs/` (`api/`, `web/`, `cms/`, `shared/`). Installed plugins land in `libs/plugins/`, and a client's one-off code goes in `libs/client/`.

## Getting started

You need Node 22 and a MongoDB database (MongoDB Atlas works well).

```sh
npm install
cp .env.example .env   # then fill it in: the comments explain each variable
```

`.env` is git-ignored. `MONGODB_URI` must include the database name after the host.

Then run each app in its own terminal:

```sh
npx nx serve api
npx nx serve web
npx nx serve cms
```

On first start the api creates a `dev` account from `SEED_DEV_EMAIL` and `SEED_DEV_PASSWORD`, the default site settings and the core pages (Home, Profile, Login, Sign up, Not Found). Sign in to the CMS with the dev account; you'll be asked to replace the temporary password before anything else.

## Checking a change

```sh
npx nx run-many -t lint typecheck build
```

## Deploying

Each site is one Render web service:

| Setting | Value |
| --- | --- |
| Root directory | `core` |
| Build command | `npm ci --include=dev && npx nx run-many -t build --projects=api,web,cms` |
| Start command | `node dist/apps/api/main.js` |
| Health check path | `/api/health` |
| Environment | `MONGODB_URI`, `NODE_ENV=production`, `HOST=0.0.0.0`, `NODE_VERSION=22`, `JWT_ACCESS_SECRET`, `SEED_DEV_EMAIL`, `SEED_DEV_PASSWORD` (Render provides `PORT`) |

Use a unique `JWT_ACCESS_SECRET` and temporary `SEED_DEV_PASSWORD` for every site.

## In a client's repository

Core reaches client sites through upstream merges, so keep core's files unedited:

- **Configure** what you can in the CMS (pages, menus, title, logo, colours).
- **Add features** as plugins in `libs/plugins/`.
- **Put one-off code** in `libs/client/`, registered through the apps' registry files (e.g. `apps/web/src/app/plugins.registry.ts`), which can also replace a core page's template by its key.

## Licences

- **Fonts:** Bruno Ace SC and Merriweather Sans are under the SIL Open Font License 1.1. Their licences are in `libs/shared/ui-theme/src/fonts/`.
- **Avatars:** avatars are drawn by [DiceBear](https://www.dicebear.com) (MIT). Most of its styles used here are CC0; two need credit, which the avatar editor also shows:
  - **Glyphs** is a remix of "Abstract Avatars for All Creative Profile Use" by Matt Houser, CC BY 4.0;
  - **Bottts** is a remix of "Bottts" by Pablo Stanley, free for personal and commercial use.
