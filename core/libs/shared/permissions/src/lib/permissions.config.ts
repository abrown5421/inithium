import type { Permission, Role } from '@inithium/shared-contracts';

/**
 * The permission matrix: which permissions each role holds.
 * `dev` is not listed because it holds every permission.
 * Admin and editor differences are added as CMS features are built.
 */
export const rolePermissions: Record<Exclude<Role, 'dev'>, readonly Permission[]> = {
  owner: ['cms.access'],
  admin: ['cms.access'],
  editor: ['cms.access'],
  user: [],
};
