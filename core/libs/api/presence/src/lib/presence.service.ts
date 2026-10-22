import { activeStatus, awayStatus, findPresenceStatus, inactiveStatus, userStatusChannel, type UserStatus } from '@inithium/shared-contracts';
import { onUserActivity, publishRealtime, userActivity } from '@inithium/api-realtime';

/*
 * Users' presence statuses (decision 0124). Core's three come from the realtime layer: away with no open connection,
 * active with input in the last 10 minutes on any of them, inactive otherwise. Plugins and client code set their
 * own statuses on top (e.g. "In a class"), which show only while the user is online and replace active/inactive;
 * the highest `priority` wins when several are set. Kept in memory, like the connections they depend on.
 */

/** Each online user's plugin statuses: status key → its detail. */
const custom = new Map<string, Map<string, string | undefined>>();
/** The status last published for each user, to publish only changes. Absent means away. */
const published = new Map<string, string>();

const AWAY = JSON.stringify({ status: awayStatus.key } satisfies UserStatus);

/** A user's status now. */
export function userStatus(userId: string): UserStatus {
  const activity = userActivity(userId);
  if (activity === 'offline') return { status: awayStatus.key };
  const chosen = [...(custom.get(userId) ?? new Map<string, string | undefined>())]
    .map(([key, detail]) => ({ key, detail, priority: findPresenceStatus(key)?.priority ?? 0 }))
    .sort((a, b) => b.priority - a.priority)[0];
  if (chosen) return { status: chosen.key, ...(chosen.detail ? { detail: chosen.detail } : {}) };
  return { status: activity === 'active' ? activeStatus.key : inactiveStatus.key };
}

/**
 * Sets a plugin's (or client code's) status on a user, e.g. `setUserStatus(id, 'plugin-classes:in-class')` or
 * `setUserStatus(id, 'client-games:playing', { detail: 'Trivia Night' })`. The status must be registered and
 * namespaced. Returns false, doing nothing, when the user isn't online: statuses only last while they are, and are
 * cleared when their last connection closes.
 */
export function setUserStatus(userId: string, key: string, options: { detail?: string } = {}): boolean {
  if (!key.includes(':') || !findPresenceStatus(key)) throw new Error(`Presence status '${key}' isn't registered`);
  if (userActivity(userId) === 'offline') return false;
  let statuses = custom.get(userId);
  if (!statuses) custom.set(userId, (statuses = new Map()));
  statuses.set(key, options.detail?.trim().slice(0, 60) || undefined);
  announce(userId);
  return true;
}

/** Takes a plugin's status off a user (nothing happens if it wasn't set). */
export function clearUserStatus(userId: string, key: string): void {
  const statuses = custom.get(userId);
  if (!statuses?.delete(key)) return;
  if (!statuses.size) custom.delete(userId);
  announce(userId);
}

/** Publishes the user's status on their channel if it changed. */
function announce(userId: string): void {
  const status = userStatus(userId);
  const json = JSON.stringify(status);
  if (json === (published.get(userId) ?? AWAY)) return;
  if (json === AWAY) published.delete(userId);
  else published.set(userId, json);
  publishRealtime(userStatusChannel, { userId }, 'status.changed', status);
}

/**
 * Follows users' activity from the realtime layer and publishes their statuses (call once at startup, before
 * `startRealtime()`). Returns a function that stops it.
 */
export function startPresence(): () => void {
  const stop = onUserActivity((userId, activity) => {
    if (activity === 'offline') custom.delete(userId);
    announce(userId);
  });
  return () => {
    stop();
    custom.clear();
    published.clear();
  };
}
