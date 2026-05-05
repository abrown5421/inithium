import mongoose from 'mongoose';
import { runAssetSeeder } from '@inithium/asset-manager';

export async function seedIfEmpty(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) return;

  const collections = await db.listCollections({ name: 'assets' }).toArray();
  const count = collections.length > 0
    ? await db.collection('assets').countDocuments()
    : 0;

  if (count === 0) {
    console.log('[seed-guard] Seeding default assets...');
    await runAssetSeeder();
    console.log('[seed-guard] Done.');
  }
}