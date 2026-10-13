import { loadEnv } from '@inithium/api-config';
import { deleteMemberUploads } from '@inithium/api-assets';
import { endSessionsOfDeletedUsers, hashPassword, revokeSessions } from '@inithium/api-auth';
import {
  countUsersWithRole,
  createUser,
  deleteUserRecords,
  findUserById,
  findUsersByIds,
  listUsers,
  toManagedUser,
  userExistsWithEmail,
  type UserDocument,
} from '@inithium/api-users';
import {
  userDisplayName,
  type CreateUserRequest,
  type DeleteUsersResponse,
  type ManagedUser,
  type Role,
  type UpdateUserRequest,
  type UserListResponse,
  type UserManagementInfo,
} from '@inithium/shared-contracts';
import { assignableRoles, canManageRole } from '@inithium/shared-permissions';
import type { UserDeletionHook } from './user-deletion.types';

/** The signed-in account making the change. */
export type Actor = { id: string; role: Role };

/** An error the api's error handler sends as `status` with `message` (and `field`, to mark a form field). */
const httpError = (status: number, message: string, field?: string) => Object.assign(new Error(message), { status, field });

/** Dev accounts are visible only to dev (decision 0100). */
const hiddenRoles = (actor: Actor): Role[] => (actor.role === 'dev' ? [] : ['dev']);

export function userManagementInfo(): UserManagementInfo {
  return { tempPasswordSet: Boolean(loadEnv().USER_TEMP_PASSWORD) };
}

/** The site's temporary password, or a 409 explaining how to turn creating accounts and resets on. */
async function temporaryPasswordHash(): Promise<string> {
  const password = loadEnv().USER_TEMP_PASSWORD;
  if (!password) throw httpError(409, 'Set USER_TEMP_PASSWORD on the server to create accounts and reset passwords.');
  return hashPassword(password);
}

/** A page of accounts, without those the actor mustn't see. */
export async function listManagedUsers(
  actor: Actor,
  query: { page: number; pageSize: number; q?: string; role?: Role },
): Promise<UserListResponse> {
  const { users, total } = await listUsers({
    skip: (query.page - 1) * query.pageSize,
    limit: query.pageSize,
    search: query.q,
    role: query.role,
    excludeRoles: hiddenRoles(actor),
  });
  return { users: users.map(toManagedUser), total, page: query.page, pageSize: query.pageSize };
}

/** An account the actor may act on, or a 404 (missing or hidden) / 403 (more senior than the actor). */
async function managedTarget(actor: Actor, id: string): Promise<UserDocument> {
  const user = await findUserById(id);
  if (!user || hiddenRoles(actor).includes(user.role)) throw httpError(404, 'Account not found');
  if (!canManageRole(actor.role, user.role)) throw httpError(403, 'You can’t change accounts more senior than your own');
  return user;
}

function checkAssignable(actor: Actor, role: Role): void {
  if (!assignableRoles(actor.role).includes(role)) throw httpError(403, `You can’t give the ${role} role`, 'role');
}

/**
 * Creates an account as sign-up does (decision 0100): the same generated avatar and banner, with the site's temporary
 * password, which it must change on first sign-in. The role must be one the actor may give.
 */
export async function createManagedUser(actor: Actor, input: CreateUserRequest): Promise<ManagedUser> {
  checkAssignable(actor, input.role);
  if (await userExistsWithEmail(input.email)) throw httpError(409, 'An account with this email already exists', 'email');
  const user = await createUser({
    email: input.email,
    passwordHash: await temporaryPasswordHash(),
    role: input.role,
    passwordChangeRequired: true,
    names: { firstName: input.firstName, ...(input.lastName ? { lastName: input.lastName } : {}) },
    createdBy: actor.id,
  });
  return toManagedUser(user);
}

/**
 * Changes an account's names or role. Nobody changes their own role, the last owner stays an owner, and a role change
 * signs the account out everywhere so it applies at once.
 */
export async function updateManagedUser(actor: Actor, id: string, input: UpdateUserRequest): Promise<ManagedUser> {
  const user = await managedTarget(actor, id);
  const roleChanges = input.role !== undefined && input.role !== user.role;
  if (roleChanges) {
    if (id === actor.id) throw httpError(403, 'You can’t change your own role', 'role');
    checkAssignable(actor, input.role as Role);
    if (user.role === 'owner' && (await countUsersWithRole('owner')) <= 1) {
      throw httpError(409, 'The site must keep at least one owner. Make someone else an owner first.', 'role');
    }
    user.role = input.role as Role;
  }
  if (input.firstName !== undefined) user.set('profile.firstName', input.firstName);
  if (input.lastName !== undefined) user.set('profile.lastName', input.lastName || undefined);
  await user.save();
  if (roleChanges) await revokeSessions(id);
  return toManagedUser(user);
}

/** Puts an account back on the site's temporary password, which it must change, and signs it out everywhere. */
export async function resetManagedUserPassword(actor: Actor, id: string): Promise<ManagedUser> {
  const user = await managedTarget(actor, id);
  if (id === actor.id) throw httpError(403, 'Change your own password from your account instead');
  user.set('passwordHash', await temporaryPasswordHash());
  user.passwordChangeRequired = true;
  await user.save();
  await revokeSessions(id);
  return toManagedUser(user);
}

/**
 * Deletes accounts, permanently (decision 0100). Each one must be manageable by the actor, not the actor themselves,
 * and not leave the site without an owner; the rest are reported as failed with the reason. For the allowed ones:
 * every deletion hook removes its plugin's data first (if one fails, nothing is deleted), then core signs them out,
 * deletes their avatar and banner uploads, and deletes the records.
 */
export async function deleteManagedUsers(actor: Actor, ids: string[], hooks: readonly UserDeletionHook[]): Promise<DeleteUsersResponse> {
  const unique = [...new Set(ids)];
  const found = await findUsersByIds(unique);
  const failed: DeleteUsersResponse['failed'] = [];
  const allowed: UserDocument[] = [];
  let ownersLeft = await countUsersWithRole('owner');

  for (const id of unique) {
    const user = found.find((candidate) => candidate._id.toString() === id);
    const hidden = !user || hiddenRoles(actor).includes(user.role);
    const name = user && !hidden ? userDisplayName({ email: user.email, profile: user.profile ?? undefined }) : 'Unknown account';
    const reason = hidden
      ? 'It doesn’t exist'
      : id === actor.id
        ? 'You can’t delete your own account'
        : !canManageRole(actor.role, user.role)
          ? 'It’s more senior than your own'
          : user.role === 'owner' && ownersLeft <= 1
            ? 'The site must keep at least one owner'
            : null;
    if (reason) {
      failed.push({ id, name, reason });
      continue;
    }
    if (user?.role === 'owner') ownersLeft -= 1;
    if (user) allowed.push(user);
  }
  if (allowed.length === 0) return { deleted: [], failed };

  const allowedIds = allowed.map((user) => user._id.toString());
  for (const hook of hooks) {
    try {
      await hook.deleteUserData(allowedIds);
    } catch (error) {
      const reason = `Their ${hook.label} couldn’t be removed (${(error as Error).message}). Nothing was deleted; try again.`;
      console.error(`[ users ] deletion hook '${hook.key}' failed: ${(error as Error).message}`);
      for (const user of allowed) failed.push({ id: user._id.toString(), name: userDisplayName({ email: user.email, profile: user.profile ?? undefined }), reason });
      return { deleted: [], failed };
    }
  }

  await endSessionsOfDeletedUsers(allowedIds);
  await deleteMemberUploads(allowedIds);
  await deleteUserRecords(allowedIds);
  return { deleted: allowedIds, failed };
}
