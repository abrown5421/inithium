# Inithium — Architecture & Working Guidelines

Inithium is a template-and-plugins ecosystem. Every client application starts as a clone of **core**, and features that not every client needs are added as **plugins**. These guidelines exist to keep that architecture intact as the codebase grows. When a request conflicts with them, stop and raise it. Do not quietly work around them.

> **Do not guess.** If a task depends on an unresolved decision (see [Open decisions](#open-decisions)) or anything else that isn't specified here, ask before you implement.

---

## 1. Ecosystem: the three root directories

```
inithium/
  core/      Clonable Nx monorepo. The base of every client app. Contains zero plugin code.
  plugins/   Library of installable/ejectable plugins that extend core through slots.
  sandbox/   Tooling that rebuilds a replica of core with every plugin installed, for testing.
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

---

## 4. Nx monorepo conventions

### Apps are thin orchestrators
Apps are entry points that **consume** libs. They contain **no business logic**: no data access, no validation rules, no domain decisions. An app's job is bootstrapping, composition, routing to lib-provided handlers and pages, and its plugin registry.

Core ships three apps and, initially, no libs:

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

### Libs hold the business logic
- Libs are split **by concern** (e.g. UI/theming, auth, realtime). Each concern is a standalone lib, and apps consume it. When adding logic, find the lib that owns that concern or create a new one; never put it in an app.
- Import aliases follow `@inithium/<lib-name>`.
- Every lib is tagged, and boundaries are enforced with ESLint `@nx/enforce-module-boundaries`:

| Tag group | Values | Meaning |
| --- | --- | --- |
| `scope:` | `api`, `web`, `cms`, `shared` | Which app(s) may consume it. `shared` = usable by all (e.g. contracts). |
| `type:` | `feature`, `data-access`, `ui`, `util` | Its role in the layering. |
| `origin:` | `core`, `plugin`, `client` | Where it came from. |

Boundary rules:
- `scope:web` / `scope:cms` / `scope:api` libs may depend only on their own scope and `scope:shared`. Frontend libs never import `api` code, and `api` never imports frontend code.
- `type:util` → nothing but other utils; `type:ui` → `ui`, `util`; `type:data-access` → `data-access`, `util`; `type:feature` → anything.
- `origin:core` libs must **never** depend on `origin:plugin` or `origin:client` libs. Plugin and client libs may depend on core libs. Only the app registry files import plugin/client libs.

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

- **Plurality:** files at the module level use the **plural** entity (`users.model.ts`, `users.types.ts`, `use-users.hook.ts`). A unit that concerns a **single instance** uses the **singular** (`user-avatar.component.tsx`, `user-search-input.component.tsx`).
- **Type suffixes in use:** `model`, `service`, `schema`, `types`, `seed`, `registry`, `component`, `hook`. When you need a new suffix, add it to this list in the same change.
- Filenames that tools require (`main.ts`, `index.ts`, `project.json`, `vite.config.mts`, `tsconfig*.json`) keep the names the tool expects.

---

## 6. Working protocol (prompt → hand-off)

Claude implements and verifies that things compile. **The user does all browser testing and all pushing/merging.**

1. **Read the prompt.** If it hits a gap or an open decision, ask before writing code.
2. **Pick a branch.** Run `git branch -a` and check for an existing branch that fits the work. Reuse it if one fits; otherwise create one from `main` named `<type>/<kebab-name>` (`feat/`, `fix/`, `chore/`, `refactor/`, `hotfix/`, `docs/`, …). Never work directly on `main`.
3. **Implement** following the conventions above.
4. **Verify.** Everything must type-check and build (see [Commands](#7-commands)). Fix failures before handing off.
5. **Commit** to the branch: stage the changes and commit with a Conventional Commit message whose type matches the branch prefix (e.g. `feat: add user collection`).
6. **Hand off.** Report what changed, the branch and commit, the verification result, and **step-by-step browser-testing instructions** (which apps to start, URLs, what to click, what to expect).
7. **Iterate.** If the user returns with feedback, repeat steps 3–6 on the same branch.
8. **The user finishes.** Once the user is satisfied, they push the branch, open and merge the PR into `main` in the GitHub UI, then run `git checkout main && git pull`.

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
npx nx run-many -t typecheck build     # verification (api's esbuild build type-checks)
npx nx serve api                        # http://localhost:3000
npx nx serve web                        # http://localhost:4200
npx nx serve cms                        # see pending note on ports
```

Once ESLint is set up, add `lint` to the verification command.

**Environment gotchas**
- VS Code's Nx Console sets `NX_WORKSPACE_ROOT_PATH` to the repo root, which breaks Nx. Override it in the shell: `export NX_WORKSPACE_ROOT_PATH="$(pwd -W)"` (Git Bash, from `core/`), and use `NX_DAEMON=false` if the daemon misbehaves.
- `core/.npmrc` sets `legacy-peer-deps=true`. Keep it.
- Tailwind is v4 via `@tailwindcss/vite` (Nx 23's React generator no longer supports Tailwind). New React apps/libs need it wired manually.

---

## 8. Current state vs. target

The repo has not caught up with these guidelines yet. Known pending work:

- [ ] **Sandbox tooling** still uses the old model. It copies plugin `api/`/`web/` folders into `apps/*/src/plugins/`, clones one named workspace, and has no seeding. It needs to be rebuilt for: libs under `libs/plugins/<name>/`, registry wiring, the `cms` and `contracts` layers, seed/unseed, single-plugin add/eject, and a "rebuild with all plugins" command.
- [ ] **Slot contracts and registry files** don't exist in core yet.
- [ ] **ESLint** isn't installed (apps were generated with `--linter=none`), so module boundaries aren't enforced yet.
- [ ] **Contracts lib** (Zod schemas) doesn't exist yet.
- [ ] **Dev ports:** `web` and `cms` are both configured for port 4200 (preview 4300), so they can't run at the same time.
- [ ] Generated placeholders (`nx-welcome.tsx`, default `app.tsx`) are still in `web` and `cms`.
- [ ] Nx generated deprecated Vite plugins (`nxViteTsPaths`, `nxCopyAssetsPlugin`), which will be removed in Nx v24.

---

## Open decisions

These haven't been decided. **Ask before doing work that depends on them.**

- **Slot catalogue:** exactly which slots core exposes, and their contract shapes.
- **Plugin-to-plugin dependencies:** can a plugin depend on another (e.g. `ecom` using `storage`), and how would install/eject order and boundaries handle it?
- **Upstream mechanism:** core lives in `core/` inside the Inithium repo next to `plugins/` and `sandbox/`. Client upstream merges must bring in core **only**, never plugin source, but how (separate core repo, subtree split, etc.) is undecided.
- **Install/eject tooling for client repos:** where it lives and how it's run against a real client repo, as opposed to the sandbox.
- **Seed tracking:** how unseed identifies exactly what its seed created.
- **Environment & database config:** env var conventions and the MongoDB setup for local dev, the sandbox, and clients.
- **Auth:** approach and where it lives (`jsonwebtoken` is installed, nothing else is decided).
- **Testing:** no automated tests for now (verification is typecheck + build). Revisit when libs gain real logic.
