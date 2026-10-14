import mongoose from 'mongoose';

/** Every document in the test database, by collection, as comparable plain JSON (ids and dates in EJSON form). */
export type DatabaseSnapshot = Record<string, Record<string, unknown>[]>;

/** How one collection differs between two snapshots, by document `_id`. */
export type CollectionChange = { collection: string; added: string[]; removed: string[]; changed: string[] };

const { EJSON } = mongoose.mongo.BSON;

/** Empties every collection (keeping their indexes). Runs before each test in `database: true` projects. */
export async function clearDatabase(): Promise<void> {
  const collections = await mongoose.connection.db?.collections();
  await Promise.all((collections ?? []).map((collection) => collection.deleteMany({})));
}

const idOf = (doc: Record<string, unknown>) => JSON.stringify(doc['_id']);

/**
 * The whole test database, every collection and document, for comparing before and after (e.g. a seed). Documents
 * are sorted by `_id`; `ignoreFields` drops top-level fields such as `updatedAt` from every document.
 */
export async function snapshotDatabase(options: { ignoreFields?: readonly string[] } = {}): Promise<DatabaseSnapshot> {
  const db = mongoose.connection.db;
  if (!db) throw new Error('snapshotDatabase() needs a connected database: use it in a `database: true` project');
  const snapshot: DatabaseSnapshot = {};
  for (const collection of await db.collections()) {
    if (collection.collectionName.startsWith('system.')) continue;
    const docs = (await collection.find().toArray()).map((doc) => {
      const plain = EJSON.serialize(doc, { relaxed: false }) as Record<string, unknown>;
      for (const field of options.ignoreFields ?? []) delete plain[field];
      return plain;
    });
    if (docs.length) snapshot[collection.collectionName] = docs.sort((a, b) => idOf(a).localeCompare(idOf(b)));
  }
  return snapshot;
}

/** The documents added, removed and changed between two snapshots; empty when they're identical. */
export function describeChanges(before: DatabaseSnapshot, after: DatabaseSnapshot): CollectionChange[] {
  const changes: CollectionChange[] = [];
  for (const collection of [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()) {
    const was = new Map((before[collection] ?? []).map((doc) => [idOf(doc), JSON.stringify(doc)]));
    const now = new Map((after[collection] ?? []).map((doc) => [idOf(doc), JSON.stringify(doc)]));
    const change: CollectionChange = {
      collection,
      added: [...now.keys()].filter((id) => !was.has(id)),
      removed: [...was.keys()].filter((id) => !now.has(id)),
      changed: [...now.keys()].filter((id) => was.has(id) && was.get(id) !== now.get(id)),
    };
    if (change.added.length || change.removed.length || change.changed.length) changes.push(change);
  }
  return changes;
}
