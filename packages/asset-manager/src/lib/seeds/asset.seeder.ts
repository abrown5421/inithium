import mongoose from 'mongoose';
import { AssetModel } from '@inithium/api-collections';

const ASSETS = [
  {
    _id: '69d9794e88056611b0f021b8',
    filename: 'a70b4929-7e64-407a-a4e5-a3b3c58bd326.jpg',
    original_name: 'inithium-logo.jpg',
    mimetype: 'image/jpeg',
    size: 2057885,
    storage_key: 'a70b4929-7e64-407a-a4e5-a3b3c58bd326.jpg',
    category: 'image',
    is_system_asset: false,
    createdAt: '2026-04-10T22:27:26.436Z',
    updatedAt: '2026-04-10T22:27:26.436Z',
  },
  {
    _id: '69d97d16f1e89b9ae7328ab3',
    filename: '2824042f-8017-465f-90e3-2e7961cfe6ed.ttf',
    original_name: 'BlackOpsOne.ttf',
    mimetype: 'font/ttf',
    size: 163904,
    storage_key: '2824042f-8017-465f-90e3-2e7961cfe6ed.ttf',
    category: 'font',
    is_system_asset: false,
    createdAt: '2026-04-10T22:43:34.362Z',
    updatedAt: '2026-04-10T22:43:34.362Z',
  },
  {
    _id: '69d97d16f1e89b9ae7328ab4',
    filename: '38bcae52-b8f5-4360-841b-2bed8d40d7b3.ttf',
    original_name: 'BrunoAceSC.ttf',
    mimetype: 'font/ttf',
    size: 55300,
    storage_key: '38bcae52-b8f5-4360-841b-2bed8d40d7b3.ttf',
    category: 'font',
    is_system_asset: false,
    createdAt: '2026-04-10T22:43:34.425Z',
    updatedAt: '2026-04-10T22:43:34.425Z',
  },
];

export async function runAssetSeeder(): Promise<void> {
  let inserted = 0, skipped = 0;

  for (const raw of ASSETS) {
    const result = await AssetModel.updateOne(
      { _id: raw._id },
      {
        $setOnInsert: {
          filename:        raw.filename,
          original_name:   raw.original_name,
          mimetype:        raw.mimetype,
          size:            raw.size,
          storage_key:     raw.storage_key,
          category:        raw.category,
          is_system_asset: raw.is_system_asset,
          createdAt:       new Date(raw.createdAt),
          updatedAt:       new Date(raw.updatedAt),
        },
      },
      { upsert: true }
    );
    result.upsertedCount > 0 ? inserted++ : skipped++;
  }

  console.log(`[asset-seeder] ${inserted} inserted, ${skipped} skipped.`);
}