import { Router, type Request, type Response } from 'express';
import { getAuth, requirePermission } from '@inithium/api-auth';
import {
  createUserRequestSchema,
  deleteUsersRequestSchema,
  updateUserRequestSchema,
  userListQuerySchema,
  type DeleteUsersResponse,
  type ManagedUser,
  type UserListResponse,
  type UserManagementInfo,
} from '@inithium/shared-contracts';
import type { UserDeletionHook } from './user-deletion.types';
import {
  createManagedUser,
  deleteManagedUsers,
  listManagedUsers,
  resetManagedUserPassword,
  updateManagedUser,
  userManagementInfo,
  type Actor,
} from './user-management.service';

const actor = (res: Response): Actor => {
  const { sub, role } = getAuth(res);
  return { id: sub, role };
};
const invalid = (res: Response, issues: unknown) => res.status(400).send({ message: 'Check the highlighted fields and try again', issues });
const param = (req: Request, name: string) => String(req.params[name]);

/**
 * The CMS's user management (decision 0100), mounted at /api/users. `deletionHooks` come from the api's registry, so
 * plugins remove their data when accounts are deleted.
 */
export function createUsersRouter({ deletionHooks }: { deletionHooks: readonly UserDeletionHook[] }): Router {
  const router = Router();

  /** Whether accounts can be created and passwords reset on this site. */
  router.get('/info', ...requirePermission('users.view'), (_req, res) => {
    const body: UserManagementInfo = userManagementInfo();
    res.send(body);
  });

  /** A page of accounts: `page`, `pageSize` (25), `q` and `role`. */
  router.get('/', ...requirePermission('users.view'), async (req, res) => {
    const query = userListQuerySchema.safeParse(req.query);
    if (!query.success) return void invalid(res, query.error.issues);
    const body: UserListResponse = await listManagedUsers(actor(res), query.data);
    res.send(body);
  });

  /** Creates an account with the site's temporary password. */
  router.post('/', ...requirePermission('users.create'), async (req, res) => {
    const parsed = createUserRequestSchema.safeParse(req.body);
    if (!parsed.success) return void invalid(res, parsed.error.issues);
    const body: ManagedUser = await createManagedUser(actor(res), parsed.data);
    res.status(201).send(body);
  });

  /** Deletes one or many accounts; answers with those deleted and those that weren't, with reasons. */
  router.post('/delete', ...requirePermission('users.delete'), async (req, res) => {
    const parsed = deleteUsersRequestSchema.safeParse(req.body);
    if (!parsed.success) return void invalid(res, parsed.error.issues);
    const body: DeleteUsersResponse = await deleteManagedUsers(actor(res), parsed.data.ids, deletionHooks);
    res.send(body);
  });

  /** Changes an account's names or role. */
  router.patch('/:id', ...requirePermission('users.edit'), async (req, res) => {
    const parsed = updateUserRequestSchema.safeParse(req.body);
    if (!parsed.success) return void invalid(res, parsed.error.issues);
    const body: ManagedUser = await updateManagedUser(actor(res), param(req, 'id'), parsed.data);
    res.send(body);
  });

  /** Puts an account back on the temporary password and signs it out. */
  router.post('/:id/reset-password', ...requirePermission('users.edit'), async (req, res) => {
    const body: ManagedUser = await resetManagedUserPassword(actor(res), param(req, 'id'));
    res.send(body);
  });

  return router;
}
