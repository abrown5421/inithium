import type { Permission, Role } from '@inithium/shared-contracts';

/**
 * The permission matrix: which permissions each role holds.
 * `dev` is not listed because it holds every permission.
 * Pages (decision 0078): editors edit pages; owners and admins also publish and delete them and edit site settings.
 */
export const rolePermissions: Record<Exclude<Role, 'dev'>, readonly Permission[]> = {
  owner: ['cms.access', 'pages.edit', 'pages.publish', 'pages.delete', 'settings.edit'],
  admin: ['cms.access', 'pages.edit', 'pages.publish', 'pages.delete', 'settings.edit'],
  editor: ['cms.access', 'pages.edit'],
  user: [],
};
