---
id: "0103"
title: Test with Vitest, an in-memory database and a plugin contract kit
status: accepted
date: "2026-10-14"
scope: ecosystem
tags: [testing, verification, plugins, ci]
related: ["0002", "0018", "0019", "0026", "0100"]
supersedes: ["0021"]
---

# 0103. Test with Vitest, an in-memory database and a plugin contract kit

## Context

Until now verification was lint, type-check, build and the docs check, and libs were generated without a test runner ([0021](0021-automated-testing.md)). Core's libs now hold real logic: the permission matrix and role rules, the theme scale generator and its contrast guarantee, the content and rich text contracts, page seeds and the user management rules. Plugins bring rules that types can't check: a seed must be safe to run twice, an unseed must remove exactly what its seed created, and a user deletion hook must remove a plugin's per-user data and be safe to retry (CLAUDE.md §2, [0100](0100-manage-accounts-from-the-cms.md)). Testing was expected to be most useful for plugins, so it's set up in full rather than piecemeal.

## Decision

**What is tested**
- **Unit tests** for pure logic in libs.
- **API integration tests:** real routers on an Express app shaped like the api's own, called over HTTP, against a real MongoDB. They cover permissions, validation and the 4xx `field` errors.
- **Component tests** (React Testing Library in jsdom) only where behaviour is subtle, not for every component.
- **End-to-end browser tests (Playwright) are deferred.** They start when the rebuilt sandbox installs its first plugin with `web` or `cms` slots, or sooner if asked. They begin as a smoke suite of 3–4 journeys: signing in; creating, publishing and viewing a page; managing a user; and one journey through a plugin slot. Until then the person reviewing tests in the browser.

**Tools**
- **Vitest** in every project, through one shared preset (`core/vitest.preset.mts`) that each project's `vitest.config.mts` calls. Nx infers a `test` target from that file, and each tested project has a `typecheck` target over its `tsconfig.spec.json`.
- **mongodb-memory-server** for the database. There's one in-memory server per run, each test file gets its own database, and it's emptied before every test. Tests never use Atlas.

**The test kits** (tag `type:testing`)
- `@inithium/api-testing` holds the test app (`createTestApi`) and HTTP client (`TestClient`), database snapshots, and the **plugin contract checks**:
  - `expectSeedIsIdempotent`;
  - `expectUnseedRestores`;
  - `expectUserDeletionHook`.

  The checks compare whole-database snapshots, so they don't depend on how seed tracking is eventually stored ([0019](0019-seed-tracking.md) stays open).
- `@inithium/api-testing-accounts` creates test accounts through `createUser()` and signs clients in through the real login route.
- **Only spec files may import a test kit.** Lint enforces this with `no-restricted-imports`, and every `type:` may depend on `type:testing` for its tests.
- A kit has only a `tsconfig.spec.json`, so builds never emit it.

**What's required**
- **Every plugin** tests its seed and unseed (with the contract checks), its user deletion hook (if it keeps per-user data), and the permission checks on its routes.
- **Core logic** gets tests when it's added or changed.
- **No coverage percentage** is required.
- **Verification** is `npx nx run-many -t lint typecheck test build` plus the docs check. A GitHub Actions workflow (`.github/workflows/verify.yml`) runs the same on every pull request and on `main`.
- **Generators:** libs are generated with `--unitTestRunner=vitest`, then given the shared preset.

**Client repositories**
- Core's tests and kits are part of core, so every client clone gets them.
- Plugin spec files are **not** installed into client repos. They run in the Inithium repo and the sandbox. The install tooling ([0018](0018-install-eject-tooling-for-client-repos.md)) copies plugin libs without `*.spec.ts(x)`.
- `libs/client/` code tests itself against the same kits.

## Alternatives considered

- **Jest** or Node's built-in `node:test`: not chosen, because the workspace already runs Vite, and one runner means one config for frontend and api code.
- **A test database on the shared Atlas cluster:** closer to production, but slower, dependent on the network (and VPN), and runs could collide. The in-memory server is offline and starts each run from nothing.
- **Settling seed tracking (0019) first,** so unseed tests could check the tracking records: rejected, because the test kit shouldn't wait on how production tracking is stored. Snapshots work whatever it becomes.
- **Shipping plugin spec files to clients:** rejected. They would add noise to client repos' linting and type-checking. Clients test their own code against the kits instead.
- **Playwright now:** deferred. Unit and integration tests give most of the confidence for much less upkeep until slots and dynamic UI grow.

## Consequences

- **Verification needs no network after the first run.** That run downloads a MongoDB binary (about 100 MB, cached afterwards).
- **The api's error handling moved into `@inithium/api-http`,** so tests use the same handler as `main.ts`.
- **Kit-dependency rule:** a lib the kits depend on can't import a kit from its own tests without creating a dependency cycle. Those libs are `api-http` (the kit's base), and `api-users` and `api-auth` (used by the accounts kit).
  - `api-users` and `api-auth` may still import `@inithium/api-testing`, but create their own accounts.
  - `api-http` builds its own small app.
- **A test file's database is emptied before every test,** so test data is created in `beforeEach` or in the test, never in `beforeAll`.
- **Spec type checks are strict.** They compile lib code under each lib's strict settings, which the api's build doesn't. They surfaced loose types the build had allowed.
- **The sandbox rebuild should add a per-plugin lifecycle run:** install, build, seed, seed again, unseed, eject, then type-check and build again. That run is the plugin acceptance gate.
