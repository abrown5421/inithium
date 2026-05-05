import mongoose from 'mongoose';
import { runAssetSeeder } from '@inithium/asset-manager';
import { runUserSeeder } from '@inithium/api-collections';

interface Seeder {
  collection: string;
  run: () => Promise<void>;
}

const SEEDERS: Seeder[] = [
  { collection: 'assets', run: runAssetSeeder },
  { collection: 'users',  run: runUserSeeder  },
];

export async function seedIfEmpty(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) return;

  const existingCollections = await db.listCollections().toArray();
  const existingNames = new Set(existingCollections.map((c) => c.name));

  for (const seeder of SEEDERS) {
    const count = existingNames.has(seeder.collection)
      ? await db.collection(seeder.collection).countDocuments()
      : 0;

    if (count === 0) {
      console.log(`[seed-guard] "${seeder.collection}" is empty — seeding...`);
      try {
        await seeder.run();
        console.log(`[seed-guard] ✓ "${seeder.collection}" done.`);
      } catch (err) {
        console.error(`[seed-guard] ✗ "${seeder.collection}" failed:`, err);
      }
    } else {
      console.log(`[seed-guard] ✓ "${seeder.collection}" has data — skipping.`);
    }
  }
}