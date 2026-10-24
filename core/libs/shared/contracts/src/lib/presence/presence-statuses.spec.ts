import { afterEach, describe, expect, it } from 'vitest';
import { definePresenceStatus, findPresenceStatus, presenceLight, registerPresenceStatuses } from './presence-statuses.service';

const inClass = definePresenceStatus({ key: 'plugin-classes:in-class', label: 'In a class', color: { color: 'violet', intensity: 500 }, priority: 10 });
const playing = definePresenceStatus({
  key: 'client-games:playing',
  label: (game) => (game ? `Playing ${game}` : 'Playing'),
  color: { color: 'sky', intensity: 500 },
  priority: 20,
});

afterEach(() => registerPresenceStatuses([]));

describe('presence statuses (decision 0124)', () => {
  it('has core’s three, with their colours and names', () => {
    expect(presenceLight({ status: 'active' })).toEqual({ color: { color: 'green', intensity: 500 }, label: 'Active' });
    expect(presenceLight({ status: 'inactive' })).toEqual({ color: { color: 'yellow', intensity: 500 }, label: 'Inactive' });
    expect(presenceLight({ status: 'away' })).toEqual({ color: { color: 'surface', intensity: 500 }, label: 'Away' });
  });

  it('adds registered statuses, with labels from their detail', () => {
    registerPresenceStatuses([inClass, playing]);
    expect(findPresenceStatus('plugin-classes:in-class')).toBe(inClass);
    expect(presenceLight({ status: 'client-games:playing', detail: 'Trivia Night' }).label).toBe('Playing Trivia Night');
    expect(presenceLight({ status: 'client-games:playing' }).label).toBe('Playing');
  });

  it('shows an unknown status (its plugin gone) as active', () => {
    expect(presenceLight({ status: 'plugin-gone:busy' }).label).toBe('Active');
  });

  it('refuses plain keys, core’s keys, repeats and malformed keys', () => {
    expect(() => registerPresenceStatuses([{ ...inClass, key: 'busy' }])).toThrow('plugin-<name>');
    expect(() => registerPresenceStatuses([inClass, inClass])).toThrow('Two presence statuses');
    expect(() => definePresenceStatus({ ...inClass, key: 'Plugin Classes' })).toThrow('not a presence status key');
  });
});
