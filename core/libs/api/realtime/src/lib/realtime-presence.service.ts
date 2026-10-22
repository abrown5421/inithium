import type { PresenceActivity, PresenceMember } from '@inithium/shared-contracts';

/** One connection's place in a channel's presence. */
type Entry = { userId?: string; activity: PresenceActivity; meta: unknown; joined: number };

/** A change to a channel's presence, to send to its subscribers. */
export type PresenceChange = { kind: 'join' | 'update'; member: PresenceMember } | { kind: 'leave'; key: string };

let joins = 0;

/** A member's key: a signed-in user once for all their connections, a guest per connection. */
const keyOf = (connectionId: string, userId: string | undefined) => userId ?? `guest:${connectionId}`;

/**
 * Who's subscribed to each channel that tracks presence (decision 0121), for one api instance. A signed-in user's
 * connections merge into one member: active if any of them is, with the latest connection's metadata.
 */
export class PresenceStore {
  private readonly channels = new Map<string, Map<string, Entry>>();

  /** Everyone in a channel. */
  members(channel: string): PresenceMember[] {
    const keys = new Set([...(this.channels.get(channel) ?? new Map<string, Entry>())].map(([id, entry]) => keyOf(id, entry.userId)));
    return [...keys].map((key) => this.member(channel, key)).filter((member): member is PresenceMember => member !== undefined);
  }

  /** Adds a connection to a channel; the change, if others see one. */
  join(channel: string, connectionId: string, entry: { userId?: string; activity: PresenceActivity; meta?: unknown }): PresenceChange | undefined {
    const key = keyOf(connectionId, entry.userId);
    const before = this.member(channel, key);
    let entries = this.channels.get(channel);
    if (!entries) this.channels.set(channel, (entries = new Map()));
    entries.set(connectionId, { userId: entry.userId, activity: entry.activity, meta: entry.meta, joined: ++joins });
    return this.change(channel, key, before);
  }

  /** Takes a connection out of a channel; the change, if others see one. */
  leave(channel: string, connectionId: string): PresenceChange | undefined {
    const entries = this.channels.get(channel);
    const entry = entries?.get(connectionId);
    if (!entries || !entry) return undefined;
    const key = keyOf(connectionId, entry.userId);
    const before = this.member(channel, key);
    entries.delete(connectionId);
    if (!entries.size) this.channels.delete(channel);
    return this.change(channel, key, before);
  }

  /** Records a connection becoming active or idle; the changes, by channel. */
  setActivity(connectionId: string, activity: PresenceActivity): { channel: string; change: PresenceChange }[] {
    const changes: { channel: string; change: PresenceChange }[] = [];
    for (const [channel, entries] of this.channels) {
      const entry = entries.get(connectionId);
      if (!entry || entry.activity === activity) continue;
      const key = keyOf(connectionId, entry.userId);
      const before = this.member(channel, key);
      entry.activity = activity;
      const change = this.change(channel, key, before);
      if (change) changes.push({ channel, change });
    }
    return changes;
  }

  private member(channel: string, key: string): PresenceMember | undefined {
    const entries = [...(this.channels.get(channel) ?? new Map<string, Entry>())]
      .filter(([id, entry]) => keyOf(id, entry.userId) === key)
      .map(([, entry]) => entry)
      .sort((a, b) => b.joined - a.joined);
    const [latest] = entries;
    if (!latest) return undefined;
    return {
      key,
      ...(latest.userId ? { userId: latest.userId } : {}),
      guest: !latest.userId,
      activity: entries.some((entry) => entry.activity === 'active') ? 'active' : 'idle',
      ...(latest.meta === undefined ? {} : { meta: latest.meta }),
    };
  }

  private change(channel: string, key: string, before: PresenceMember | undefined): PresenceChange | undefined {
    const after = this.member(channel, key);
    if (!after) return before ? { kind: 'leave', key } : undefined;
    if (!before) return { kind: 'join', member: after };
    return JSON.stringify(before) === JSON.stringify(after) ? undefined : { kind: 'update', member: after };
  }
}
