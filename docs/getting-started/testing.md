---
title: Testing
description: How Inithium is tested, how to run the tests, and how to write unit, api and component tests with the shared test kits.
scope: ecosystem
tags: [testing, vitest, verification]
order: 5
decisions: ["0103"]
---

# Testing

Inithium is tested with [Vitest](https://vitest.dev) ([0103](../decisions/0103-test-with-vitest-and-a-plugin-contract-kit.md)):

- **Unit tests** for the logic in libs.
- **Api integration tests:** real routers, called over HTTP, against a real MongoDB that runs in memory.
- **A few component tests,** for components whose behaviour is subtle.

Tests are part of verification, alongside lint, type-checking, building and the docs check.

## Running tests

From `core/`:

```sh
npx nx run-many -t test             # every project's tests
npx nx test api-pages               # one project
npx nx run-many -t lint typecheck test build   # the full verification
```

- The first api test run downloads a MongoDB binary (about 100 MB) for `mongodb-memory-server`. After that, tests need no network. They never touch Atlas or your `core/.env`.
- **CI:** GitHub Actions runs the full verification and the docs check on every pull request and on `main` (`.github/workflows/verify.yml`).

## What to test

| Change | Tests |
| --- | --- |
| New or changed logic in a lib (rules, calculations, conversions, schemas) | Unit tests beside it |
| New or changed api routes | Who may call them (401/403), what they refuse (400/409 with `field`), and what they store and return |
| A seed | That it's idempotent (`expectSeedIsIdempotent`) |
| A plugin | Everything in [Testing plugins](../plugins/testing-plugins.md) |
| A component with subtle behaviour (focus, keyboard, state across interactions) | A component test; most components don't need one |

There's no coverage percentage to hit. Test the rules a mistake would break.

**Browser tests (Playwright) are deferred.** They start when the rebuilt sandbox installs its first plugin with `web` or `cms` slots, or sooner if asked. They'll begin as a smoke suite of three or four journeys. Until then, the person reviewing a change tests it in the browser.

## Where tests live

- A test is a `*.spec.ts` (or `*.spec.tsx`) file beside the code it tests, e.g. `pages.spec.ts` next to `pages.service.ts`.
- Each tested project has:
  - `vitest.config.mts`, which calls the shared preset;
  - `tsconfig.spec.json`, which its `typecheck` target checks (so specs are type-checked, strictly);
  - its specs excluded from `tsconfig.lib.json`.

```ts
// libs/api/pages/vitest.config.mts
import { projectTestConfig } from '../../../vitest.preset.mts';

export default projectTestConfig(import.meta.dirname, { database: true });
```

`projectTestConfig()` (in `core/vitest.preset.mts`) takes:

| Option | Default | Meaning |
| --- | --- | --- |
| `environment` | `'node'` | `'jsdom'` for React components and hooks |
| `database` | `false` | For api code. Sets the test environment variables and gives each test file its own empty MongoDB database. |

Nx infers each project's `test` target from its `vitest.config.mts`. To add tests to a project that has none, see [Creating a lib](../reference/libs.md#creating-a-lib).

## Unit tests

Import from `vitest` and test the lib's own functions:

```ts
import { describe, expect, it } from 'vitest';
import { assignableRoles } from './roles.service';

describe('assignableRoles', () => {
  it('never offers dev', () => {
    expect(assignableRoles('owner')).not.toContain('dev');
  });
});
```

## Api tests

With `database: true`, each test file gets its own database on an in-memory MongoDB server.

- **The database is emptied before every test,** so create test data in `beforeEach` or in the test itself, never in `beforeAll`.
- **Environment:** `loadEnv()` sees `TEST_ENV` (from `@inithium/api-testing`), with `USER_TEMP_PASSWORD` set and `STORAGE_MODE=database`. Your `core/.env` is never read.

Build an app with only the routers the test needs, then call it with a client per person:

```ts
import { describe, expect, it } from 'vitest';
import { createTestApiWithAuth, signedInClient } from '@inithium/api-testing-accounts';
import { settingsRouter } from './settings.routes';

const app = createTestApiWithAuth((api) => api.use('/settings', settingsRouter));

describe('/api/settings', () => {
  it('needs settings.edit', async () => {
    const { client } = await signedInClient(app, 'editor');
    expect((await client.get('/api/settings')).status).toBe(403);
  });
});
```

### `@inithium/api-testing`

| Export | What it does |
| --- | --- |
| `createTestApi(mount)` | An Express app shaped like the api's own: JSON bodies up to 1 MB, cookies, your routers under `/api`, then the JSON 404 and the real error handler from `@inithium/api-http` |
| `testClient(app)` / `TestClient` | Calls the app over real HTTP and keeps the cookies it sets, like one browser. `get`, `post`, `put`, `patch`, `delete` return `{ status, body, headers }`; a `FormData` body is sent as a multipart upload (anything else as JSON); `request(method, path, body?, headers?)` adds request headers such as `range` or `if-none-match`; `cookie(name)`, `cookieHeader()`, `setCookie()`, `clearCookies()` |
| `snapshotDatabase()`, `describeChanges()` | The whole database as comparable JSON, and the documents added, removed and changed between two snapshots |
| `clearDatabase()` | Empties every collection (runs before each test anyway) |
| `TEST_ENV` | The environment api tests run with |
| `expectSeedIsIdempotent()`, `expectUnseedRestores()`, `expectUserDeletionHook()` | The plugin contract checks: see [Testing plugins](../plugins/testing-plugins.md) |
| `listenTestApi(app)` | Starts the app on a free local port and keeps it up: `{ server, url, close() }`, e.g. for `startRealtime(server.server, { channels })` |
| `connectTestRealtime(server, client?, headers?)` | A [realtime](../backend/realtime.md#testing) connection to that server, signed in with the client's cookies (or a guest without one). It records `events`, `presence` and `reauths`; `subscribe()`, `unsubscribe()`, `send()` and `activity()` resolve with the api's answers; `nextEvent()`, `nextPresence()` and `disconnected()` wait. Call `stopRealtime()` after each test. |

### `@inithium/api-testing-accounts`

| Export | What it does |
| --- | --- |
| `createTestAccount({ role?, email?, firstName?, lastName?, passwordChangeRequired? })` | An account made through `createUser()`, with a unique email and `TEST_PASSWORD`. Returns `{ id, email, password, role, user }` |
| `createTestApiWithAuth(mount)` | `createTestApi()` with core's auth routes at `/api/auth`, so clients can sign in |
| `signIn(client, account)` | Signs a client in through `POST /api/auth/login` |
| `signedInClient(app, role?)` | A new account with that role plus a client signed in as it: `{ client, account }` |

### Test kit rules

- **Only spec files may import a test kit** (lint enforces it). Kits are tagged `type:testing`. Builds never include them, because a kit has only a `tsconfig.spec.json`.
- **The libs the kits build on can't import every kit from their own tests,** or Nx sees a dependency cycle:
  - `api-users` and `api-auth` may use `@inithium/api-testing` but create their own accounts;
  - `api-http` makes its own small Express app.

## Component tests

Use `environment: 'jsdom'` and React Testing Library. Query by role and accessible name, the way people and assistive technology find things:

```tsx
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { Pagination } from './pagination.component';

afterEach(cleanup);

it('moves with the arrows', async () => {
  render(<Pagination pageCount={20} defaultPage={10} />);
  await userEvent.click(screen.getByRole('button', { name: /next/i }));
  expect(screen.getByRole('button', { current: 'page' }).textContent).toBe('11');
});
```
