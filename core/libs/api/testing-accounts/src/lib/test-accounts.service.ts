import type { Express, Router } from 'express';
import { authRouter, hashPassword } from '@inithium/api-auth';
import { createTestApi, testClient, type TestClient } from '@inithium/api-testing';
import { createUser, type UserDocument } from '@inithium/api-users';
import type { Role } from '@inithium/shared-contracts';

/** The password every test account is created with (it meets the password policy). */
export const TEST_PASSWORD = 'Test-password-1!';

// Hashing is deliberately slow (scrypt), so every test account shares one hash per test file.
let passwordHash: Promise<string> | undefined;

/** A test account: its record plus what's needed to sign in as it. */
export type TestAccount = { id: string; email: string; password: string; role: Role; user: UserDocument };

let created = 0;

/**
 * Creates an account through core's `createUser()`, as sign-up and the CMS do: a `user` unless `role` says otherwise,
 * with a unique email and TEST_PASSWORD.
 */
export async function createTestAccount(
  options: { role?: Role; email?: string; firstName?: string; lastName?: string; passwordChangeRequired?: boolean } = {},
): Promise<TestAccount> {
  passwordHash ??= hashPassword(TEST_PASSWORD);
  const role = options.role ?? 'user';
  const user = await createUser({
    email: options.email ?? `${role}-${++created}-${Date.now()}@example.com`,
    passwordHash: await passwordHash,
    role,
    ...(options.passwordChangeRequired ? { passwordChangeRequired: true } : {}),
    ...(options.firstName ? { names: { firstName: options.firstName, ...(options.lastName ? { lastName: options.lastName } : {}) } } : {}),
  });
  return { id: user._id.toString(), email: user.email, password: TEST_PASSWORD, role, user };
}

/** A test app (see `createTestApi`) that also mounts core's auth routes at /api/auth, so clients can sign in. */
export function createTestApiWithAuth(mount: (api: Router) => void): Express {
  return createTestApi((api) => {
    api.use('/auth', authRouter);
    mount(api);
  });
}

/** Signs the client in as the account through POST /api/auth/login, failing the test if that doesn't work. */
export async function signIn(client: TestClient, account: Pick<TestAccount, 'email' | 'password'>): Promise<void> {
  const response = await client.post('/api/auth/login', { email: account.email, password: account.password });
  if (response.status !== 200) throw new Error(`Signing in as ${account.email} failed: ${response.status} ${JSON.stringify(response.body)}`);
}

/**
 * A new account with the role and a client signed in as it, on an app from `createTestApiWithAuth`.
 *
 * ```ts
 * const { client, account } = await signedInClient(app, 'editor');
 * ```
 */
export async function signedInClient(app: Express, role: Role = 'user'): Promise<{ client: TestClient; account: TestAccount }> {
  const account = await createTestAccount({ role });
  const client = testClient(app);
  await signIn(client, account);
  return { client, account };
}
