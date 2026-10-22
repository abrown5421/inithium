import {
  CONTENT_EDIT_REQUEST_INTERVAL_MS,
  CONTENT_LOCK_TTL_MS,
  contentLockChannel,
  pagesChannel,
  userDisplayName,
  type PageEditing,
} from '@inithium/shared-contracts';
import { publishRealtime } from '@inithium/api-realtime';
import { UserModel } from '@inithium/api-users';
import { PageModel, type PageDocument } from './pages.model';

/*
 * The page builder's edit lock (decision 0116): one editor at a time per page's content. The builder takes the lock
 * when it opens a page and keeps it alive with a heartbeat; a lock without one for CONTENT_LOCK_TTL_MS expires, so a
 * closed or crashed browser can't hold a page forever. Nobody can take over a live lock. Page settings aren't locked.
 * Taking and letting go are published on `pagesChannel`, and someone shut out can ask the holder for the page on
 * `contentLockChannel` (decision 0122).
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

  const name = await displayName(userId);
  const staleBefore = new Date(now.getTime() - CONTENT_LOCK_TTL_MS);
  const taken = await PageModel.updateOne(
    { _id: doc._id, $or: [{ contentLock: { $exists: false } }, { contentLock: null }, { 'contentLock.heartbeatAt': { $lt: staleBefore } }] },
    { $set: { contentLock: { lockId, userId, name, since: now, heartbeatAt: now } } },
  );
  if (taken.modifiedCount) {
    announceEditing(doc._id.toString(), { userId, name, since: now.toISOString() });
    return { held: true };
  }

  const current = await PageModel.findById(doc._id);
  // Another request from this same session took it a moment ago (two sent at once, e.g. React's StrictMode
  // running the builder's effect twice): it's ours.
  if (current && lockOf(current)?.lockId === lockId) return { held: true };
  const editing = current ? pageEditing(current) : undefined;
  // Released between the two updates: try once more.
  if (!editing && current && retry) return takeContentLock(doc, lockId, userId, false);
  return { held: false, editing };
}

/** Lets go of a page's lock, if this session holds it. */
export async function releaseContentLock(doc: PageDocument, lockId: string): Promise<void> {
  const released = await PageModel.updateOne({ _id: doc._id, 'contentLock.lockId': lockId }, { $unset: { contentLock: 1 } });
  if (released.modifiedCount) announceEditing(doc._id.toString(), null);
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

/** A user's name as the builder shows it to others. */
async function displayName(userId: string): Promise<string> {
  const user = await UserModel.findById(userId, { email: 1, profile: 1 }).lean();
  return user ? userDisplayName({ email: user.email, profile: user.profile ?? undefined }) : 'Someone';
}

/** Tells everyone watching the page list who's editing a page now (decision 0122). */
function announceEditing(pageId: string, editing: PageEditing | null): void {
  publishRealtime(pagesChannel, {}, 'editing.changed', { pageId, editing });
}

/**
 * What became of asking for a page (decision 0122): sent to the builder holding it; nobody holds it (open it
 * instead); the asker holds it themselves (in another tab); or they asked too recently (`retryAfterMs`).
 */
export type EditRequestResult = { status: 'sent' } | { status: 'free' } | { status: 'self' } | { status: 'too-soon'; retryAfterMs: number };

// When each person last asked for each page (`<pageId>:<userId>`), in ms. In memory: entries matter for a minute.
const lastRequests = new Map<string, number>();

/**
 * Asks the person editing a page to make way (decision 0122): the builder session holding its lock is told who's
 * asking, on `contentLockChannel`, and decides for itself; nothing comes back. One ask per person per page each
 * CONTENT_EDIT_REQUEST_INTERVAL_MS. Delivery isn't guaranteed: a builder that's offline at that moment misses it.
 */
export async function requestContentEdit(doc: PageDocument, userId: string, now = Date.now()): Promise<EditRequestResult> {
  const lock = lockOf(doc);
  if (!lockIsLive(lock, now)) return { status: 'free' };
  if (lock.userId === userId) return { status: 'self' };

  const key = `${doc._id.toString()}:${userId}`;
  const last = lastRequests.get(key);
  if (last !== undefined && now - last < CONTENT_EDIT_REQUEST_INTERVAL_MS) {
    return { status: 'too-soon', retryAfterMs: CONTENT_EDIT_REQUEST_INTERVAL_MS - (now - last) };
  }
  for (const [other, at] of lastRequests) if (now - at >= CONTENT_EDIT_REQUEST_INTERVAL_MS) lastRequests.delete(other);
  lastRequests.set(key, now);

  publishRealtime(contentLockChannel, { pageId: doc._id.toString(), lockId: lock.lockId }, 'edit.requested', {
    from: { userId, name: await displayName(userId) },
    at: new Date(now).toISOString(),
  });
  return { status: 'sent' };
}
