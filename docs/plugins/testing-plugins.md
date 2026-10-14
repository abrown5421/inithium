---
title: Testing plugins
description: The tests every plugin must ship, and the contract checks that prove its seed, unseed and user deletion hook follow the rules.
scope: ecosystem
tags: [plugins, testing, seeding]
order: 2
decisions: ["0103", "0019", "0026", "0100"]
---

# Testing plugins

A plugin has to follow rules that type-checking can't see:
- its seed can run twice;
- its unseed removes exactly what its seed created;
- its user deletion hook removes all of its per-user data and nothing else.

Every plugin proves these with the contract checks in `@inithium/api-testing` ([0103](../decisions/0103-test-with-vitest-and-a-plugin-contract-kit.md)). General setup is in [Testing](../getting-started/testing.md).

## What every plugin tests

| Layer | Required tests |
| --- | --- |
| `api` | Seed and unseed, with the contract checks below |
| `api` | The user deletion hook, if the plugin keeps per-user data ([0100](../decisions/0100-manage-accounts-from-the-cms.md)) |
| `api` | Each route's permission checks (401 signed out, 403 without the permission) and what it refuses |
| `contracts` | Schemas with rules beyond their shape (refinements, limits, links) |
| `web` / `cms` | Logic in services and hooks; components only where behaviour is subtle |

The plugin's `api` lib uses `database: true` in its `vitest.config.mts`.

## Seeds: `expectSeedIsIdempotent(seed)`

The check runs the seed, snapshots the whole database, runs the seed again and fails if anything changed. Nothing may be added, removed or edited, timestamps included. It returns what the first run changed, so the test can also check that the seed created what it should:

```ts
import { expect, it } from 'vitest';
import { expectSeedIsIdempotent } from '@inithium/api-testing';
import { seedEcom } from './ecom.seed';

it('seeds idempotently', async () => {
  const created = await expectSeedIsIdempotent(seedEcom);
  expect(created.map((change) => change.collection)).toEqual(['pages', 'settings']);
});
```

A seed that checks before it creates passes. A seed that creates duplicates, or rewrites what it already made, fails.

## Unseeds: `expectUnseedRestores({ seed, unseed, ignoreFields? })`

The check snapshots the database, runs the seed and then the unseed, and fails unless the database is exactly as it was. It then runs the unseed again and fails if that changes anything. Set up what's already there first, usually core's seeds, so the check also catches an unseed that removes too much:

```ts
import { it } from 'vitest';
import { expectUnseedRestores } from '@inithium/api-testing';
import { seedCorePages } from '@inithium/api-pages';
import { seedSiteSettings } from '@inithium/api-settings';
import { seedEcom, unseedEcom } from './ecom.seed';

it('unseeds exactly what it seeded', async () => {
  await seedSiteSettings();
  await seedCorePages();
  await expectUnseedRestores({ seed: seedEcom, unseed: unseedEcom });
});
```

If the seed edits a core record and the unseed restores it, the record's `updatedAt` still changes. Pass `ignoreFields: ['updatedAt']` for that case.

The checks compare whole-database snapshots, so they work however unseed ends up knowing what its seed created ([0019](../decisions/0019-seed-tracking.md), still open).

## User deletion hooks: `expectUserDeletionHook(hook, createUserData)`

Plugins keep per-user data in their own collections, each document carrying a `userId` ([0026](../decisions/0026-plugins-keep-user-data-in-their-own-collections.md)).

**Set-up:** give the check the hook and a function that stores the plugin's data for one account. The check calls it for three accounts and then deletes two of them.

**It fails if:**
- the hook has no key or label;
- the data function stored nothing carrying that `userId`;
- any document of a deleted account is left in any collection;
- the remaining account's data changed;
- running the hook again throws or changes anything.

```ts
import { it } from 'vitest';
import { expectUserDeletionHook } from '@inithium/api-testing';
import { AddressModel } from './addresses.model';
import { ecomDeletionHook } from './ecom.deletion';

it('removes deleted accounts’ addresses', async () => {
  await expectUserDeletionHook(ecomDeletionHook, async (userId) => {
    await AddressModel.create({ userId, line1: '1 Test Street' });
  });
});
```

## Routes

Mount the plugin's router on a test app and call it as different roles:

```ts
import { expect, it } from 'vitest';
import { createTestApiWithAuth, signedInClient } from '@inithium/api-testing-accounts';
import { ordersRouter } from './orders.routes';

const app = createTestApiWithAuth((api) => api.use('/ecom/orders', ordersRouter));

it('lets members see only their own orders', async () => {
  const { client } = await signedInClient(app, 'user');
  expect((await client.get('/api/ecom/orders')).body).toEqual([]);
});
```

## Where plugin tests run

- **Inithium repo and sandbox only.** A plugin's spec files run in the Inithium repo and in the sandbox. They are **not** installed into client repos: the install tooling copies plugin libs without `*.spec.ts(x)` ([0018](../decisions/0018-install-eject-tooling-for-client-repos.md)).
- **Client code tests itself.** Code in a client's `libs/client/` writes its own tests against the same kits, which every client gets as part of core.
- **Planned lifecycle check.** The rebuilt sandbox will also check each plugin's whole lifecycle: install, build, seed, seed again, unseed, eject, then type-check and build again ([The sandbox](../architecture/sandbox.md)).
