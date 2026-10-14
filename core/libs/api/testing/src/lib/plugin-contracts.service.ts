import mongoose from 'mongoose';
import { expect } from 'vitest';
import { describeChanges, snapshotDatabase, type CollectionChange, type DatabaseSnapshot } from './test-database.service';

/**
 * The checks every plugin's seed, unseed and user deletion hook must pass (CLAUDE.md §2, decision 0103). They compare
 * whole-database snapshots, so they work however a seed records what it created (decision 0019 is still open).
 */

/**
 * A seed is idempotent: running it again changes nothing at all (no new, removed or edited documents, timestamps
 * included). Returns what the first run changed, so the test can also check it created what it should.
 */
export async function expectSeedIsIdempotent(seed: () => Promise<void>): Promise<CollectionChange[]> {
  const before = await snapshotDatabase();
  await seed();
  const first = await snapshotDatabase();
  await seed();
  const second = await snapshotDatabase();
  expect(describeChanges(first, second), 'running the seed a second time changed the database').toEqual([]);
  return describeChanges(before, first);
}

/**
 * An unseed removes exactly what its seed created: seed then unseed leaves the database as it was before the seed,
 * and running the unseed again changes nothing. Set up what's already there (e.g. core's seeds) first.
 * `ignoreFields` skips top-level fields on every document (e.g. `updatedAt` when a seed edits a core record and its
 * unseed restores it).
 */
export async function expectUnseedRestores(options: {
  seed: () => Promise<void>;
  unseed: () => Promise<void>;
  ignoreFields?: readonly string[];
}): Promise<void> {
  const snapshot = () => snapshotDatabase({ ignoreFields: options.ignoreFields });
  const before = await snapshot();
  await options.seed();
  await options.unseed();
  const after = await snapshot();
  expect(describeChanges(before, after), 'seed then unseed left the database different from before').toEqual([]);
  await options.unseed();
  expect(describeChanges(after, await snapshot()), 'running the unseed a second time changed the database').toEqual([]);
}

/** A user deletion hook as `@inithium/api-user-management` defines it (repeated here so the kit stays below it). */
export type UserDeletionHookLike = { key: string; label: string; deleteUserData(userIds: string[]): Promise<void> };

/** The string form of a document's `userId` (an ObjectId or a string), if it has one. */
function userIdOf(doc: Record<string, unknown>): string | undefined {
  const value = doc['userId'];
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && '$oid' in value) return String((value as { $oid: unknown }).$oid);
  return undefined;
}

const docsOf = (snapshot: DatabaseSnapshot, userIds: readonly string[]) =>
  Object.entries(snapshot).flatMap(([collection, docs]) =>
    docs.filter((doc) => userIds.includes(userIdOf(doc) ?? '')).map((doc) => ({ collection, doc })),
  );

/**
 * A user deletion hook (decision 0100) removes everything its plugin keeps for the deleted accounts and nothing else,
 * and is safe to run again. `createUserData(userId)` must store the plugin's data for one account, each document
 * carrying that `userId` (CLAUDE.md §2); it's called for two accounts being deleted and one that stays.
 */
export async function expectUserDeletionHook(
  hook: UserDeletionHookLike,
  createUserData: (userId: string) => Promise<void>,
): Promise<void> {
  expect(hook.key, 'the hook needs a key').toMatch(/\S/);
  expect(hook.label, 'the hook needs a label for the CMS').toMatch(/\S/);

  const [first, second, kept] = [0, 1, 2].map(() => new mongoose.Types.ObjectId().toString()) as [string, string, string];
  for (const id of [first, second, kept]) await createUserData(id);

  const before = await snapshotDatabase();
  for (const id of [first, second, kept]) {
    expect(docsOf(before, [id]).length, `createUserData(${id}) stored nothing with that userId`).toBeGreaterThan(0);
  }

  await hook.deleteUserData([first, second]);
  const after = await snapshotDatabase();
  expect(docsOf(after, [first, second]), 'documents of deleted accounts are left behind').toEqual([]);
  expect(docsOf(after, [kept]), 'the hook changed data of an account that was not deleted').toEqual(docsOf(before, [kept]));

  await hook.deleteUserData([first, second]);
  expect(describeChanges(after, await snapshotDatabase()), 'running the hook a second time changed the database').toEqual([]);
}
