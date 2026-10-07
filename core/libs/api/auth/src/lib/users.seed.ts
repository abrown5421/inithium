import { createUser, userExistsWithEmail, userExistsWithRole } from '@inithium/api-users';
import { hashPassword } from './passwords.service';

/**
 * Creates the dev account if no dev user exists. Runs on every api startup and never
 * modifies an existing account, so a changed password is never reset.
 */
export async function seedDevUser(credentials: { email: string; password: string }): Promise<void> {
  if (await userExistsWithRole('dev')) return;

  if (await userExistsWithEmail(credentials.email)) {
    // Never promote an existing account to dev automatically.
    console.warn(`[ seed ] dev user not created: ${credentials.email} already belongs to a non-dev account`);
    return;
  }

  await createUser({
    email: credentials.email,
    passwordHash: await hashPassword(credentials.password),
    role: 'dev',
    passwordChangeRequired: true,
  });
  console.log(`[ seed ] created dev user ${credentials.email}`);
}
