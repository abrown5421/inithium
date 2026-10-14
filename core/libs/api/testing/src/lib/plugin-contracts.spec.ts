import mongoose, { Schema } from 'mongoose';
import { describe, expect, it } from 'vitest';
import { expectSeedIsIdempotent, expectUnseedRestores, expectUserDeletionHook } from './plugin-contracts.service';
import { describeChanges, snapshotDatabase } from './test-database.service';

// A stand-in plugin: an "addresses" collection keyed by userId, and a seeded settings record.
const AddressModel = mongoose.model('KitAddress', new Schema({ userId: { type: Schema.Types.ObjectId, required: true }, line: String }));
const SettingModel = mongoose.model('KitSetting', new Schema({ key: { type: String, unique: true }, value: String }, { timestamps: true }));

const goodSeed = async () => {
  if (!(await SettingModel.exists({ key: 'shipping' }))) await SettingModel.create({ key: 'shipping', value: 'flat' });
};
const goodUnseed = async () => {
  await SettingModel.deleteMany({ key: 'shipping' });
};

describe('snapshots', () => {
  it('report added, removed and changed documents by collection', async () => {
    const before = await snapshotDatabase();
    const doc = await SettingModel.create({ key: 'a', value: '1' });
    const added = await snapshotDatabase();
    expect(describeChanges(before, added)).toEqual([{ collection: 'kitsettings', added: [JSON.stringify({ $oid: doc._id.toString() })], removed: [], changed: [] }]);
    const ignoring = { ignoreFields: ['value', 'updatedAt'] };
    const addedIgnoring = await snapshotDatabase(ignoring);
    await SettingModel.updateOne({ _id: doc._id }, { value: '2' });
    expect(describeChanges(added, await snapshotDatabase())[0]?.changed).toHaveLength(1);
    expect(describeChanges(addedIgnoring, await snapshotDatabase(ignoring))).toEqual([]);
  });

  it('start every test with an empty database', async () => {
    expect(await snapshotDatabase()).toEqual({});
  });
});

describe('expectSeedIsIdempotent', () => {
  it('passes a seed that checks before it creates, returning what it created', async () => {
    const created = await expectSeedIsIdempotent(goodSeed);
    expect(created.map((change) => [change.collection, change.added.length])).toEqual([['kitsettings', 1]]);
  });

  it('fails a seed that creates duplicates', async () => {
    await expect(expectSeedIsIdempotent(async () => void (await AddressModel.create({ userId: new mongoose.Types.ObjectId() })))).rejects.toThrow(
      /second time/,
    );
  });

  it('fails a seed that rewrites what it already created', async () => {
    await expect(
      expectSeedIsIdempotent(async () => void (await SettingModel.findOneAndUpdate({ key: 'x' }, { value: String(Math.random()) }, { upsert: true }))),
    ).rejects.toThrow(/second time/);
  });
});

describe('expectUnseedRestores', () => {
  it('passes an unseed that removes exactly what its seed made', async () => {
    await SettingModel.create({ key: 'core-owned', value: 'keep me' });
    await expectUnseedRestores({ seed: goodSeed, unseed: goodUnseed });
  });

  it('fails an unseed that leaves something behind', async () => {
    await expect(expectUnseedRestores({ seed: goodSeed, unseed: async () => undefined })).rejects.toThrow(/different from before/);
  });

  it('fails an unseed that removes more than its seed made', async () => {
    await SettingModel.create({ key: 'core-owned', value: 'keep me' });
    await expect(expectUnseedRestores({ seed: goodSeed, unseed: async () => void (await SettingModel.deleteMany({})) })).rejects.toThrow(
      /different from before/,
    );
  });
});

describe('expectUserDeletionHook', () => {
  const createAddress = async (userId: string) => void (await AddressModel.create({ userId, line: `1 ${userId} Street` }));

  it('passes a hook that deletes by userId', async () => {
    await expectUserDeletionHook(
      { key: 'kit', label: 'addresses', deleteUserData: async (ids) => void (await AddressModel.deleteMany({ userId: { $in: ids } })) },
      createAddress,
    );
  });

  it('fails a hook that leaves data behind', async () => {
    await expect(expectUserDeletionHook({ key: 'kit', label: 'addresses', deleteUserData: async () => undefined }, createAddress)).rejects.toThrow(
      /left behind/,
    );
  });

  it('fails a hook that touches other accounts’ data', async () => {
    await expect(
      expectUserDeletionHook({ key: 'kit', label: 'addresses', deleteUserData: async () => void (await AddressModel.deleteMany({})) }, createAddress),
    ).rejects.toThrow(/not deleted/);
  });

  it('fails a hook that can’t run twice', async () => {
    let runs = 0;
    const hook = {
      key: 'kit',
      label: 'addresses',
      deleteUserData: async (ids: string[]) => {
        if (++runs > 1) throw new Error('already deleted');
        await AddressModel.deleteMany({ userId: { $in: ids } });
      },
    };
    await expect(expectUserDeletionHook(hook, createAddress)).rejects.toThrow(/already deleted/);
  });

  it('fails when the test data carries no userId', async () => {
    await expect(
      expectUserDeletionHook({ key: 'kit', label: 'addresses', deleteUserData: async () => undefined }, async () => void (await SettingModel.create({ key: String(Math.random()) }))),
    ).rejects.toThrow(/stored nothing/);
  });
});
