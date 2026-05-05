import bcrypt from 'bcrypt';
import { UserModel } from './user.model.js';

const SALT_ROUNDS = 12;

const USERS = [
  {
    email: 'admin@inithium.com',
    password: 'Inithium123!',
    first_name: 'Super',
    last_name: 'Admin',
    role: 'super-admin' as const,
    dark_mode: true,
  },
];

export async function runUserSeeder(): Promise<void> {
  let inserted = 0, skipped = 0;

  for (const raw of USERS) {
    const existing = await UserModel.findOne({ email: raw.email });

    if (existing) {
      console.log(`  [user-seeder] Already exists, skipped: ${raw.email}`);
      skipped++;
      continue;
    }

    const hashedPassword = await bcrypt.hash(raw.password, SALT_ROUNDS);

    await UserModel.create({
      ...raw,
      password: hashedPassword,
    });

    console.log(`  [user-seeder] Inserted: ${raw.email}`);
    inserted++;
  }

  console.log(`  [user-seeder] Done — ${inserted} inserted, ${skipped} skipped.`);
}