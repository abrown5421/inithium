import { runUserSeeder, shouldRunUserSeeder } from '@inithium/api-collections';
import { runAssetSeeder, shouldRunAssetSeeder } from '@inithium/api-collections';

const SEEDERS = [
  { label: 'users',  shouldRun: shouldRunUserSeeder,  run: runUserSeeder  },
  { label: 'assets', shouldRun: shouldRunAssetSeeder, run: runAssetSeeder },
];

export async function seedIfEmpty(): Promise<void> {
  for (const seeder of SEEDERS) {
    if (await seeder.shouldRun()) {
      console.log(`[seed-guard] "${seeder.label}" is missing data — seeding...`);
      await seeder.run();
    } else {
      console.log(`[seed-guard] ✓ "${seeder.label}" has all required data — skipping.`);
    }
  }
}