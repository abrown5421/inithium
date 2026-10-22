import { describe, expect, it } from 'vitest';
import { PresenceStore } from './realtime-presence.service';

describe('PresenceStore (decision 0121)', () => {
  it('announces a first connection as a join and lists it', () => {
    const store = new PresenceStore();
    expect(store.join('room', 'c1', { userId: 'u1', activity: 'active', meta: { seat: 1 } })).toEqual({
      kind: 'join',
      member: { key: 'u1', userId: 'u1', guest: false, activity: 'active', meta: { seat: 1 } },
    });
    expect(store.members('room')).toHaveLength(1);
  });

  it('merges a user’s connections into one member, active if any is', () => {
    const store = new PresenceStore();
    store.join('room', 'c1', { userId: 'u1', activity: 'idle' });
    expect(store.join('room', 'c2', { userId: 'u1', activity: 'idle' })).toBeUndefined();
    expect(store.join('room', 'c3', { userId: 'u1', activity: 'active' })).toMatchObject({ kind: 'update', member: { activity: 'active' } });
    expect(store.members('room')).toHaveLength(1);
    expect(store.leave('room', 'c3')).toMatchObject({ kind: 'update', member: { activity: 'idle' } });
    expect(store.leave('room', 'c1')).toBeUndefined();
    expect(store.leave('room', 'c2')).toEqual({ kind: 'leave', key: 'u1' });
    expect(store.members('room')).toEqual([]);
  });

  it('counts each guest connection on its own', () => {
    const store = new PresenceStore();
    store.join('room', 'g1', { activity: 'active' });
    store.join('room', 'g2', { activity: 'active' });
    expect(store.members('room').map((member) => member.key).sort()).toEqual(['guest:g1', 'guest:g2']);
    expect(store.members('room').every((member) => member.guest && !member.userId)).toBe(true);
  });

  it('reports activity changes in every channel the connection is in, once', () => {
    const store = new PresenceStore();
    store.join('a', 'c1', { userId: 'u1', activity: 'active' });
    store.join('b', 'c1', { userId: 'u1', activity: 'active' });
    expect(store.setActivity('c1', 'idle').map(({ channel }) => channel).sort()).toEqual(['a', 'b']);
    expect(store.setActivity('c1', 'idle')).toEqual([]);
  });
});
