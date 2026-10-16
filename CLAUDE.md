# Inithium — Architecture & Working Guidelines

Inithium is a template-and-plugins ecosystem. Every client application starts as a clone of **core**, and features that not every client needs are added as **plugins**. These guidelines exist to keep that architecture intact as the codebase grows. When a request conflicts with them, stop and raise it. Do not quietly work around them.

> **Do not guess.** If a task depends on an unresolved decision (see [Open decisions](#open-decisions)) or anything else that isn't specified here, ask before you implement.

---

## 1. Ecosystem: the root directories

```
inithium/
  core/      Clonable Nx monorepo. The base of every client app. Contains zero plugin code.
  plugins/   Library of installable/ejectable plugins that extend core through slots.
  sandbox/   Tooling that rebuilds a replica of core with every plugin installed, for testing.
  docs/      The developer manual and decision records. Inithium repo only; never reaches clients.
```

### core/
- The repeated, centralised pattern for **all** applications. Global contracts, the UI library, the three primary apps and the core libs all live here.
- Core is copied from client to client, so it must be **heavily abstracted**: no client-specific values, copy, branding or business rules. Anything that varies per client is configuration (stored via the CMS) or a plugin.
- Core is a standalone Nx workspace (package scope `@inithium`) split into `apps/` and `libs/` (see [section 4](#4-nx-monorepo-conventions)).
- Core must **never reference plugins**: no imports, path aliases, routes, seeds or config entries. The only point of contact is the empty slot registries described below.

### plugins/
- Each plugin packages one optional capability (e.g. ecommerce) end to end: API routes, models and handling; the end-user pages in `web`; the client-facing management screens in `cms`; and its seed data.
- A client that does not use a plugin must have **none of its code** in their repository. A client that does use one must be able to get it **without rebuilding** the feature.
- No plugins exist yet. Core comes first.

### sandbox/
- The **local development environment for plugins** (0106): a generated copy of core's apps (`api`, `web`, `cms`, `docs`) where plugins are installed, activated, deactivated, ejected and reinstalled one at a time through the same install tool clients use, and checked in the browser. Never hosted.
- **Generated, never committed or maintained.** The `sandbox/` folder holds tooling only; generated workspaces go in `sandbox/workspaces/`, which is git-ignored, and can be kept between sessions and regenerated when core moves. Because it is always generated from `core/` + `plugins/`, it cannot drift from core.
- **Runs beside core** on its own ports (with its Vite proxies pointed at its own api) and its own database on the shared cluster, so the two can be compared. Its docs app shows the core manual plus installed plugins' manuals.
- Plugins are edited in `plugins/`, never in the workspace (it gets copies, like clients). The same tooling generates the **showcase** and pushes it for Render.

### Environments (0104)
Core development (local), the sandbox (local), the **showcase** (`inithium.onrender.com`, Inithium's marketing site for prospects: core plus plugins with demo data), and per client **staging** and **production** (two Render services on the client's account, two databases on the client's cluster). Each hosted environment is one Render service; the docs app is never deployed. Every client gets staging; the client and their staff review changes there and production stays untouched until they approve. Inithium never pays for client staging. Staging mechanics (repo/branches, data, access) are open (0108), and so are hosting plans and backups (0109) and the showcase's content and access (0110). The manual's `architecture/environments.md` has the detail.

### docs/
- The **developer manual**: a front-to-back guide to using Inithium, one folder per section, kept current with every change. Plus the decision records. See [section 9](#9-documentation-protocol).
- Its tooling (schemas and `npm run check`) is a standalone npm package, like `sandbox/`. The manual is *viewed* in `core/apps/docs`, which is stripped from client clones.

---

## 2. Plugin architecture

### Shape: plugins are sets of Nx libs
A plugin's source is laid out by layer, and each layer is an Nx lib:

```
plugins/plugin-<name>/
  api/         Express routes, Mongoose models, services, seed/unseed
  web/         React slot components + RTK Query endpoints for the end-user site
  cms/         React slot components + RTK Query endpoints for the client portal
  contracts/   Zod schemas + inferred types shared by the layers above
  docs/        The plugin's manual pages and decisions (see section 9). Never installed into a client.
```

When a plugin is installed into a core clone, it lands as libs. **Never inside an app.**

```
core/libs/plugins/<name>/
  api/        -> @inithium/plugin-<name>-api
  web/        -> @inithium/plugin-<name>-web
  cms/        -> @inithium/plugin-<name>-cms
  contracts/  -> @inithium/plugin-<name>-contracts
```

A plugin may depend on core libs and on its own layers.

### Slots: generated, typed registries
- Core defines **slot points**: typed extension contracts (for example API route mounts, Mongoose models, web pages/routes, CMS screens, navigation entries). The contract types live in a core lib.
- Each app has a **registry file** that core ships **empty**. Installing a plugin adds one import/registration to the registry of each app it touches, and ejecting removes it.
- Registry files are owned by the install/eject tooling. Do not hand-edit them, and core must never add entries to them. With an empty registry, the app builds and runs with zero plugin code.
- When core needs a new extension point, add a new slot contract and wire it into the app via the registry. Do not let core code look for a specific plugin.

### Seeding
- Every plugin ships an **idempotent seed**, run on install: default CMS pages, settings, nav entries and any required data. Running it twice must not duplicate anything.
- Every plugin ships an **unseed**, run on eject, which removes **only** what that plugin's seed created.
- Seed/unseed live in the plugin's `api` lib.
- **Every plugin's tests prove these rules** with the contract checks in `@inithium/api-testing` (`expectSeedIsIdempotent`, `expectUnseedRestores`, `expectUserDeletionHook`), plus its routes' permission checks (0103). Plugin spec files are never installed into client repos; they run in the Inithium repo and the sandbox.

### Plugin data
- **Plugins never add fields to `users`** (or to the core user schema or contract). A plugin keeps per-user data in its own collections, each document carrying a `userId` (e.g. `ecom` owns `addresses`).
- Plugin data the UI needs comes from the plugin's own endpoints, never from `GET /api/auth/me`.

### Lifecycle, activation and versions (0105)
- **Plugin source lives only in `plugins/`**; every workspace (sandbox, showcase, client repos) gets **copies**, installed by **one CLI** that also owns the registries and the manifest. No npm packaging, no linking.
- **Four verbs:** install (copy, register, seed; then build and deploy), **activate/deactivate** (a runtime flag in the database, toggled on a CMS **Plugins** screen by **owners and dev**: a new permission; instant, data kept), and eject (= uninstall).
- **Inactive means switched off:** every slot contract must let core leave an inactive plugin out at runtime (0015); the user deletion hook still runs while its data exists. Per-slot behaviour is open (0107).
- **Plugin settings** live on the Plugins screen, so plugins vary per client without forking; the developer decides when a difference becomes a setting or needs a separate plugin.
- **Versions:** every plugin has a version and a minimum core version; each workspace's **manifest** records its core and plugin versions; clients stay on their installed version until they ask to upgrade; upgrades copy the new version in and run the plugin's **migrations** (kept forever). Client repos never edit plugin files. Plugin updates don't travel through core's upstream merges.
- **Demo data:** a plugin may ship optional demo data, separate from its seed, for the showcase and sandbox.
- How seeds and migrations run against a hosted database (suggested: on api startup, from the manifest and a `plugins` collection), the export format and demo data's shape are open (0107).

### Ejecting
Ejecting a plugin (= uninstalling it) takes two steps, because unseed is the plugin's own code: (1) unseed from the running site while the code is still installed, then (2) remove its registry entries, delete `libs/plugins/<name>/` and deploy. After an eject, the workspace must type-check and build exactly as it did before the plugin was installed. Nice to have: before the unseed, warn what data will be lost and offer export first / eject anyway / cancel.

---

## 3. Client repositories

- A client app is created by cloning core. It receives core plus copies of only the plugins that client uses, at the versions in its manifest (0105).
- **Core updates reach clients via git upstream merges.** Each client repo keeps Inithium core as an upstream remote and merges improvements.
- To keep those merges clean, **client repos must not edit core files.** Anything client-specific goes in one of three places:
  - **Configuration** stored through the CMS (preferred).
  - **Plugins** installed from the library.
  - **`libs/client/`**: a reserved area for genuinely one-off client code. Core never puts anything there. Client libs plug into the same slot registries as plugins and follow all the same conventions.
- If a client needs a change to core behaviour, make it in Inithium core (generalised for every client) and merge it upstream. Do not patch it in the client repo.

### Accounts & provisioning
Every client owns their own infrastructure, so their usage and any paid upgrades never land on the Inithium/personal accounts (0104, superseding 0005):

| | Inithium: core, sandbox, showcase, plugins, personal projects | Each client |
| --- | --- | --- |
| GitHub | Personal account | Client's own GitHub account and repo |
| MongoDB | One shared Atlas cluster; a separate database per project or environment | Client's own Atlas account and cluster, with two databases: production and staging |
| Render | Personal Render account: the showcase | Client's own Render account (signed in with their GitHub): two web services, production and staging |
| Cloudflare R2 (if needed) | Personal account | Client's own account |

Provisioning a client:
1. Clone core, install the client's plugins, and push one initial commit to a new repo on the client's GitHub.
2. Create the client's Atlas account and cluster, with a production and a staging database.
3. Create the client's Render account through their GitHub, deploy the repo, and set the env vars (see [Environment & database](#environment--database)). The staging service is planned; its repo/branch set-up and data handling are open (0108), and so are paid tiers and backups (0109). Free tiers as reported in Oct 2026: Render 750 instance hours/workspace/month with sleep after 15 min idle; Atlas free cluster ~512 MB, no backups (production and staging share it; `database` storage mode's 250 MB quota is per database).

Switching an app between databases or clusters is only ever a change to `MONGODB_URI`. Nothing in code is tied to a specific cluster.

**Render web service settings** (set in the Render dashboard; verified in a fresh clone, a production-mode run and a first Render deploy; step by step in `docs/getting-started/deploying-to-render.md`, 0089):
- Root directory: `core`
- Build command: `npm ci --include=dev && npx nx run-many -t build --projects=api,web,cms` (`NODE_ENV=production` makes plain `npm ci` skip the devDependencies that hold Nx and the build tools; the docs app is never deployed)
- Start command: `node dist/apps/api/main.js`
- Health check path: `/api/health` (200 while the database is connected, 503 otherwise)
- Environment variables: `MONGODB_URI`, `HOST=0.0.0.0`, `NODE_VERSION=22`, `NODE_ENV=production`, `JWT_ACCESS_SECRET` and `SEED_DEV_PASSWORD` (both unique per client), and `SEED_DEV_EMAIL`; optionally `USER_TEMP_PASSWORD` (unique per client) so the CMS can create accounts, and the storage variables. Render provides `PORT`.

---

## 4. Nx monorepo conventions

### Apps are thin orchestrators
Apps are entry points that **consume** libs. They contain **no business logic**: no data access, no validation rules, no domain decisions. An app's job is bootstrapping, composition, routing to lib-provided handlers and pages, and its plugin registry.

Core ships three client-facing apps (its libs are listed in `docs/reference/libs.md`), plus `apps/docs`, the development-only manual viewer (0053), which never reaches clients:

| App | Role |
| --- | --- |
| `api` | Express server. The **single source of truth** and the **only** thing that talks to MongoDB. |
| `web` | The end-user site. Scaffolded at runtime from the settings and pages configured in the CMS. |
| `cms` | The client portal, where clients change the `web` site's settings and pages. |
| `docs` | The developer manual viewer (dev only, port 5175). Reads `docs/` from the Inithium repo; stripped from client clones. |

### Data flow
```
cms  --(RTK Query)-->  api  -->  MongoDB  <--  api  <--(RTK Query)--  web
     edits settings/pages                           fetches config at runtime
```
Nothing about a specific client's site is hardcoded in `web`; it renders whatever configuration the API returns. Neither frontend talks to MongoDB directly.

### Routing & hosting: one origin per client
Each client deploys as a **single Render web service**: the `api` process serves the API and both built frontends from one domain. Same origin means no CORS and first-party auth cookies (`*.onrender.com` subdomains count as separate sites).

| App | Path | Dev port |
| --- | --- | --- |
| `web` | `/` | 5173 |
| `cms` | `/cms` | 5174 |
| `api` | `/api` | 3000 |

- **All API routes are mounted under `/api`.** Unknown `/api/*` paths return a JSON 404, never the SPA.
- **Frontends call the API with relative `/api/...` URLs.** Never hardcode a host. In dev, both Vite servers proxy `/api` to `localhost:3000`, so the same code works locally and in production.
- `cms` is built with Vite `base: '/cms/'`, and its router `basename` is derived from `import.meta.env.BASE_URL`, so change the base path only in `vite.config.mts`.
- In production, `api` serves `dist/apps/cms` at `/cms` and `dist/apps/web` at `/`, with SPA fallbacks. It resolves `dist/apps` from the working directory, so start it from `core/` (`node dist/apps/api/main.js`).
- Dev ports use `strictPort`. If a port is taken, Vite fails instead of silently moving to the next port (and colliding with the other app).

### Libs hold the business logic
- Libs are split **by concern** (e.g. UI/theming, auth, realtime). Each concern is a standalone lib, and apps consume it. When adding logic, find the lib that owns that concern or create a new one; never put it in an app.
- **Layout:** core libs live in `libs/<scope>/<name>/` with the alias `@inithium/<scope>-<name>` (e.g. `libs/api/database` → `@inithium/api-database`). Alongside them are `libs/plugins/` (installed plugins) and `libs/client/` (client-only code).
- Libs are **non-buildable source libs**; the consuming app compiles them. Generate them with:
  ```bash
  npx nx g @nx/node:library --directory=libs/<scope>/<name> --name=<scope>-<name> \
    --importPath=@inithium/<scope>-<name> --tags=scope:<scope>,type:<type>,origin:core \
    --buildable=false --unitTestRunner=none --linter=eslint --strict --useProjectJson --no-interactive
  ```
  For React libs, use `@nx/react:library` with `--bundler=none --style=none --component=false` in place of `--buildable=false --strict`. Delete the generated placeholder file, README and (React) `.babelrc`.
  Keep `--unitTestRunner=none` (the generator's Vitest option rewrites the root `eslint.config.mjs`, adds a root `vitest.config.mts` and a coverage package) and add tests by hand: `vitest.config.mts` calling `projectTestConfig(import.meta.dirname, { database?, environment? })` from `core/vitest.preset.mts`, a `tsconfig.spec.json` (referenced from `tsconfig.json`, specs excluded from `tsconfig.lib.json`), and a cached `typecheck` target running `tsc --noEmit -p tsconfig.spec.json` (copy `libs/api/pages`).
- Every lib is tagged with all three groups below, and boundaries are enforced with ESLint `@nx/enforce-module-boundaries` (rules in `core/eslint.config.mjs`). Apps carry **only** their `scope:` tag (`scope:api|web|cms`); the `type:` and `origin:` rules apply to libs, and apps must stay free to import plugin/client libs through their registries.

| Tag group | Values | Meaning |
| --- | --- | --- |
| `scope:` | `api`, `web`, `cms`, `docs`, `shared` | Which app(s) may consume it. `shared` = usable by all (e.g. contracts). `docs` is the manual viewer, which uses shared libs only. |
| `type:` | `feature`, `data-access`, `ui`, `util`, `testing` | Its role in the layering. `testing` = a test kit, imported only by spec files (0103). |
| `origin:` | `core`, `plugin`, `client` | Where it came from. |

Boundary rules:
- `scope:web` / `scope:cms` / `scope:api` libs may depend only on their own scope and `scope:shared`. Frontend libs never import `api` code, and `api` never imports frontend code.
- `type:util` → nothing but other utils; `type:ui` → `ui`, `util`; `type:data-access` → `data-access`, `util`; `type:feature` → anything. Every type may also depend on `type:testing`, but only `*.spec.ts(x)` files may import a test kit (`no-restricted-imports` on `@inithium/*-testing*`; the kits' own eslint configs turn it off).
- `origin:core` libs must **never** depend on `origin:plugin` or `origin:client` libs. Plugin and client libs may depend on core libs. Only the app registry files import plugin/client libs.

### Environment & database
- `core/.env` holds local values and is git-ignored. `core/.env.example` is committed and is the template every client's `.env` (and Render env vars) is built from.
- **Only `@inithium/api-config` reads `process.env`.** Everything else gets values from `loadEnv()`. Env vars are declared and validated in `envSchema`, and adding a variable means adding it to both `envSchema` and `.env.example`.
- `MONGODB_URI` must include the database name (`.../<database>?...`). Validation rejects it otherwise, so Mongoose can never fall back to a database called `test`.
- `@inithium/api-database` owns the Mongoose connection (`connectDatabase` / `disconnectDatabase`). The api connects **before** it starts listening and exits if it can't, and it disconnects on SIGTERM/SIGINT.
- `nx serve api` loads `core/.env` automatically. A plain `node` run needs `--env-file=.env`. On Render, the variables come from the service settings.

### Auth & permissions
- **One `users` collection.** Roles, from most to least privileged: `dev`, `owner`, `admin`, `editor`, `user` (the default, for `web` end users, with no CMS access).
- **`dev` is never assignable** through any API endpoint or CMS screen, by anyone. It is only ever set directly in MongoDB.
- Roles map to permissions through the matrix in `@inithium/shared-permissions`; permission names live in `@inithium/shared-contracts`. `dev` holds every permission. The matrix grows with features: a new CMS feature adds its permissions, and must ask the user which roles get them.
- **The API enforces permissions** with `requirePermission()` / `requireAuth` from `@inithium/api-auth`. Frontends use `hasPermission()` only to decide what to show.
- **Tokens live only in httpOnly cookies.** Frontend code never reads, stores or sends tokens; it calls the API through `@inithium/shared-data-access`, which refreshes the session on a `401`. The current user comes from `GET /api/auth/me`, not from the token.
- The API seeds a `dev` account from `SEED_DEV_EMAIL` / `SEED_DEV_PASSWORD` on startup when no dev user exists, and never modifies an existing account.
- **Temporary passwords** (0088): the access token carries `passwordChangeRequired` (`pcr`); `requireAuth` answers 403 `PASSWORD_CHANGE_REQUIRED` to such sessions, and only `requireSession` routes (`/auth/me`, `/auth/change-password`) accept them. Both apps show `PasswordChangeScreen` (`@inithium/shared-auth-ui`) until `POST /api/auth/change-password` clears the flag (it also revokes other sessions).
- **User management** (0100, `@inithium/api-user-management` at `/api/users`, CMS `@inithium/cms-users`): an account gives roles up to and including its own, never `dev` (`assignableRoles()`), and changes/deletes only accounts at its level or below (`canManageRole()`, both in `shared-permissions`); nobody changes their own role or deletes themselves; the last owner stays; dev accounts are hidden from non-dev. Permissions: `users.view`/`users.create` (owner, admin, editor; editors create editors and members only), `users.edit`/`users.delete` (owner, admin). New accounts go through `createUser()` (+ `createdBy`) on the shared `USER_TEMP_PASSWORD` (optional env var, must meet the policy; unset = create/reset off) with `passwordChangeRequired`; resets reuse it. Role changes, resets and deletions call `revokeSessions()` (`api-auth`: refresh tokens revoked, access tokens up to that second refused, in memory). Deletion (1–100 ids): checks each, then every `UserDeletionHook` in the api registry (a failure aborts the batch; hooks must be idempotent), then sessions, member uploads, records. Any plugin keeping per-user data must register a hook.
- **Sign-up** (0083): `POST /api/auth/register` creates a `user` and signs it in; names go in the user's `profile` subdocument with its generated avatar and banner (0090; show a user their own name with `userDisplayName()`, others with `publicProfileName()`). **Password policy** (0024): `newPasswordSchema` (10+ chars, lower, upper, number, special) wherever a password is chosen; sign-in only needs a non-empty password. Emails use `emailSchema` (an @ and a dot). `web` forms raise a red, urgent alert through `useAlerts().show()` (the AlertStack, bottom right; dismiss the form's previous one) plus each field's reason (Input `error`), and focus the first failing field; follow that pattern for new forms.

### UI library & theme
The theme and the first components (Container, Text, Icon, Image, Button, Input, Checkbox, Loader, Switch, Divider, RadioGroup, Select, Slider, Tooltip) are built; see the manual's `docs/ui-library/` section (overview, style props, theme, animations, one page per component). Open questions are in 0033.
- **Four layers**, each building only on those above it: **theme** (branding source of truth) → **components** (atoms: container, text, button, input, select, checkbox, radio, switch, slider, icon, divider, loader, tooltip) → **composites** (molecules, e.g. modal, alert, drawer, tabs) → **layouts** (organisms, e.g. collection view).
- **Six colour tokens:** `primary`, `secondary`, `tertiary`, `quaternary`, `accent`, `surface`, each on a 50–950 scale. No status tokens. Clients set the 500 of each brand token and the 100 of surface; the rest is generated.
- **Surface roles:** 50–400 backgrounds, 500 borders and dividers, 600–950 text. The generator guarantees every text step meets WCAG AA on every background step.
- **Dark mode mirrors every scale** (50↔950 … 500 stays). Any UI (core, plugins, generated pages) must use token roles rather than fixed light-mode colours, so it flips without dark-mode-specific code.
- **Four libs:** `@inithium/shared-ui-theme`, `-ui-components`, `-ui-composites` and `-ui-layouts` (in `libs/shared/`). A new `ui:` tag group (`ui:theme` → `ui:component` → `ui:composite` → `ui:layout`) lets each layer depend only on the layers above it; the lint rules are in `core/eslint.config.mjs`. All four exist; the layouts lib holds `DefaultLayout`, `BareLayout` and `FullWidthLayout` (page frames under the Navbar), `ProfileLayout` (a profile's frame, used inside `full-width`) and `SidebarLayout` (the CMS frame).
- **Style props** (colour, spacing and so on) are **serializable Zod schemas** with inferred types. They resolve to **fixed classes reading CSS variables** set inline (e.g. `class="ui-bg"` + `--ui-bg: var(--color-emerald-200)`). One property table (`style-properties.config.ts`) drives both the resolver and the generated stylesheet that `<UiProvider />` injects (0047). To add a style property: add its schema in `shared-contracts`, add a table entry, and resolve it in `style-props.service.ts`.
- **Apps** wrap their root in `<UiProvider>` and their `styles.css` imports `tailwindcss` **with `theme(static)`** (colour props read Tailwind palette variables at runtime, so they must all be emitted) then `libs/shared/ui-theme/src/styles/theme.css` (fonts), then `animate.css`.
- A style prop takes a value or a flat variant object: `base`, breakpoints (`sm`–`2xl`), states (`hover`, `focus` meaning `:focus-visible`, `active`, `disabled`), or `'breakpoint:state'`.
- **No `className` on UI components.** If a component can't express something, extend its props.
- **Use the library, not plain HTML** (0092): build apps, feature libs and layouts from Container (with `as`), Text and the other components and composites. Plain elements (`div`, `span`, …) only when no component can express it (today: `<form>`, `calc()` sizing, raw hex swatches, component internals), each with a comment saying why; if a component almost fits, extend its props.
- **Pages are full width** (0091): don't cap pages, layouts or page-level content at a max width (e.g. 1200px) unless asked. Side padding is fine; a deliberately narrow card (BareLayout) is the exception. Forms take the width they're given.
- **Icon** (0050): Lucide icons by kebab-case `name`, loaded on demand. `size` in px (default 24), colour inherited from the text unless `textColor` is set, decorative unless given a `label`.
- **Button** (0054): `variant` (`filled` default, `outlined`, `ghost`, `link`) styled from one `color` (default `primary`), with `bgColor`/`textColor`/`borderColor` overriding per variant key; text on the colour is its 100 step, which must stay un-mirrored in dark mode. Fixed 32px height, 6px radius, 2px border, body font 14px/500; `link` is inline and doesn't navigate. `leadingIcon`/`trailingIcon`, `type="button"` by default.
- **Input** (0055): a native `<input>` with its own floating label, helper text and error; no accessibility library. `variant` `outlined` (default) / `filled` / `standard` (MUI-style); neutral border at rest, `color` on focus; `error` is always `red-500` and hides itself once the user edits. 32px field to match Button; filled/standard labels float above it. `startAdornment`/`endAdornment` (any element, `InputAdornment` for icons and icon buttons), built-in password toggle, default width `full`. Its fixed CSS (`input.styles.ts`) is published by `<UiProvider />` before the style-prop sheet, so style props win; new component stylesheets follow the same pattern.
- **Modal** (0065, `@inithium/shared-ui-composites`): Radix dialog, controlled by `open`/`onOpenChange`; dark fixed overlay (neutral 950 at 60%) fades, panel (a Container, takes its style props) animates `fadeInUp`/`fadeOutDown` by default and stays mounted until its exit ends; `title` required (`hideTitle`), `description`, `dismissible`, `closeButton`, `overlayColor`, `footer` (pinned under a scrolling body). Global state: the `modals` slice in `shared-data-access` holds `openModalId` (one at a time); `useModal(id)` gives `modalProps` to spread plus `open()`/`close()`; `dispatch(openModal(id))` from anywhere. Container merges a Radix `asChild` slot's `style`/`className`.
- **Footer** (0077, composite): `<footer>` with a main row of `links` (Navbar's items, groups flattened) over a smaller row: the copyright ('© <current year> <copyright>. All rights reserved.', `copyrightStartYear` for a range) then `secondaryLinks` separated by thin rules; `currentPath`/`onNavigate` as on Navbar; `align` start/center; stacks into columns below 640px of its own width.
- **Navbar** (0076, composite): full-width `<header>` with brand (`logo` `{ src, alt }` + `title` → `homeHref`), page `links` (`navItemSchema`: links or one-level groups, which open Radix Navigation Menu dropdowns), `ancillary` slot (plugins later) and the user section. Data only: real links, plain clicks to `onNavigate`, `currentPath` marks the current one. `user={{ name, avatar?, image? }}` is passed by the app (UI libs can't read auth). Below `collapseAt` (default `lg`, measured by its own width) links move into a right Drawer; signed in, the avatar opens the drawer (page links when narrow, Divider, `userLinks`, red Logout via `onLogout`); signed out, Login in the bar when wide, a menu button opening links + Login when narrow. Sticky, z-index 30. `web`'s SiteShell draws it from page records and settings; the CMS's SidebarLayout uses it as its top bar.
- **Avatar** (0075, composite): DiceBear 10 (`@dicebear/core` + JSON definitions from `@dicebear/styles`, each loaded on demand) limited to 14 styles (`avatarStyles`: initials default, blobs, bottts, cameo, disco, gaze, glass, glyphs, landscape, loops, moods, patchwork, planets, rings); don't add others. Storable recipe `avatarRecipeSchema` (`style`, `seed`, optional `backgroundColor` / `flip` / `rotate` / `scale`); initials draw `name`'s initials on a seed-picked colour; theme backgrounds are drawn by our circle (DiceBear's dropped). Glyphs (CC BY 4.0) and Bottts need credit: kept on the manual page and shown in the editor. `width`/`height` default 40; `editable` adds a round pencil on the bottom-right edge opening a Modal editor (preview with ← → through a seed history, style thumbnails, background, flip, rotate, scale; draft until Save).
- **PolyBanner** (0074, composite): our own Trianglify-style low-poly pattern (Trianglify is unmaintained; don't add it). A storable recipe `polyPatternSchema` (`cellSize` 25–250, `variance` 0–1, `xColors`, optional `yColors` = x, `seed`) drawn as an SVG at the banner's measured size; points are seeded per grid position, so the same recipe always draws the same pattern and wider banners extend it; fills `color-mix` theme variables, so re-brands and dark mode recolour it. `value`/`defaultValue`/`onChange`, `children` over it, `label`; `editable` adds a pencil button opening a Modal editor (preview, Sliders, AutoIncrementingLists of ColorPickers, Shuffle/Cancel/Save; draft until Save). Profiles will store the recipe.
- **Pagination** (0073, composite): ← numbers → with a fixed-length row (first, last, current ± `siblingCount`, '…' gaps); `page`/`defaultPage`/`onPageChange` from 1; `showFirstLast`, `compact` ('Page 5 of 20'), `pageSizeOptions` (a Rows per page Select; resets to page 1), `totalItems` summary; `getPageHref` makes pages real links with plain clicks still going to `onPageChange`. Its own stylesheet styles items like ghost/filled Buttons so they can be links.
- **Breadcrumbs** (0072, composite): `items` `{ label, href?, icon?, iconOnly? }`, last = current page (`aria-current`); real `<a href>` links, with `onNavigate` taking plain left clicks for the app's router (the same router-hook pattern as AlertStack); `separator` icon name or text; `maxItems` collapses to first › … › last steps; labels cut at 200px with a tooltip when cut. The docs app's page headers use it.
- **Drawer** (0071, composite): Modal from a screen edge (`side` right/left/top/bottom, `size`), pinned header (title, description, ✕), scrolling body, optional pinned `footer`; slides from its side by default. Modal and Drawer share an internal `DialogFrame` (overlay, exit-then-unmount, dismissal, focus return) and the `modals` slice / `useModal`, so one is open at a time.
- **Alert / AlertStack** (0066): `Alert` is the card (inline use too): one `color`, text/border/icon at 600, bg at 100; `icon` (or `image` `{ src, alt? }`, storable, e.g. an avatar; or any `leading` element in code; all centred on the first line with the ✕), `title`, `message`, `action` (`{ label, href?, onClick? }`), ✕ via `onDismiss`. `AlertStack` (Radix toast) shows the global queue in a corner (`position`, default bottom-right; default animations follow it), 5s default `duration` (`null` stays), `urgent` interrupts screen readers, max 5. Queue: the `alerts` slice in `shared-data-access` (`showAlert` puts the new id in its payload, `dismissAlert` animates out, `removeAlert` after); `useAlerts()` gives `show()` and `stackProps`. Actions are `{ label, href }` data; the app passes its router as `onNavigate`. One AlertStack per app root (docs has one; cms/web add theirs when needed).
- **Tabs** (0068, composite): Radix tabs from data (`tabs={[{ value, label, icon?, disabled?, content }]}`; content runtime only); underline in `color` slides to the active tab; `fill`, `keepMounted`, `bar` (bgColor/padding/radius/shadow box for the tab bar, dropping its divider), `variant` 'underline' (default) or 'buttons' (each tab a Button through Radix `asChild`: active `filled`, others `ghost`, in `color`; the profile uses it); automatic activation. Composites render their own stylesheet as a React 19 hoisted `<style href precedence>` (one copy). `toCssColor(value)` from ui-components turns a colour value into CSS for parts style props can't reach.
- **Image** (0098, component): a native `<img>` with Image style props (sizing, margin, radius, border, shadow), `fit` (object-fit; `cover` when both sides are set), `aspectRatio`, `decorative` (empty alt + `aria-hidden`), `loading` lazy by default. Use it instead of `<img>`.
- **ImageCropper** (0098, composite): wraps `react-easy-crop` (never use it directly): `src`, `aspect`, `shape` rect/round, `mode` crop/fit (fit zooms out to 20% over a `background`), Zoom and Rotate Sliders, `onCropChange({ area, rotation })`; `renderCrop(src, crop, { background, maxSide })` gives a WebP blob.
- **RichTextField** (0102, composite): every multi-line text field is TipTap WYSIWYG (never a `<textarea>`), saving Inithium's rich text JSON (never HTML or Markdown); `features` limits the formatting (bold, italic, underline, link, heading, bulletList, orderedList, blockquote; TipTap's schema drops the rest on paste), `maxLength` via TipTap's CharacterCount (counted as `richTextLength()`), Input-like box + toolbar + link row (https/http/mailto/tel), dismissible `error`. Validate saved rich text on the api with `restrictedRichTextSchema({ features, maxLength, urlLinksOnly })`. **RichTextView** draws it with Text/Container (`resolveLink`, default web addresses only); content's `RichText` wraps it with page links. **Restyled words** (0115): the `textStyle` mark `{ family?, weight?, size? (ratio 0.5–3, presets `richTextSizePresets`), color? }`, features `fontFamily`/`fontWeight`/`fontSize`/`textColor` (bio allows none; RichTextField has no styling tools, so its fields mustn't allow them); in TipTap it's our own `RichTextStyle` mark (`inithiumTextStyle`, only reads back its own spans, attrs checked with `checkedStyleAttrs()` before drawing), converted in `richTextToTiptap`/`tiptapToRichText`; RichTextView draws it as a Text inside bold/italic (weight beats bold) with `fontScale`, and takes `typography` for the running text.
- **FontPicker** (0111, composite): IconPicker-style read-only Input (name + "Aa" in the font) opening a popover listbox: optional `emptyLabel` option (`undefined`), the roles Display/Body (`roles`, default true), then `families` (`{ id, name }[]`, data only), each drawn in its own font; value `FontFamilyValue | undefined`; a family not in `families` shows "Missing font (shown as Body)". Needs `ThemeFonts` rendered for families to draw.
- **IconPicker** (0085, composite): ColorPicker-style read-only Input (icon + name) opening a popover with a focused search box, a listbox grid (8 per row, at most 60 matches of Lucide's `iconNames`, every word must match, prefix matches first), a count and "No icon". Value is an `IconName` or undefined; arrow keys move 1/8, Enter/Space/click picks and closes.
- **ColorPicker** (0069, composite): a read-only Input (colour name + swatch end adornment) anchored to a Radix popover (not its trigger, which would make the Input a button); Theme and More colours tabs (or `palette="theme"`), 6-per-row swatch radio groups at the current intensity, a Slider over the 11 intensities. Value `{ color, intensity }` (a colour value); `name` submits `color-intensity`.
- **AutoIncrementingList** (0070, composite): generic `items`/`createItem()`/`renderItem(item, index, update)`; tracks its own row ids; minus on every row (hidden at `min`, default 1), plus on the last (hidden at `max`); 32px icon Buttons in `addColor`/`removeColor` with `itemLabel` labels and tooltips; rows fade in/out and the gap collapses; focus follows changes and a live region announces them.
- **Interactive widgets use Radix** (0056): checkbox, radio, switch, select, slider, tooltip and later modal/drawer/tabs get their behaviour from one `@radix-ui/react-<widget>` package each, styled with our props; never expose Radix's API. Native elements (`<button>`, `<input>`) stay native.
- **Checkbox** (0057): Radix checkbox; one `color` for the unchecked outline, checked fill and focus, check in the colour's 100 step; 18px box in a 32px row; `label`, `helperText`, `required`, `disabled`, `error` (red-500, dismissed on toggle, shared with Input via `useDismissibleError`), and `'indeterminate'`.
- **Loader** (0058): CSS-only variants `spinner` (default), `dots`, `bars`, `pulse`, `ring`, `orbit`, `wave`, `grid`, `segments`, and `progress` (slides, or fills to `value` 0–100 as a `role="progressbar"`); one `color`, tracks at 20%; `size` px (default 24), `width` for progress; `role="status"` with `label`; reduced motion fades instead of moving. Button's `loading` reuses `.ui-loader-spinner` in `currentColor`, disables the button and keeps its width.
- **Switch** (0059, 0095): Radix switch; neutral track when off (`surface-400`), `color` track and its 100-step thumb when on; optional `checkedIcon`/`uncheckedIcon` on the thumb; `labelPlacement` `end` (default) or `start` (switch pushed to the far end); 36×20 track in a 32px row; label, helper text, required, disabled and dismissible `error` as on Checkbox.
- **Divider** (0060): native `<hr>` (horizontal) or inline `<span role="separator">` (vertical, stretches in flex rows, 1em in text); `color` (default surface 500 at 40%), `thickness`, `lineStyle`; optional `label` with `labelAlign` (padding is the gap around it); `decorative` hides it from screen readers; no default margin.
- **RadioGroup** (0061): one data-driven component (Radix radio group): `options` `{ value, label, helperText?, disabled?, icon? }` are storable; `variant` `plain` (default) or `card` (bordered, tinted when selected, shows icons); `orientation` vertical (default) or horizontal; radios styled like Checkbox; group label, helper text, required, disabled and dismissible `error`.
- **Select** (0062): Radix select drawn as an Input field (shares Input's classes, stylesheet and style props; sets `data-active`/`data-filled` on `.ui-input` so the label floats and the field shows focus while the list is open); options `{ value, label, icon?, disabled? }`, optionally grouped `{ label, options }`; the list opens below at the field's width, max 280px. No clearing, search or multi-select.
- **Layering** (0062, 0065): popups (Select, Tooltip, AlertStack) and overlays (Modal) render in a portal at the end of the page, so overflow never clips them. Overlays sit at z-index 40 and popups at 50, so a popup inside a modal appears above it. Follow this for every new popup or overlay.
- **Slider** (0063, 0095): Radix slider (unfilled track `surface-400`); a number value gives one thumb, `[low, high]` a range (callbacks return the same shape); `min`/`max`/`step`, `minStepsBetweenThumbs`, `marks` (`true` or `{ value, label? }[]`), `valueLabel` `auto`/`always`/`off`, `formatValue` (runtime only); label row shows the value; `onValueCommit` when a change ends; horizontal only.
- **Menu** (0117, composite): `@radix-ui/react-dropdown-menu`; a trigger child (takes a ref) opens items `{ label, onSelect, icon?, description?, shortcut? (hint only), disabled?, danger? }`, `{ heading }` or `'separator'`; `side`/`align`, controllable `open`/`onOpenChange`; portal at z-index 50, not modal; no submenus or checkable items.
- **Tooltip** (0064): wraps one element (`<Tooltip content="…"><Button /></Tooltip>`, Radix trigger `asChild`, so children must take a ref and events); `side`/`align`, `color` (default surface 900, text its 100 step), `arrow`, `delay` (500ms, shared provider rendered by `UiProvider`); wraps disabled/loading children in a focusable span. No style props or `animation` (the one exception). Describes, doesn't name: icon-only buttons still need `aria-label`.
- **Docs app** (0053): `npx nx serve docs` → http://localhost:5175 renders the manual with live examples. A component's examples are files, `core/apps/docs/src/examples/ui-library/<component>/<name>.example.tsx`, each default-exporting one component, embedded in its page with a fenced `example` block. (The old `/ui` gallery is gone.)
- **Animation** (0048; built in `useAnimation`, used by every component): every component takes `animation={{ entrance, exit, attention }}`, using animate.css names, a speed (`faster`/`fast`/`slow`/`slower` or ms), a delay (`1s`–`5s` or ms), `repeat` for attention, and `when: 'mount' | 'inView'` for entrance.
  - **Runtime props**, outside the stored schema: `show` (default true; `false` plays the exit and then **unmounts**), `replay`, `onEntranceEnd` and `onExitEnd`.
  - Changes to `show` mid-animation wait for the running animation to finish.
  - Parents can `stagger={ms}` their direct children's entrances.
  - A missing `animationend` (e.g. under `display: none`) is covered by a fallback timer, so sequences always finish. New components must reuse `useAnimation`, not reimplement the lifecycle.
  - `animation` is not a style prop: it takes no variant keys.
  - animate.css's reduced-motion handling is kept.
- **Style prop schemas live in `@inithium/shared-contracts`,** so the API and plugins can validate them without React.
- **Colour values:**
  - `{ color, intensity, opacity? }` (a theme token or Tailwind colour; intensity 50–950; opacity 0–100);
  - a shorthand name (`'primary'`, `'emerald'`), meaning 500;
  - `'transparent'`.

  There is no `white`, `black`, `current` or `inherit`; use the surface extremes instead. Colour props exist only for background, text, border, ring, outline and shadow. CMS colour controls (e.g. the page editor's colour picker) may offer theme tokens and Tailwind colours; the theme's own colours are set as hex codes in theme settings, never picked (0067). Theme colours are stored as references, so choices follow a re-brand.
- **Scales** are generated in even OKLCH steps. The client's colour is exactly 500 for brand tokens and exactly 100 for surface.
- **Measurements are pixel numbers,** never Tailwind spacing steps.
  - Spacing: `margin` / `padding` take `{ all, x, y, top, right, bottom, left }`; specific keys override general ones; negative margins and offsets are allowed.
  - Border width takes the same side keys.
  - Radius takes those keys plus the four corners.
  - Gap, offsets, font size and letter spacing are pixels.
  - Line height is a ratio.
  - Shadow size uses Tailwind's names (`2xs`–`2xl`).
- **Sizing** (`width`, `height`, `min*`, `max*`): px, `'full'`, `'screen'`, `'n/d'` fractions, `'auto'`, `'fit'`.
- **Container** layout is grouped object props: `flex`, `grid`, `position`, `overflow`.
- **Text** has size, `fontScale` (relative size as `em`, wins over `fontSize`, 0115), weight, align, line height, letter spacing, font style (italic), text decoration, truncation, and font family: `display` / `body` or a library family `{ familyId }` (0112; resolves to `var(--font-family-<id>, var(--font-body))`, a variable `themeFontsCss()` sets for every family; ids must be 24-hex).
- **`as`** comes from fixed lists only:
  - Text: `h1`–`h6`, `p`, `span`, `label`, `strong`, `em`;
  - Container: `div`, `section`, `article`, `header`, `footer`, `nav`, `main`, `aside`, `ul`, `ol`, `li`, `blockquote`.
- **The theme holds colours and two fonts** (`display`, `body`). The default fonts' OFL licences sit beside them in `libs/shared/ui-theme/src/fonts/`; never serve them as "Merriweather" (a Reserved Font Name), only under the `Inithium` aliases. Core ships default font files, and a client can replace them via CMS upload (stored as assets). Radius and shadows are not theme tokens.

### Pages & routing (web)
Designed, being built in phases; the manual's `architecture/pages-and-routing.md` has the full picture and the phase list.
- **Pages are records drawn by code** (0078): a `pages` collection (contracts in `shared-contracts`) holds title, path, status, template key, layout, colours, entrance/exit animation, audience, navigation settings, SEO and `protected`. Code **templates** registered in `web` (core directly; plugins and `libs/client/` through the web registry) draw them; each is single-use or reusable and lists its allowed layouts. Never put page metadata only in code, and never make the CMS write files.
- **Content pages** (0093, rebuilt by 0116): core's reusable `content` template (`ContentPage`, layouts `full-width`/`default`/`bare`) draws a page's `content` `{ draft, published }` (web gets only `published`). **Format v2** (contracts in `shared-contracts` `content/`): `{ schemaVersion: 2, elements }`, a tree of `{ id, type, props, children?, label? }` (page root = vertical column; only Containers hold children). Elements: Container (Container's style props minus `position`/`overflow`, + `animation: { entrance }`, `stagger`, `anchor`; colour backgrounds only), Text (rich text `doc` h1–h4, `align`, `textColor`, `typography` (running text), `headingTypography`), Image (`assetId`, `alt` required unless `decorative`, caption + colour/typography, `align`, `link`, Image style props, `fit`, `aspectRatio`), Icon, Button (`label`, `link`, icons, Button style props), Divider; leaves also take `hidden`/`margin`/`animation`, applied by the renderer to a box around them (`withoutBoxProps()`). Plugin elements `plugin-<name>:<element>` keep any props (`pluginElementSchema`) and draw nothing until the content elements slot exists. `contentElementSchema` checks each element against its own type (problems point at the field); `checkContentTree()` enforces `MAX_CONTENT_ELEMENTS` 250 / `MAX_CONTENT_DEPTH` 10 / unique ids before parsing; envelope types hand-written in `content.types.ts` (recursive). Read stored content with `readContentDocument()` (upgrades v1 via `upgradeContentV1()`, `content/v1/`, deterministic ids; the api upgrades on read, so storage stays v1 until saved); `flattenContentElements()`; `sameContent()` compares documents. Rich text is a TipTap JSON subset drawn with Text/Container, never HTML; links are `{ type: 'page', pageId }` or `{ type: 'url', href }` (https/http/mailto/tel only). `ContentRenderer` (`@inithium/shared-content`) is the one renderer for `web` and the builder's preview; it stamps `data-element-id`/`data-element` on what it draws and takes `decorators` `{ element, body, children }`. Creating: New page, Duplicate and Delete on the CMS Pages screen; new pages start empty. **Page builder** (`@inithium/cms-content-editor`, CMS `/pages/:id/content`, `inSidebar: false`, `fill`, ≥1024px; panels surface 200 with 1px surface 500/50% borders, canvas surface 950, 0096): `PageBuilder` = toolbar (status, Desktop/Tablet/Phone, undo/redo, Page settings, Discard, Publish) + `LayersPanel` (tree, roving focus, collapse, HTML5 drag before/after/inside, rename, ⋯ `Menu`, Add menu) + preview (`PreviewFrame` iframe mirroring stylesheets, scaled to fit at 1280/768/390 so breakpoints are real; selection/hover outlines by `data-element-id`, never wrapping elements; selected Text edited in place with `RichTextEditor` `titleHeading`) + `ElementProperties` (tabs Content/Layout/Style/Advanced, keyed by element + device). Pure ops: `content-tree.service.ts` (tree), `device-values.service.ts` (per-device: Desktop = plain or `lg`, Tablet `md`, Phone `base`; `writeAt`/`readAt`/`isOverridden`, a field's `fallback` fills sizes never set; state keys kept), `property-values.service.ts` (spacing steps 0/4/8/16/24/48/96 + Custom, sides). Fields in `property-fields.component.tsx` (`DeviceField`, `StepField`, `SidesField`, `SizeField`, `VisibilityField` …). Shortcuts are ignored inside `[data-builder-controls]` (properties, toolbar) except undo/redo. Autosave 1.2s when valid (`PUT /api/pages/:id/content`, v2), Publish (`POST …/content/publish`, needs `pages.publish`), Discard (`POST …/content/discard`), session undo/redo (`useContentHistory<Doc>`, `useAutosave<Doc>`). Add picker `AddElementMenu` (a Menu: where it goes, then `ELEMENT_GROUPS` with descriptions) at the top of Layers, on an empty page and as each row's + (adds after it); name tags in the preview (hover sets `data-editor-name`; the selected one's comes from the preview's styles; Containers' inside their corner, others' above). **Edit lock** (built): `content-lock.service.ts` in api-pages, page `contentLock` `{ lockId, userId, name, since, heartbeatAt }`; the builder's random `lockId` per session (`useContentLock()`: take on open, heartbeat `CONTENT_LOCK_HEARTBEAT_MS` 30s, unlock on unmount or `sendBeacon` on pagehide); expires after `CONTENT_LOCK_TTL_MS` 2 min; taking is a conditional update; no takeover of a live lock; writes without it get 409 `CONTENT_LOCKED` with `editing`; `Page.editing` (`pageEditingSchema`) shows who, also in the Pages list; settings aren't locked. **Accessibility warnings** (built, never block): contrast measured in the preview (`scanContrast()`: computed colours read through a 1px canvas, composited backgrounds, AA 4.5/3 for large text; buttons skipped), heading levels skipping (`headingWarnings()`, start may be h1 or h2), empty Text (`emptyTextWarnings()`); toolbar "N to check" opens a Drawer list, the selection's own warnings head its properties. **Usage** (built): `contentReferences(doc)` (assets, page links, font families, by element type; plugin props scanned by shape) drives asset usage, font family usage and `GET /api/pages/:id/usage` (`pageUsage()`), which the CMS's Delete page dialog lists. Still to build (0116 step 7): plugin elements. **Privacy policy** (0097, built): seeded content page `/privacy-policy` (seedKey `privacy-policy`, protected, published, secondary footer); `privacyPolicyContent()` writes the v1 wording (`privacyPolicyContentV1()`) upgraded to v2 (core's data and its two essential cookies, lifetimes from the JWT TTL env vars); written once, never touched again; not legal advice. **Typography** (0115): `contentTypographySchema` `{ fontFamily?, fontWeight?, fontSize?: { base, md? } }`; buttons have none (Button's fixed size, 0054); `typographyProps()` in `@inithium/shared-content`; editor `TypographyFields` (FontField with "Default", weights from `useFontWeights()` in `@inithium/cms-media`), toolbar Text style (`TextStyleDialog`). Removing a family warns with pages using it (`GET /api/fonts/:id/usage`).
- **Seeds create pages**, all protected: core's Home `/`, Profile `/profile/:id`, Login `/login`, Sign up `/sign-up`, Not Found `/404`, and the Privacy policy content page (`seedPages()` in `@inithium/api-pages`). Seeds for reusable templates carry a `seedKey` (found by it; others by template); a seed never takes over an address another page already uses (it warns and skips), and content seeds write their blocks only on creation. On later starts a seed only syncs code-owned fields (`path`, `layouts`) and never touches CMS-edited ones. The CMS edits but can't delete protected pages or change their path/template/layouts. "New page" offers only reusable templates (today the content page).
- **Web shell** (`@inithium/web-shell`): `SiteShell` (in `apps/web`, inside the router and store) does everything below; templates are `PageTemplate` `{ key, component, singleUse, layouts, defaults? }` (defaults: bgColor/textColor/animation, used when the page record has none; record > template > shell default), getting `{ page, params }`, with `usePageReady()` and `useSite()`. Core's are `coreTemplates` in `@inithium/web-pages` (real Login, Sign up and Profile; placeholder Home and Not Found; Login and Sign up default to a surface 950 page with fadeInUp/fadeOutDown). The shell publishes `--ui-navbar-height` (`NAVBAR_HEIGHT_VAR`) so DefaultLayout's content is at least the screen minus the Navbar: the Footer starts just below the fold (0084). `apps/web/src/app/plugins.registry.ts` is the web registry (core ships it empty; later entries replace core templates by key; `registeredProfileSlots` holds profile slots). Layout keys map to `@inithium/shared-ui-layouts` in the shell's `LAYOUTS`.
- **Routing** (0079): `web` loads settings + published records once at startup and builds React Router routes. Audiences `all` / `signed-out` / `signed-in`: signed-out on a signed-in page → `/login` with an alert, then back; signed-in on a signed-out page → Home silently. Transitions: Navbar stays; pages sit over a surface 950 backdrop (dark in light mode, mirrored in dark), so exits fade into it; old page's exit finishes, then the latest destination's entrance (clicks mid-exit never cut it short); `usePageReady(ready)` holds the entrance behind a Loader. Scroll to top, focus the heading. The CMS uses its own plain routes.
- **Menus come from page records** (0080): locations `primary-nav`, `profile-nav`, `primary-footer`, `secondary-footer`; label, order, icon, group (one-level dropdowns). No parameterised paths in menus except Profile in `profile-nav` (the signed-in user's id).
- **Profile** (0081, 0090): viewer is `visitor` / `member` / `owner`; tabs in the URL (`?tab=`). Page in `full-width` with `ProfileLayout` (CMS-like: raised surface 100 sidebar with a shadow holding avatar, name, actions, then sections; surface 200 main column). Core adds only the About sidebar section (bio, join date, owner's email) and the owner's Account tab (the editable form: names, bio, read-only email, `PasswordChangeForm`); no About tab, no "Edit profile" button (owners never press a button to start editing). The tab bar shows whenever there's a tab. The main column holds surface 100 cards (`profileCard` from `@inithium/web-pages`: padding, 12px radius, `2xl` shadow, 24px apart): the tab bar and each form section; plugin tabs spread `profileCard` too. Slots: entries `{ key, order, viewers, component }` (+ `label`, tabs `icon?`) getting `{ profile, viewer }`, in `registeredProfileSlots` via `ProfileSlotsProvider` (`@inithium/web-pages`); core's own use orders 0 and 1000. Others see a nameless profile as "Member" (`publicProfileName()`), never the email. API: `GET /api/profiles/:id` (public; email only for the owner, via `readAuth`), `PATCH /api/profiles/me` (`@inithium/api-profiles`).
- **Site settings** (0082, 0087): one `settings` record (site title, logo `{ assetId, alt }` (0098; `logoImage()` gives the Navbar's `{ src, alt }`), optional favicon `{ assetId }` (0101: ICO/SVG kept, other images stored as PNG ≤ 512px; `useFavicon()` from `shared-ui-theme` applies it in `web`'s shell and `CmsTheme`; blocks deleting its asset like the logo), copyright holder, optional `theme`, optional `fonts` `{ display?, body? }` (font family ids, 0111: must exist with files, 400 `fonts.<role>`)) for Navbar, Footer, colours and fonts, in `@inithium/api-settings`. **Theme fonts in the page** (0114): the api's SPA handler never serves `index.html` statically (`express.static(dir, { index: false })`); `renderAppPage()` writes `themeFontsHead()` (preloads + `themeFontsCss()`: every family's `@font-face`, size-matched fallback faces, `--font-display`/`--font-body`) before `</head>`, cached until `markFontsChanged()` (called by every family change and settings save). Both apps also render `ThemeFonts` from the site bundle (`fontFamilies`), for live changes and the Vite dev servers.
- **API:** `GET /api/site` (public bundle: settings + published `PublicPage`s); `/api/pages` list/get/PATCH/DELETE, `GET /templates`, `POST /` (create) and `POST /:id/duplicate`; content: `POST /:id/content/lock` and `/unlock`, then `PUT /:id/content`, `POST …/publish`, `POST …/discard` carrying the lock id in `x-content-lock`; `/api/settings` GET/PUT. Edit rules live in `updatePage()`, create rules in `createPage()`. Reusable templates are listed for the api in `reusableTemplates` (`@inithium/api-pages`), whose layouts must match the `web` template of the same key. A 4xx error may carry `field` (the api's error handler forwards it) so forms can mark the field.
- **Permissions:** `pages.create`, `pages.edit` (owner, admin, editor); `pages.publish`, `pages.delete`, `settings.edit` (owner, admin). Assets: see Profiles & assets.

### CMS
- **Frame** (0086): `CmsShell` (`@inithium/cms-shell`) renders `SidebarLayout` (`@inithium/shared-ui-layouts`: Navbar top bar with title + account menu, sticky collapsible sidebar, drawer below 1024px) and routes a list of `CmsScreen` `{ path, label, icon, element, permission?, inSidebar?, fill? }` (`fill` = SidebarLayout's `fill`: no sidebar, content fills under the top bar) from `apps/cms/src/app/app.component.tsx`, hiding screens without the permission. `/cms` is the (empty) Dashboard. Add a screen as a CMS feature lib plus one list entry; plugin screens wait for the slot catalogue (0015).
- **Pages** (`@inithium/cms-pages`): list with search/sort, Edit content (content pages → the content editor), Settings, New page / Duplicate (`NewPageDialog`, path suggested by `pathFromTitle()`) and Delete (`DeletePageDialog`), and a tabbed `PageEditor` Modal (General, Appearance, Access, Navigation, SEO) over a draft; publish needs `pages.publish`; `PATCH` `null` clears `bgColor`/`textColor`/`animation`. CMS forms follow the `web` pattern via the shared form helpers in `@inithium/shared-data-access`.
- **Media** (`@inithium/cms-media`, 0098, needs `assets.upload`): `MediaScreen` (storage meter, search, kind filter plus Member uploads, a Font families view (0111), grid of whole-card buttons, details Modal: preview, rename, default alt, details, where it's used; Save/Copy address/Open/Delete in the footer, delete confirmed in the footer), `AssetPicker` (library grid + Upload new in a Modal) and `AssetField` (form field holding one asset id; hands back the whole asset). Use `AssetField` wherever a CMS form stores an asset.
- **Settings** (`@inithium/cms-settings`, 0087): site title, logo and favicon (`AssetField`s; the favicon's picker lists only favicon uploads via `onlyPurpose`), copyright, theme fonts (a `FontField` per role, no roles, with a sample, 0111) and the theme as six hex codes (brand 500s, surface 100) with live scale previews; Reset removes the stored theme. `web`'s shell and `CmsTheme` render the client's theme over `UiProvider`'s default once settings load. Defaults: title "Inithium", `defaultLogo` (`@inithium/shared-ui-theme`) wherever settings have no logo, and each app's `public/favicon.ico` (Inithium's logo at 16–64 px, identical in `web`, `cms` and `docs`) wherever settings have no favicon. A surface too dark for AA text is rejected (`themeColorProblem()`); `ThemeStyles` falls back to the default theme rather than throw, so never call the scale generators unguarded in UI.
- **Users** (`@inithium/cms-users`, 0100, needs `users.view`): `UsersScreen` (25 a page from the server, search, role filter, checkboxes + Select this page + Delete N for bulk deletion with `DeleteUsersDialog`; disabled boxes for undeletable rows), `NewUserDialog`, `UserDetails` Modal (names, role, Save/View profile/Reset password/Delete in the footer; reset and delete confirm in the footer).
- **Sign-in** (`@inithium/cms-auth`): same card/alerts as `web`'s Login; `CmsAlerts` renders the AlertStack at the app root.
- **Keep form buttons out of the bottom-right corner:** alerts appear there and cover them (put Save on the left, under the fields).

### Profiles & assets
Profiles are built (0090). Assets are built in steps (0098): (A, built) database driver, `@inithium/api-assets`, Media screen, picker, logo, Image block; (B, built, 0099) R2 driver, cloud modes, member avatar/banner uploads; (C) font families.
- **Every account always has a saved avatar and banner** (0090): `createUser()` stores an `initials` avatar on `primary` (seeded by the id) and a random banner (brand tokens, random stops/intensities/counts on x and y, cell size 40–150, variance 0.3–1); `backfillUserProfiles()` covers older accounts on every start. Any new way of creating users must go through `createUser()`.
- **Profile data** lives in a `profile` subdocument on the user, apart from auth fields: `firstName?`, `lastName?`, `bio?` (rich text: `bioSchema`, bold/italic/web links, 280 chars, 0102), `avatar`, `banner`. An avatar or banner is either a **generator recipe** (an Avatar `avatarRecipeSchema` recipe drawn by DiceBear for avatars (0075), a PolyBanner `polyPatternSchema` recipe for banners (0074): options plus seed, rendered in the browser) or an **asset id**. It falls back to the generated image when there's no image or it fails to load. Never store a rendered placeholder.
- **Documents store asset ids, never URLs.** Assets are served from `/api/assets/:id` (`assetUrl(id)`); every asset is public.
- **Storage modes** (`STORAGE_MODE`, 0098): `database` (default; MongoDB `asset_blobs`, staff uploads only, `STORAGE_DATABASE_QUOTA_MB` quota, 507 past it), `cloud-staff` (R2, staff only), `cloud-all` (R2, members may upload their own avatar and banner). R2 (0099) is core's S3-client driver (`@aws-sdk/client-s3`, region `auto`, path-style; `R2_ACCOUNT_ID`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/`R2_BUCKET` required in cloud modes, optional `R2_ENDPOINT`, `R2_PUBLIC_URL`; empty values count as unset); `startStorage()` checks the bucket on startup and stops with the reason. The api streams R2 files with the safety headers, or 302s to `R2_PUBLIC_URL` (cached 1h; Cloudflare must then add the headers). Each asset records its `driver`; files stay where they were stored when the mode changes (no migration tool). Features check `GET /api/assets/storage` (`memberUploads`, `scalable`, …), never the mode or a driver name; plugin uploads follow the same who-uploads rule (0029).
- **Every asset is at most 2 MB.** Raster images become WebP within 2560 px, stepping quality then size down until they fit; other files must already fit.
- **Allowlist, detected by contents** (`assetFileTypes`): PNG, JPEG, WebP, GIF, AVIF, SVG (sanitised, staff only), ICO; WOFF2, WOFF, TTF/OTF (→ WOFF2, licence checkbox); PDF, TXT, CSV, DOCX, XLSX, PPTX; MP3; MP4. Members get raster images only. No virus scanning. Every upload has a `purpose` (`content`, `logo`, `favicon`, `font`, `document`, `avatar`, `banner`) that limits its kinds.
- **Serving:** `nosniff`, a sandboxing CSP (PDFs get one without `sandbox` so they render), inline for images/fonts/audio/video/PDF and `attachment` otherwise, a year's immutable cache, ETag, range requests.
- **Crop or fit before upload:** `UploadForm` (`@inithium/shared-media`) offers per-purpose shapes (`CROP_SHAPES`) and `ImageCropper`; `renderCrop()` draws the result in the browser. The api never crops.
- **Default alt text** lives on the asset; each use keeps its own copy (copied on pick, editable). **Usage:** the logo blocks deleting its asset (409); page content (draft or published) only warns. Add any new place that stores asset ids to `assetUsage()`; page content's references come from `contentReferences()` (shared-contracts), so a new element type declares its asset/page/font references there.
- **Members' pictures** (0099, `cloud-all` only, `memberUploads`): `profile.avatarAssetId` / `bannerAssetId` beside the always-kept recipes (fallback when absent or failing to load; `profileImage(id)` gives `{ src }`). Set via `PATCH /api/profiles/me` (must be the member's own upload of that kind: `checkProfileImage()`; `null` goes back to generated); a replaced/removed picture is deleted (`releaseProfileImage()`). Avatar/PolyBanner/ProfileLayout/Navbar take `image` (+ `onUpload` for the editors' Upload a picture). Members: raster only, no alt, 10 uploads/hour per account. Media lists member uploads only under `group=members`; deleting one clears the profile (`clearProfileImage()`). Editors still can't delete files (owner/admin only).
- **Font families** (0111, phase 1 built): font uploads store `font` (family name, weight `{ min, max }`, a variable font's axis as a range, style, metrics) read by `readFontInfo()` (`fontkit`; unreadable fonts 415). Families live in `@inithium/api-fonts` (`FontFamilyModel`, `font_families`, below `api-assets`/`api-settings`/`api-pages` so all can read them); `/api/fonts` (`fontFamiliesRouter` in `api-assets`, `assets.upload`) creates/edits them, checking each file is a font, in no other family (409) and not overlapping another file's style + weight (400), max `MAX_FONT_FAMILIES` = 6 (409). Removing a family keeps its files; deleting a file pulls it from its family (usage warns). Contracts in `shared-contracts` `fonts/` (`fontFamilyCssName()` → `Inithium Font <id>`, `fontStack()`, `fontFaceCss()`); `FontFaces` (`shared-ui-theme`) declares files. Media's "Font families" view (`FontLibrary`, `FontFamilyDialog`) hides family files from the grid unless searching. `FontSample`'s plain span is only for names Text can't take (a file not yet in a family, Inithium's default fonts); everything else uses Text `fontFamily={{ familyId }}`. CMS forms store fonts with `FontField` (`@inithium/cms-media`). Family files keep their metrics (`backfillFontFamilyMetrics()` on start for older ones). A theme font's family can't be removed (409) and its only file can't be deleted (blocking usage). With `R2_PUBLIC_URL`, fonts are cross-origin and the bucket needs a CORS policy.
- **Permissions:** `assets.upload` (owner, admin, editor), `assets.delete` (owner, admin).

### Testing
Vitest everywhere (0103), with mongodb-memory-server for api tests; the manual's `getting-started/testing.md` and `plugins/testing-plugins.md` have the detail.
- **Specs** are `*.spec.ts(x)` beside the code. Each tested project has `vitest.config.mts` (shared preset `core/vitest.preset.mts`: `database: true` gives each test file its own in-memory database, emptied before every test, and the `TEST_ENV` environment; `environment: 'jsdom'` for components), a `tsconfig.spec.json` and a `typecheck` target over it.
- **Test kits** (`type:testing`): `@inithium/api-testing` (`createTestApi()`, `TestClient`, snapshots, the plugin contract checks, `TEST_ENV`, and the Vitest setup files) and `@inithium/api-testing-accounts` (`createTestAccount()`, `createTestApiWithAuth()`, `signIn()`, `signedInClient()`). A kit has only a `tsconfig.spec.json`: the api's esbuild build compiles every lib in its project graph, spec imports included, and would otherwise emit the kits.
- **No kit-dependency cycles:** `api-http`, `api-users` and `api-auth` sit below the kits, so their specs don't import `api-testing-accounts` (and `api-http`'s don't import `api-testing`).
- **What to test:** logic when it's added or changed; api routes' permissions (401/403), refusals (400/409 with `field`) and results; seeds with `expectSeedIsIdempotent`; components only where behaviour is subtle. No coverage threshold. Every plugin: seed/unseed contract checks, its user deletion hook, its routes' permission checks.
- **The api's error handling** is `apiErrorHandler`/`apiNotFound` in `@inithium/api-http`, so tests use the real handler.
- **Browser tests (Playwright) are deferred** until the rebuilt sandbox installs its first plugin with `web`/`cms` slots, or until asked; then a smoke suite of 3–4 journeys.

### Contracts: Zod is the source of truth
- Every data shape shared between `api`, `web` and `cms` is defined as a **Zod schema** in a shared contracts lib (`scope:shared`).
- TypeScript types are **inferred** with `z.infer`, never hand-written in parallel.
- The same schema validates API requests/responses and frontend forms.

```ts
// users.schema.ts
export const userSchema = z.object({ /* ... */ });
// users.types.ts
export type User = z.infer<typeof userSchema>;
```

---

## 5. Naming conventions

| What | Pattern | Examples |
| --- | --- | --- |
| Directories | kebab-case, all lowercase | `user-profile/`, `plugin-ecom/` |
| Backend modules | `[entity].[type].ts` | `users.model.ts`, `users.service.ts`, `ecom.seed.ts` |
| Frontend modules | `[entity]-[purpose].[type].tsx` | `user-search-input.component.tsx`, `use-users.hook.ts` |
| Zod schemas | `[entity].schema.ts` | `users.schema.ts` |
| Types / interfaces | `[entity].types.ts` | `users.types.ts` |
| Branches | `<type>/<kebab-name>` | `feat/user-collection`, `refactor/user-collection` |
| Decision records | `NNNN-kebab-title.md` | `0006-serve-each-client-from-one-origin.md` |
| Docs pages | `kebab-title.md` | `environment-variables.md` |

- **Plurality:** files at the module level use the **plural** entity (`users.model.ts`, `users.types.ts`, `use-users.hook.ts`). A unit that concerns a **single instance** uses the **singular** (`user-avatar.component.tsx`, `user-search-input.component.tsx`).
- **Type suffixes in use:** `model`, `service`, `schema`, `types`, `config`, `seed`, `registry`, `routes`, `middleware`, `api`, `context`, `component`, `hook`, `styles`, `slice`, `spec`, `setup` (Vitest setup files), `extension` (TipTap extensions). When you need a new suffix, add it to this list in the same change.
- Filenames that tools require (`main.ts`, `index.ts`, `project.json`, `vite.config.mts`, `vitest.config.mts`, `tsconfig*.json`) keep the names the tool expects.

---

## 6. Working protocol (prompt → hand-off)

Claude implements and verifies that things compile. **The user does all browser testing and all pushing/merging.**

1. **Read the prompt.** If it hits a gap or an open decision, ask before writing code.
2. **Pick a branch.** Run `git branch -a` and check for an existing branch that fits the work. Reuse it if one fits; otherwise create one from `main` named `<type>/<kebab-name>` (`feat/`, `fix/`, `chore/`, `refactor/`, `hotfix/`, `docs/`, …). Never work directly on `main`.
3. **Implement** following the conventions above, with tests (see [Testing](#testing)).
4. **Verify.** Everything must lint, type-check (spec files included), pass its tests and build, and the docs check must pass (see [Commands](#7-commands)). Fix failures before handing off. Never silence a module-boundary error with an `eslint-disable` comment; fix the dependency, or raise it if the rules themselves seem wrong.
5. **Document it.** Update the manual for everything the change touched, as the [Documentation protocol](#9-documentation-protocol) requires. This isn't optional and isn't deferred: a change without its docs isn't done. Update CLAUDE.md too if the work uncovered something worth persisting (see [section 10](#10-maintaining-this-file)).
6. **Commit** to the branch: stage the changes and commit with a Conventional Commit message whose type matches the branch prefix (e.g. `feat: add user collection`).
7. **Hand off.** Report what changed, the branch and commit, the verification result, **which manual pages were added or updated** (and any CLAUDE.md edits), and **step-by-step browser-testing instructions** (which apps to start, URLs, what to click, what to expect).
8. **Iterate.** If the user returns with feedback, repeat steps 3–7 on the same branch.
9. **The user finishes.** Once the user is satisfied, they push the branch, open and merge the PR into `main` in the GitHub UI, then run `git checkout main && git pull`.

Claude **never** pushes, opens PRs, merges, or commits to `main`.

### Git & pull request strategy (performed by the user)
```bash
git checkout -b branch-name                      # 1. feature branch (Claude normally does this)
git add .                                        # 2. stage
git commit -m 'feat: summary of implemented changes'   # 3. commit
git push origin branch-name                      # 4. push
# 5. Open the PR in the GitHub UI -> merge into main
git checkout main && git pull                    # 6. sync local main
```

---

## 7. Commands

Run Nx from inside `core/`:

```bash
cd core
npm install
npx nx run-many -t lint typecheck test build   # verification (api's esbuild build type-checks)
npx nx test <project>                     # one project's tests, e.g. api-pages
npx nx serve api                          # http://localhost:3000/api
npx nx serve web                          # http://localhost:5173/
npx nx serve docs                         # http://localhost:5175/ (developer manual, dev only)
npx nx serve cms                          # http://localhost:5174/cms/

# production-style: api serves everything on :3000
npx nx run-many -t build && node --env-file=.env dist/apps/api/main.js
```

Check the docs from inside `docs/` (also part of verification):

```bash
cd docs
npm install
npm run check   # structure, frontmatter, decisions, links, and coverage of components, libs, env vars and examples
```

**Environment gotchas**
- VS Code's Nx Console sets `NX_WORKSPACE_ROOT_PATH` to the repo root, which breaks Nx. Override it in the shell: `export NX_WORKSPACE_ROOT_PATH="$(pwd -W)"` (Git Bash, from `core/`), and use `NX_DAEMON=false` if the daemon misbehaves.
- `querySrv ECONNREFUSED` on startup means Node can't do the SRV DNS lookup that `mongodb+srv://` needs. This happens on Windows with a VPN (e.g. AWS Client VPN), where Node's resolver falls back to `127.0.0.1`. Locally, use Atlas's standard `mongodb://host1,host2,host3/<db>?tls=true&replicaSet=…&authSource=admin` string instead. It's the same cluster with no SRV lookup.
- `core/.npmrc` sets `legacy-peer-deps=true`. Keep it. (The conflict it works around isn't recorded yet.)
- Tailwind is v4 via `@tailwindcss/vite` (Nx 23's React generator no longer supports Tailwind). New React apps/libs need it wired manually.
- Vite resolves `@inithium/*` path aliases natively via `resolve.tsconfigPaths: true`. Nx generators still emit the deprecated `nxViteTsPaths`/`nxCopyAssetsPlugin`. Strip them from anything newly generated, and don't add `vite-tsconfig-paths`.
- New projects need an `eslint.config.mjs` that spreads the root config (React projects add `nx.configs['flat/react']`). See the existing apps.
- Tailwind only scans the app's own folder unless told otherwise. Each app's `styles.css` has `@source "../../../libs";` so classes used in libs are generated. Keep it when editing styles.
- The docs app's build isn't cached (`cache: false` in `apps/docs/project.json`): it reads the manual from `../docs`, outside the Nx workspace, so Nx can't see Markdown changes and would replay a stale build.
- `tsconfig.base.json` sets `resolveJsonModule` so JSON (e.g. DiceBear style definitions) can be imported with types.
- The first api test run downloads a MongoDB binary for mongodb-memory-server (~100 MB, cached in `~/.cache/mongodb-binaries`); after that tests need no network. CI (`.github/workflows/verify.yml`) caches it via `MONGOMS_DOWNLOAD_DIR`.
- Spec type-checks compile lib code under each lib's strict tsconfig, which the api build doesn't; untyped packages need real typings (e.g. `@types/wawoff2`), not a `.d.ts` inside one lib.
- Prefix a required-but-unused parameter with `_` (e.g. `_next` in an Express error handler, which needs all four parameters); ESLint ignores those.

---

## 8. Current state vs. target

The repo has not caught up with these guidelines yet. Known pending work:

- [ ] **Sandbox tooling** still uses the old model. It copies plugin `api/`/`web/` folders into `apps/*/src/plugins/`, clones one named workspace, and has no seeding. It needs to be rebuilt per 0106 and 0105: generated workspaces with their own ports and database, run beside core; the one install tool (copy into `libs/plugins/<name>/`, registry wiring, manifest, versions) for all four layers; install/activate/deactivate/two-step eject; re-copying a plugin while it's developed; demo data; installed plugins' manuals in the docs app; each plugin's tests and lifecycle check (0103); and generating and pushing the showcase.
- [ ] **Plugin lifecycle in core** (0105): the runtime plugin-state store, the CMS Plugins screen (activation toggles and plugin settings, a new permission for owners), activation honoured by every slot, and the manifest. Not built; mechanics open (0107).
- [ ] **Environments** (0104): the showcase at `inithium.onrender.com` (today it runs plain core) and client staging services are planned, not built (0108–0110).
- [ ] **Slot contracts and registry files:** the web registry (`apps/web/src/app/plugins.registry.ts`: page templates, profile slots) and the api registry (`apps/api/src/app/plugins.registry.ts`: user deletion hooks, 0100) exist; the cms registry and the other slots don't yet.
- [ ] **Needs testing by the user (merged untested):** (1) assets step B on a real Cloudflare R2 bucket on Render (`STORAGE_MODE=cloud-all`; steps in `docs/backend/assets.md#cloudflare-r2`), only tested against a local S3 stand-in; (2) Express `trust proxy = 1` behind Render's proxy (10 failed sign-ins from one browser, the 11th refused, another network still allowed). The first Render deploy otherwise works (build, sign-in, assets in `database` mode).
- [ ] **Page system** (0078–0082), in phases: (1, built) page and settings contracts, permissions, API endpoints, seeded core pages and settings; (2, built) `web` shell: template registry, routes, layouts lib (`default`, `bare`), audiences, transitions, `usePageReady`, Navbar and Footer from records, placeholder pages; (3, built) CMS sidebar layout, Dashboard, Pages list and edit dialog, Settings screen with theme colours; (4) real profile page (built, 0090); content pages (0093, built: contracts, renderer and template; creating, duplicating and deleting; the editor, 0094; the seeded privacy policy, 0097; the Image block, 0098); the page builder redesign (0116), steps 1–6 of 7 built (model, upgrade, renderer; Layers; properties per device, saving v2, replacing the v1 editor; the Add picker, empty page and name tags; the edit lock; accessibility warnings and usage walking the tree); still to build: plugin elements; later: collection layouts.
- [ ] **`web` end-user auth:** sign-up, sign-in and a voluntary password change (the profile's Account tab, `PasswordChangeForm`; it signs out other sessions) are built (0083, 0088). Still missing: password reset and email verification (both need email).
- [ ] **Assets** (0098, 0099): steps A, B and C built (database and R2 drivers, cloud modes, Media screen, picker, logo, Image block, members' pictures; font families, 0111–0115: the library, the theme's fonts, FontPicker and Text `{ familyId }`, and page-builder typography, described under Profiles & assets, Site settings, UI library and Pages & routing). Still to build: a tool to move files between drivers if a client needs one.
- [ ] **Profiles:** built (0090), with uploaded pictures in `cloud-all` (0099). Still missing: email changes, privacy settings and usernames. The bio is rich text (0102).
- [ ] **UI library:** theme, Container, Text, Icon, Button, Input, Checkbox, Loader, Switch, Divider, RadioGroup, Select, Slider and Tooltip are built (every planned component, plus Image), and the composites FontPicker, ImageCropper, Modal, Alert, AlertStack, Tabs, ColorPicker, AutoIncrementingList, Drawer, Breadcrumbs, Pagination, PolyBanner, Avatar, Navbar, Footer, IconPicker, RichTextField, RichTextView (every planned composite) and Menu (0117), and the layouts DefaultLayout, BareLayout, FullWidthLayout, ProfileLayout and SidebarLayout. Remaining layouts: collection-list and collection-item. Ring/outline colours wait on width/style props (0033).
- [ ] **Clone exclusion:** the clone tooling and upstream mechanism (0017, 0018) must leave out `apps/docs` when they're built; the install tooling must also leave out plugin `*.spec.ts(x)` files (0103).
- [ ] **Testing** (0103): Vitest, the test kits, CI and core's backfill (permissions, contracts, theme scales, rich text, content editing, config, auth, users, user management, pages and seeds, settings, profiles, health, assets: uploads, processing, serving, usage and font families) are built. Not yet covered: the R2 driver (needs a bucket or an S3 stand-in), the web shell and CMS screens. `TestClient` sends `FormData` as multipart and takes extra headers through `request(method, path, body, headers)`. Still to build: the sandbox's per-plugin lifecycle check (install → build → seed ×2 → unseed → eject → build) with the sandbox rebuild; Playwright smoke tests when their trigger is reached.

---

## 9. Documentation protocol

Inithium documents itself as it's built. `docs/` is a **front-to-back developer manual** for using Inithium, viewed in the docs app (`core/apps/docs`, 0053) with a sidebar, rendered pages and live examples. Write it for a developer using Inithium, not as notes to yourself. Nothing in `docs/` or a plugin's `docs/` ever reaches client repos or installed plugins (0052).

**The rule: a change is not done until the manual describes it.** Docs are written in the same commit as the change and listed in the hand-off. There is no "document it later".

### How the manual is organised

| Folder | Contains |
| --- | --- |
| `docs/getting-started/` | What Inithium is, local setup, how work is done |
| `docs/architecture/` | Core, plugins, sandbox, client repos, provisioning |
| `docs/backend/` | The api and its libs: environment, database, auth, users, assets |
| `docs/ui-library/` | Overview, Style props, then `theme/`, `animations/`, `components/`, `composites/`, `layouts/` |
| `docs/plugins/` | How plugins work; each plugin's own manual lives in `plugins/plugin-<name>/docs/` |
| `docs/reference/` | Look-up pages: commands, conventions, libs, routing and hosting |
| `docs/decisions/` | Decision records (not shown in the docs app): Context, Decision, Alternatives considered, Consequences |

- Folders are sidebar sections and sub-folders are sub-sections. **Every section folder has an `index.md`** (its sidebar label and landing page).
- **Every page has a frontmatter `order`**, unique among its siblings.
- **New pages start from `docs/templates/`** (`page.md`, `component.md`, `decision.md`). Frontmatter is validated by `docs/tooling/docs.schema.mjs`; ids and dates are quoted strings.
- Plugin docs use the same layout; decision ids are `"<name>-NNNN"` and `scope` is `plugin`.

### What to update, for every change

| The change… | Update in the same commit |
| --- | --- |
| Adds or changes a UI component, composite or layout | Its page, `docs/ui-library/<layer>s/<kebab-name>.md`, from `templates/component.md`; its examples (see below); the layer's `index.md` table; `style-props.md` if a shared shape changed |
| Adds or changes a style prop, theme token or animation behaviour | `ui-library/style-props.md`, `ui-library/theme/` or `ui-library/animations/`, and every component page that lists it |
| Adds or changes a lib | Its row and section in `reference/libs.md`, and the manual page for its area (e.g. `backend/`) |
| Adds or changes an env var | `backend/environment-variables.md` (and `core/.env.example`) |
| Adds or changes an API route, model or backend behaviour | The page for that area in `backend/` (create one if none fits) |
| Adds or changes a command, port, URL or route | `reference/commands.md`, `reference/routing-and-hosting.md`, and `getting-started/` if setup changed |
| Adds or changes a convention, tag or boundary rule | `reference/conventions.md` |
| Changes how core, plugins, sandbox or client repos work | `architecture/` |
| Makes a decision | An `accepted` record in `decisions/`. Settling an open decision updates its `proposed` record. |
| Changes a decision | A new record that `supersedes` the old one; set the old one `superseded` with `supersededBy`. Never rewrite an accepted record's body. Repoint pages that cited the old one. |
| Raises an open question | A `proposed` record, listed under [Open decisions](#open-decisions) |
| Changes a rule in CLAUDE.md | The manual pages that describe it |

If nothing fits, add a page to the section it belongs to; if no section fits, raise it.

### Component pages and examples

- **Structure** (from `templates/component.md`): Import; **Props at a glance** (every prop in one table, linked); **Props** (one subsection per prop with type, default and a JSX snippet showing every way to write it); **Examples**; **Accessibility**; **Notes**.
- **Shared shapes** (colour value, sides, size, radius, variants) are defined once on `ui-library/style-props.md` and linked, never repeated.
- **Examples:** each one is a titled `### Example: …` block with a one-line purpose and self-contained code (imports included).
  - Every example is a real file, `core/apps/docs/src/examples/<section>/<name>.example.tsx`, which default-exports one self-contained component (linted, type-checked and built). The page embeds it with a fenced block, and the docs app renders it live above its exact source:

    ```example
    ui-library/<component>/<name>
    ```

  - Examples must work on their own: no required props, and no full-screen effects on load (e.g. an overlay starts closed).
  - Per-prop snippets stay as ordinary code blocks.
- **Enforcement:** the docs check fails if an exported component has no page, or a page doesn't match its export.

### What the docs check enforces

- **Structure:**
  - frontmatter;
  - kebab-case file names;
  - an `index.md` in every section;
  - a unique `order` among siblings;
  - no pages at the root.
- **Decisions:** required sections in order, valid cross-references, and supersession recorded on both sides.
- **Links:** every relative link resolves.
- **Coverage:**
  - a page for every exported UI component, composite and layout, at the right path;
  - every core lib listed in `reference/libs.md`, and no lib listed that doesn't exist;
  - every `envSchema` variable in the `backend/environment-variables.md` table and in `core/.env.example`, and no variable documented that isn't in the schema;
  - every embedded `example` file exists and default-exports its component, and every example file is embedded somewhere.

### Rules

- Never invent rationale or alternatives. Ask the user for the why. If it isn't known, write "None recorded." or "Rationale not recorded."
- Backfilled pages describe only what is already decided or built.
- CLAUDE.md holds the rules for working in this repo; the manual holds the developer-facing explanation; decision records hold the reasoning. Don't copy whole sections between them; link to the decision that explains a rule.
- Client-facing CMS documentation is out of scope; it's written per client.

---

## 10. Maintaining this file

CLAUDE.md is the source of truth for the architecture, so keep it current. When a task uncovers something a future session would need, record it **in the same commit as the change that prompted it**.

**Update without asking:** facts that have been discovered or decided.
- Environment gotchas, workarounds, and commands that turned out to be needed.
- New file-type suffixes, libs, slots or tags created while following existing rules.
- Ticking off or adding items in [Current state vs. target](#8-current-state-vs-target).
- Recording a decision the user made in conversation, including moving it out of [Open decisions](#open-decisions), together with its decision record (see [section 9](#9-documentation-protocol)).

**Ask first:** anything that would change the architecture.
- New rules, or changes or removals to existing rules, contracts, conventions or the working protocol.
- Settling an open decision on your own judgement. Propose it; don't record it.
- Anything that contradicts what this file currently says.

**How to edit**
- Put the note in the section it belongs to rather than appending it at the end, and replace stale text instead of adding to it.
- Keep it concise: rules and facts, not a narrative of the task.
- Always list CLAUDE.md edits in the hand-off so the user can review them.

---

## Open decisions

These haven't been decided. **Ask before doing work that depends on them.** Each has a `proposed` record in `docs/decisions/`, which is updated when the decision is made.

- **Slot catalogue** ([0015](docs/decisions/0015-slot-catalogue.md)): partly settled (web page templates, Navbar ancillary, profile tabs/sidebar/actions, whose shapes 0090 settles). Also settled: the "user deleted" hook (`UserDeletionHook`, api registry, 0100), content elements for the page builder (api/web/cms registries, 0116; shape settled when built), and that every slot must honour runtime activation (0105). Still open: API routes, models, CMS screens and sidebar entries, plugin settings, and every other contract shape (no storage driver slot: R2 ships in core, 0098).
- **Plugin-to-plugin dependencies** ([0016](docs/decisions/0016-plugin-to-plugin-dependencies.md)): can a plugin depend on another (e.g. `ecom` using `storage`), and how would install/eject order, boundaries, versions and deactivation handle it?
- **Upstream mechanism** ([0017](docs/decisions/0017-upstream-mechanism.md)): core lives in `core/` inside the Inithium repo next to `plugins/`, `sandbox/` and `docs/`. Client upstream merges must bring in core **only**, never plugin source or docs, but how (separate core repo, subtree split, etc.) is undecided. Settled around it: plugin updates don't travel by upstream (0105). Also open: how the manifest's core version is updated, CI workflows for client repos, and core updates reaching staging first.
- **Install/eject tooling for client repos** ([0018](docs/decisions/0018-install-eject-tooling-for-client-repos.md)): partly settled by 0105 (one copying tool for every workspace, owning registries and the manifest). Still open: where it lives and how it's run against a real client repo, which has no `plugins/`.
- **Seed tracking** ([0019](docs/decisions/0019-seed-tracking.md)): how unseed identifies exactly what its seed created. Settle with 0107's startup step (a `plugins` collection could serve both).
- **Plugin lifecycle mechanics** ([0107](docs/decisions/0107-plugin-lifecycle-mechanics.md)): how seeds/migrations/unseeds run against a hosted database (suggested: on api startup), what each slot does while inactive, the activation permission's name, a sandbox `sync`/`watch` command, the eject export format, demo data's shape, and the manifest/version format.
- **Client staging** ([0108](docs/decisions/0108-client-staging-workflow-and-data.md)): one repo with `staging`/`main` branches (suggested) or two repos; staging data (suggested: copy to production once at launch, then refresh staging from production before reviews); access and isolation; uploads; what's scripted.
- **Client hosting plans and backups** ([0109](docs/decisions/0109-client-hosting-plans-and-backups.md)): free baseline vs paid production (Render instance, Atlas with backups), backups on free clusters, upload storage limits.
- **Showcase** ([0110](docs/decisions/0110-showcase-content-and-access.md)): which plugins and demo content, demo accounts, resetting, a showcase staging service, and how it's generated and pushed.
- **Password policy leftovers** ([0024](docs/decisions/0024-password-policy.md)): the rules are decided; still open are breached-password checks and whether `SEED_DEV_PASSWORD` must meet the policy.
- **UI library design** ([0033](docs/decisions/0033-ui-library-design-open-questions.md)): other effects (transitions, opacity, transforms), an inline Container (`as="span"`), size/variant presets, ring/outline width and style, centring (`margin: 'auto'`), text on brand colours in dark mode, and whether lint should stop the api importing React UI libs.
