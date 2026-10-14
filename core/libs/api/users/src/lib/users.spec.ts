import { describe, expect, it } from 'vitest';
import { avatarRecipeSchema, polyPatternSchema, richTextFromPlainText } from '@inithium/shared-contracts';
import { UserModel } from './users.model';
import {
  backfillUserProfiles,
  clearProfileImage,
  createUser,
  findUserByEmailWithPassword,
  listUsers,
  toPublicProfile,
  toUser,
  updateUserProfile,
} from './users.service';

const newUser = (email: string, extra: Partial<Parameters<typeof createUser>[0]> = {}) =>
  createUser({ email, passwordHash: 'not-a-real-hash', role: 'user', ...extra });

describe('createUser (decision 0090)', () => {
  it('always stores a generated avatar and banner', async () => {
    const user = await newUser('ada@example.com', { names: { firstName: 'Ada' } });
    const stored = await UserModel.findById(user._id).lean();
    expect(avatarRecipeSchema.parse(stored?.profile?.avatar)).toEqual({ style: 'initials', seed: user._id.toString(), backgroundColor: 'primary' });
    const banner = polyPatternSchema.parse(stored?.profile?.banner);
    expect(banner.cellSize).toBeGreaterThanOrEqual(40);
    expect(banner.cellSize).toBeLessThanOrEqual(150);
    expect(stored?.profile?.firstName).toBe('Ada');
  });

  it('lowercases emails, so sign-in finds them whatever the case', async () => {
    await newUser('Ada@Example.COM');
    expect((await findUserByEmailWithPassword('ADA@example.com'))?.email).toBe('ada@example.com');
  });

  it('refuses a second account with the same email', async () => {
    await newUser('ada@example.com');
    await expect(newUser('ADA@example.com')).rejects.toMatchObject({ code: 11000 });
  });
});

describe('the shapes the api returns', () => {
  it('never include the password hash', async () => {
    const user = await newUser('ada@example.com');
    expect(JSON.stringify(toUser(user))).not.toContain('not-a-real-hash');
    expect(JSON.stringify(toPublicProfile(user, { owner: true }))).not.toContain('not-a-real-hash');
  });

  it('show the email on a public profile only to its owner', async () => {
    const user = await newUser('ada@example.com');
    expect(toPublicProfile(user, { owner: false })).not.toHaveProperty('email');
    expect(toPublicProfile(user, { owner: true }).email).toBe('ada@example.com');
  });

  it('read an old plain-text bio as rich text (decision 0102)', async () => {
    const user = await newUser('ada@example.com');
    await UserModel.updateOne({ _id: user._id }, { $set: { 'profile.bio': 'Hello\nthere' } });
    const reloaded = await UserModel.findById(user._id);
    expect(reloaded && toUser(reloaded).profile.bio).toEqual(richTextFromPlainText('Hello\nthere'));
  });
});

describe('backfillUserProfiles', () => {
  it('gives older accounts an avatar and banner, keeping their names, and changes nothing on a second run', async () => {
    const old = await UserModel.create({ email: 'old@example.com', passwordHash: 'x', role: 'user', profile: { firstName: 'Old' } });
    await backfillUserProfiles();
    const after = await UserModel.findById(old._id).lean();
    expect(after?.profile?.avatar).toBeDefined();
    expect(after?.profile?.banner).toBeDefined();
    expect(after?.profile?.firstName).toBe('Old');

    await backfillUserProfiles();
    expect(await UserModel.findById(old._id).lean()).toEqual(after);
  });
});

describe('updateUserProfile', () => {
  it('changes only the fields given, and removes an empty last name or bio', async () => {
    const user = await newUser('ada@example.com', { names: { firstName: 'Ada', lastName: 'Lovelace' } });
    let updated = await updateUserProfile(user, { bio: richTextFromPlainText('Mathematician') });
    expect(toUser(updated).profile).toMatchObject({ firstName: 'Ada', lastName: 'Lovelace', bio: richTextFromPlainText('Mathematician') });

    updated = await updateUserProfile(updated, { lastName: '', bio: null });
    expect(toUser(updated).profile.lastName).toBeUndefined();
    expect(toUser(updated).profile.bio).toBeUndefined();
    expect(toUser(updated).profile.firstName).toBe('Ada');
  });

  it('sets and clears uploaded pictures, which clearProfileImage also removes everywhere', async () => {
    const user = await newUser('ada@example.com');
    const updated = await updateUserProfile(user, { avatarAssetId: 'asset-1', bannerAssetId: 'asset-1' });
    expect(toUser(updated).profile).toMatchObject({ avatarAssetId: 'asset-1', bannerAssetId: 'asset-1' });
    await clearProfileImage('asset-1');
    const cleared = await UserModel.findById(user._id);
    expect(cleared && toUser(cleared).profile).not.toHaveProperty('avatarAssetId');
    expect(cleared && toUser(cleared).profile).not.toHaveProperty('bannerAssetId');
  });
});

describe('listUsers (decision 0100)', () => {
  it('pages newest first, searches every word and hides excluded roles', async () => {
    await newUser('dev@example.com', { role: 'dev' });
    await newUser('ada@example.com', { names: { firstName: 'Ada', lastName: 'Lovelace' } });
    await newUser('grace@example.com', { names: { firstName: 'Grace', lastName: 'Hopper' } });

    const all = await listUsers({ skip: 0, limit: 10, excludeRoles: ['dev'] });
    expect(all.total).toBe(2);
    expect(all.users.map((user) => user.email)).toEqual(['grace@example.com', 'ada@example.com']);

    expect((await listUsers({ skip: 0, limit: 10, search: 'ada love' })).users.map((user) => user.email)).toEqual(['ada@example.com']);
    expect((await listUsers({ skip: 1, limit: 1, excludeRoles: ['dev'] })).users.map((user) => user.email)).toEqual(['ada@example.com']);
  });

  it('treats search text literally, not as a pattern', async () => {
    await newUser('ada@example.com');
    expect((await listUsers({ skip: 0, limit: 10, search: '.*' })).total).toBe(0);
  });
});
