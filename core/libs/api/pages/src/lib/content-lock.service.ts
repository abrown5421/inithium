import { CONTENT_LOCK_TTL_MS, userDisplayName, type PageEditing } from '@inithium/shared-contracts';
import { UserModel } from '@inithium/api-users';
import { PageModel, type PageDocument } from './pages.model';

/*
 * The page builder's edit lock (decision 0116): one editor at a time per page's content. The builder takes the lock
 * when it opens a page and keeps it alive with a heartbeat; a lock without one for CONTENT_LOCK_TTL_MS expires, so a
 * closed or crashed browser can't hold a page forever. Nobody can take over a live lock. Page settings aren't locked.
 */

/** A page's lock as stored: the builder session holding it (its lock id), who that is, and when. */
export type ContentLock = { lockId: string; userId: string; name: string; since: Date; heartbeatAt: Date };

const lockOf = (doc: PageDocument): ContentLock | undefined => (doc.contentLock as ContentLock | null | undefined) ?? undefined;

/** Whether a lock has had a heartbeat recently enough to hold. */
export const lockIsLive = (lock: ContentLock | undefined, now = Date.now()): lock is ContentLock =>
  Boolean(lock && now - new Date(lock.heartbeatAt).getTime() < CONTENT_LOCK_TTL_MS);

/** Who's editing a page's content now, if anyone. */
export function pageEditing(doc: PageDocument): PageEditing | undefined {
  const lock = lockOf(doc);
  return lockIsLive(lock) ? { userId: lock.userId, name: lock.name, since: new Date(lock.since).toISOString() } : undefined;
}

/** The result of taking a lock: held, or not (with who's editing, when someone is). */
export type LockResult = { held: boolean; editing?: PageEditing };

/**
 * Takes a page's lock for a builder session, or keeps it alive if the session holds it already. A free or expired
 * lock is taken; a live lock held by another session (the same person in another tab included) is refused. Done
 * with conditional updates, so two people opening a page at once can't both get it.
 */
export async function takeContentLock(doc: PageDocument, lockId: string, userId: string, retry = true): Promise<LockResult> {
  const now = new Date();
  const kept = await PageModel.updateOne({ _id: doc._id, 'contentLock.lockId': lockId }, { $set: { 'contentLock.heartbeatAt': now } });
  if (kept.matchedCount) return { held: true };

  const user = await UserModel.findById(userId, { email: 1, profile: 1 }).lean();
  const name = user ? userDisplayName({ email: user.email, profile: user.profile ?? undefined }) : 'Someone';
  const staleBefore = new Date(now.getTime() - CONTENT_LOCK_TTL_MS);
  const taken = await PageModel.updateOne(
    { _id: doc._id, $or: [{ contentLock: { $exists: false } }, { contentLock: null }, { 'contentLock.heartbeatAt': { $lt: staleBefore } }] },
    { $set: { contentLock: { lockId, userId, name, since: now, heartbeatAt: now } } },
  );
  if (taken.modifiedCount) return { held: true };

  const current = await PageModel.findById(doc._id);
  const editing = current ? pageEditing(current) : undefined;
  // Released between the two updates: try once more.
  if (!editing && current && retry) return takeContentLock(doc, lockId, userId, false);
  return { held: false, editing };
}

/** Lets go of a page's lock, if this session holds it. */
export async function releaseContentLock(doc: PageDocument, lockId: string): Promise<void> {
  await PageModel.updateOne({ _id: doc._id, 'contentLock.lockId': lockId }, { $unset: { contentLock: 1 } });
}

/**
 * Checks a save, publish or discard comes from the session holding the lock. Its own lock is kept alive (even one
 * that expired, while nobody else has taken it); a page nobody holds is taken for it. Someone else's live lock
 * refuses it.
 */
export async function checkContentLock(doc: PageDocument, lockId: string | undefined, userId: string): Promise<LockResult> {
  if (!lockId) return { held: false, editing: pageEditing(doc) };
  return takeContentLock(doc, lockId, userId);
}
