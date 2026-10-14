import { describe, expect, it } from 'vitest';
import { publicProfileName } from './profiles.schema';
import { userDisplayName } from './users.schema';

describe('names (decision 0090)', () => {
  it('shows users their own name, or their email without one', () => {
    expect(userDisplayName({ email: 'ada@example.com', profile: { firstName: 'Ada', lastName: 'Lovelace' } })).toBe('Ada Lovelace');
    expect(userDisplayName({ email: 'ada@example.com', profile: { firstName: 'Ada' } })).toBe('Ada');
    expect(userDisplayName({ email: 'ada@example.com', profile: {} })).toBe('ada@example.com');
    expect(userDisplayName({ email: 'ada@example.com' })).toBe('ada@example.com');
  });

  it('shows others a nameless profile as Member, never the email', () => {
    expect(publicProfileName({ firstName: 'Ada' })).toBe('Ada');
    expect(publicProfileName({})).toBe('Member');
  });
});
