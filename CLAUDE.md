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
  docs/      Documentation library for the ecosystem. Inithium repo only; never reaches clients.
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
- An exact replica of core **with every plugin installed**, used to test plugins in the browser. Start the sandbox instead of core when working on plugins.
- The sandbox is **rebuilt on demand, never committed**. The `sandbox/` folder holds tooling only; generated workspaces go in `sandbox/workspaces/`, which is git-ignored. Because it is always regenerated from `core/` + `plugins/`, it cannot drift from core.
- The tooling must support adding and ejecting individual plugins so that installation, seeding, unseeding and ejection can each be verified.

### docs/
- Decision records, guides and reference pages for core and the ecosystem, written so they can later be rendered as the public docs site. See [section 9](#9-documentation-protocol).
- A standalone npm package (like `sandbox/`), not part of the Nx workspace, so core stays free of docs tooling.

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
  docs/        The plugin's documentation (see section 9). Never installed into a client.
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

### Plugin data
- **Plugins never add fields to `users`** (or to the core user schema or contract). A plugin keeps per-user data in its own collections, each document carrying a `userId` (e.g. `ecom` owns `addresses`).
- Plugin data the UI needs comes from the plugin's own endpoints, never from `GET /api/auth/me`.

### Ejecting
Ejecting a plugin = unseed → remove its registry entries → delete `libs/plugins/<name>/`. After an eject, the workspace must type-check and build exactly as it did before the plugin was installed.

---

## 3. Client repositories

- A client app is created by cloning core. It receives core plus only the plugins that client uses.
- **Core updates reach clients via git upstream merges.** Each client repo keeps Inithium core as an upstream remote and merges improvements.
- To keep those merges clean, **client repos must not edit core files.** Anything client-specific goes in one of three places:
  - **Configuration** stored through the CMS (preferred).
  - **Plugins** installed from the library.
  - **`libs/client/`**: a reserved area for genuinely one-off client code. Core never puts anything there. Client libs plug into the same slot registries as plugins and follow all the same conventions.
- If a client needs a change to core behaviour, make it in Inithium core (generalised for every client) and merge it upstream. Do not patch it in the client repo.

### Accounts & provisioning
Every client owns their own infrastructure, so their usage and any paid upgrades never land on the Inithium/personal accounts:

| | Inithium, sandbox, plugins, personal projects | Each client |
| --- | --- | --- |
| GitHub | Personal account | Client's own GitHub account and repo |
| MongoDB | One shared Atlas cluster; a separate database per project | Client's own Atlas account and cluster, with a single database |
| Render | Personal Render account | Client's own Render account (signed in with their GitHub) |

Provisioning a client:
1. Clone core, install the client's plugins, and push one initial commit to a new repo on the client's GitHub.
2. Create the client's Atlas account, cluster and database.
3. Create the client's Render account through their GitHub, deploy the repo, and set the env vars (see [Environment & database](#environment--database)).

Switching an app between databases or clusters is only ever a change to `MONGODB_URI`. Nothing in code is tied to a specific cluster.

**Render web service settings** (set in the Render dashboard; not yet verified on a first deploy):
- Root directory: `core`
- Build command: `npm ci && npx nx run-many -t build`
- Start command: `node dist/apps/api/main.js`
- Environment variables: `MONGODB_URI`, `HOST=0.0.0.0`, `NODE_VERSION=22`, `NODE_ENV=production`, `JWT_ACCESS_SECRET` and `SEED_DEV_PASSWORD` (both unique per client), and `SEED_DEV_EMAIL`. Render provides `PORT`.

---

## 4. Nx monorepo conventions

### Apps are thin orchestrators
Apps are entry points that **consume** libs. They contain **no business logic**: no data access, no validation rules, no domain decisions. An app's job is bootstrapping, composition, routing to lib-provided handlers and pages, and its plugin registry.

Core ships three apps (its libs are listed in `docs/reference/libs.md`):

| App | Role |
| --- | --- |
| `api` | Express server. The **single source of truth** and the **only** thing that talks to MongoDB. |
| `web` | The end-user site. Scaffolded at runtime from the settings and pages configured in the CMS. |
| `cms` | The client portal, where clients change the `web` site's settings and pages. |

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
- Every lib is tagged with all three groups below, and boundaries are enforced with ESLint `@nx/enforce-module-boundaries` (rules in `core/eslint.config.mjs`). Apps carry **only** their `scope:` tag (`scope:api|web|cms`); the `type:` and `origin:` rules apply to libs, and apps must stay free to import plugin/client libs through their registries.

| Tag group | Values | Meaning |
| --- | --- | --- |
| `scope:` | `api`, `web`, `cms`, `shared` | Which app(s) may consume it. `shared` = usable by all (e.g. contracts). |
| `type:` | `feature`, `data-access`, `ui`, `util` | Its role in the layering. |
| `origin:` | `core`, `plugin`, `client` | Where it came from. |

Boundary rules:
- `scope:web` / `scope:cms` / `scope:api` libs may depend only on their own scope and `scope:shared`. Frontend libs never import `api` code, and `api` never imports frontend code.
- `type:util` → nothing but other utils; `type:ui` → `ui`, `util`; `type:data-access` → `data-access`, `util`; `type:feature` → anything.
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

### UI library & theme
Not built yet; the design is in progress (open questions in 0033). Decided so far:
- **Four layers**, each building only on those above it: **theme** (branding source of truth) → **components** (atoms: container, text, button, input, select, checkbox, radio, switch, slider, icon, divider, spinner, tooltip) → **composites** (molecules, e.g. modal, alert, drawer, tabs) → **layouts** (organisms, e.g. collection view).
- **Six colour tokens:** `primary`, `secondary`, `tertiary`, `quaternary`, `accent`, `surface`, each on a 50–950 scale. No status tokens. Clients set the 500 of each brand token and the 100 of surface; the rest is generated.
- **Surface roles:** 50–400 backgrounds, 500 borders and dividers, 600–950 text. The generator guarantees every text step meets WCAG AA on every background step.
- **Dark mode mirrors every scale** (50↔950 … 500 stays). Any UI (core, plugins, generated pages) must use token roles rather than fixed light-mode colours, so it flips without dark-mode-specific code.

### Profiles & assets
Neither is built yet. When they are:
- **Profile data** lives in a `profile` subdocument on the user, apart from auth fields. An avatar or banner is either a **generator recipe** (Dicebear for avatars, Trianglify for banners: style/options plus seed, rendered in the browser) or an **asset id**. It falls back to the generated image when there's no image or it fails to load. Never store a rendered placeholder.
- **Documents store asset ids, never URLs.** Assets are served from `/api/assets/:id`.
- **Bytes live behind a storage driver.** Core's default driver is MongoDB (not scalable, 2 MB per asset), and the storage plugin adds an object-storage driver (R2) through a slot. Features check the **driver's capabilities**, never which plugin is installed.
- **Avatar and banner image uploads require a scalable driver.** Without one, only generated avatars and banners are offered. The API enforces this.
- **Any file type may be uploaded,** but every asset response sends `X-Content-Type-Options: nosniff` and a sandboxing CSP. Types outside the inline-safe list are sent with `Content-Disposition: attachment`.

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
- **Type suffixes in use:** `model`, `service`, `schema`, `types`, `config`, `seed`, `registry`, `routes`, `middleware`, `api`, `component`, `hook`. When you need a new suffix, add it to this list in the same change.
- Filenames that tools require (`main.ts`, `index.ts`, `project.json`, `vite.config.mts`, `tsconfig*.json`) keep the names the tool expects.

---

## 6. Working protocol (prompt → hand-off)

Claude implements and verifies that things compile. **The user does all browser testing and all pushing/merging.**

1. **Read the prompt.** If it hits a gap or an open decision, ask before writing code.
2. **Pick a branch.** Run `git branch -a` and check for an existing branch that fits the work. Reuse it if one fits; otherwise create one from `main` named `<type>/<kebab-name>` (`feat/`, `fix/`, `chore/`, `refactor/`, `hotfix/`, `docs/`, …). Never work directly on `main`.
3. **Implement** following the conventions above.
4. **Verify.** Everything must lint, type-check and build, and the docs check must pass (see [Commands](#7-commands)). Fix failures before handing off. Never silence a module-boundary error with an `eslint-disable` comment; fix the dependency, or raise it if the rules themselves seem wrong.
5. **Update the docs and CLAUDE.md.** Write or update docs as the [Documentation protocol](#9-documentation-protocol) requires, and update CLAUDE.md if the work uncovered something worth persisting (see [section 10](#10-maintaining-this-file)).
6. **Commit** to the branch: stage the changes and commit with a Conventional Commit message whose type matches the branch prefix (e.g. `feat: add user collection`).
7. **Hand off.** Report what changed, the branch and commit, the verification result, any docs and CLAUDE.md edits, and **step-by-step browser-testing instructions** (which apps to start, URLs, what to click, what to expect).
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
npx nx run-many -t lint typecheck build   # verification (api's esbuild build type-checks)
npx nx serve api                          # http://localhost:3000/api
npx nx serve web                          # http://localhost:5173/
npx nx serve cms                          # http://localhost:5174/cms/

# production-style: api serves everything on :3000
npx nx run-many -t build && node --env-file=.env dist/apps/api/main.js
```

Check the docs from inside `docs/` (also part of verification):

```bash
cd docs
npm install
npm run check   # frontmatter, file names, decision sections, cross-references, relative links
```

**Environment gotchas**
- VS Code's Nx Console sets `NX_WORKSPACE_ROOT_PATH` to the repo root, which breaks Nx. Override it in the shell: `export NX_WORKSPACE_ROOT_PATH="$(pwd -W)"` (Git Bash, from `core/`), and use `NX_DAEMON=false` if the daemon misbehaves.
- `querySrv ECONNREFUSED` on startup means Node can't do the SRV DNS lookup that `mongodb+srv://` needs. This happens on Windows with a VPN (e.g. AWS Client VPN), where Node's resolver falls back to `127.0.0.1`. Locally, use Atlas's standard `mongodb://host1,host2,host3/<db>?tls=true&replicaSet=…&authSource=admin` string instead. It's the same cluster with no SRV lookup.
- `core/.npmrc` sets `legacy-peer-deps=true`. Keep it. (The conflict it works around isn't recorded yet.)
- Tailwind is v4 via `@tailwindcss/vite` (Nx 23's React generator no longer supports Tailwind). New React apps/libs need it wired manually.
- Vite resolves `@inithium/*` path aliases natively via `resolve.tsconfigPaths: true`. Nx generators still emit the deprecated `nxViteTsPaths`/`nxCopyAssetsPlugin`. Strip them from anything newly generated, and don't add `vite-tsconfig-paths`.
- New projects need an `eslint.config.mjs` that spreads the root config (React projects add `nx.configs['flat/react']`). See the existing apps.
- Tailwind only scans the app's own folder unless told otherwise. Each app's `styles.css` has `@source "../../../libs";` so classes used in libs are generated. Keep it when editing styles.
- Prefix a required-but-unused parameter with `_` (e.g. `_next` in an Express error handler, which needs all four parameters); ESLint ignores those.

---

## 8. Current state vs. target

The repo has not caught up with these guidelines yet. Known pending work:

- [ ] **Sandbox tooling** still uses the old model. It copies plugin `api/`/`web/` folders into `apps/*/src/plugins/`, clones one named workspace, and has no seeding. It needs to be rebuilt for: libs under `libs/plugins/<name>/`, registry wiring, the `cms` and `contracts` layers, seed/unseed, single-plugin add/eject, and a "rebuild with all plugins" command.
- [ ] **Slot contracts and registry files** don't exist in core yet.
- [ ] **First Render deploy** hasn't happened yet. The settings in [Accounts & provisioning](#accounts--provisioning) still need confirming, including that Express `trust proxy = 1` matches Render's proxy setup.
- [ ] **First-sign-in password change:** accounts with `passwordChangeRequired: true` (e.g. the seeded dev account) must change their password before doing anything else. Not built yet; blocked on the password policy (0024).
- [ ] **User management** (creating owner/admin/editor accounts from the CMS) isn't built; blocked on role assignment rules (0025). Until then, other accounts can only be created directly in MongoDB.
- [ ] **`web` end-user auth** (sign-up and sign-in for `user` accounts) isn't built.
- [ ] **Assets** (asset records, the MongoDB storage driver, `/api/assets/:id` with safe headers, capability checks) aren't built (0028).
- [ ] **Profiles** (the `profile` subdocument, generated avatars and banners, and the reusable image-with-generated-fallback component) aren't built (0027).
- [ ] **UI library** (theme, components, composites, layouts) isn't built; its design is being settled (0030–0033).
- [ ] **Docs site** doesn't exist yet. Docs are Markdown only; the generator will be chosen when the marketing site is built.
- [ ] **`core/README.md`** is still the Nx-generated boilerplate.

---

## 9. Documentation protocol

`docs/` is the running documentation library for the ecosystem. It will become the public docs on the Inithium marketing site, so write for a developer building on Inithium, not as notes to yourself. Docs live in the Inithium repo only: nothing in `docs/` or a plugin's `docs/` is ever copied into core, a client repo or an installed plugin.

### Where docs go

| Folder | Contains |
| --- | --- |
| `docs/decisions/` | Decision records: one decision each, with Context, Decision, Alternatives considered and Consequences. |
| `docs/guides/` | Task-oriented walkthroughs (how to do X, step by step). |
| `docs/reference/` | Look-up pages: env vars, commands, libs, slots, conventions. |
| `plugins/plugin-<name>/docs/` | The same three folders for one plugin. Decision ids are `"<name>-NNNN"` and `scope` is `plugin`. |

Start from `docs/templates/`. Frontmatter is validated by the Zod schemas in `docs/tooling/docs.schema.mjs`; ids and dates are quoted strings.

### When to write docs (in the same commit as the change)

- **A decision is made** (by the user, or an open decision is settled): add an `accepted` decision record. Settling an open decision updates its `proposed` record to `accepted`.
- **A decision changes:** add a new record that `supersedes` the old one, and set the old one to `superseded` with `supersededBy`. Never rewrite the body of an accepted record.
- **A new open decision comes up:** add a `proposed` record and list it under [Open decisions](#open-decisions).
- **Developer-facing behaviour changes** (an env var, command, lib, slot, route, convention or generator workaround): update the matching reference page and any guide whose steps changed. A new lib gets a row in `docs/reference/libs.md`.
- **A rule in CLAUDE.md changes:** update the docs that describe it.

### Rules

- Never invent rationale or alternatives. Ask the user for the why. If it isn't known, write "None recorded." or "Rationale not recorded."
- CLAUDE.md holds the rules for working in this repo; docs hold the reasoning and the developer-facing explanation. Don't copy whole sections between them; link from docs to the decision that explains a rule.
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

- **Slot catalogue** ([0015](docs/decisions/0015-slot-catalogue.md)): exactly which slots core exposes (including a "user deleted" hook and a storage driver slot), and their contract shapes.
- **Plugin-to-plugin dependencies** ([0016](docs/decisions/0016-plugin-to-plugin-dependencies.md)): can a plugin depend on another (e.g. `ecom` using `storage`), and how would install/eject order and boundaries handle it?
- **Upstream mechanism** ([0017](docs/decisions/0017-upstream-mechanism.md)): core lives in `core/` inside the Inithium repo next to `plugins/`, `sandbox/` and `docs/`. Client upstream merges must bring in core **only**, never plugin source or docs, but how (separate core repo, subtree split, etc.) is undecided.
- **Install/eject tooling for client repos** ([0018](docs/decisions/0018-install-eject-tooling-for-client-repos.md)): where it lives and how it's run against a real client repo, as opposed to the sandbox.
- **Seed tracking** ([0019](docs/decisions/0019-seed-tracking.md)): how unseed identifies exactly what its seed created.
- **Password policy** ([0024](docs/decisions/0024-password-policy.md)): minimum length/complexity, breached-password checks, and whether they apply to `SEED_DEV_PASSWORD`.
- **Role assignment rules** ([0025](docs/decisions/0025-role-assignment-rules.md)): who may create or change `owner`, `admin` and `editor` accounts, and whether a client can have several owners.
- **Plugin upload storage requirements** ([0029](docs/decisions/0029-storage-requirements-for-plugin-uploads.md)): whether plugin uploads (e.g. blog post or product images) require a scalable storage driver, and who decides.
- **UI library design** ([0033](docs/decisions/0033-ui-library-design-open-questions.md)): the shared prop system (how props become styles, serializable Zod props, states, breakpoints, `className`), one lib or four, colour prop details, the remaining prop families, the accessibility approach, presets, and what else the theme holds.
- **Testing** ([0021](docs/decisions/0021-automated-testing.md)): no automated tests for now (verification is typecheck, build and the docs check). Revisit when libs gain real logic.
