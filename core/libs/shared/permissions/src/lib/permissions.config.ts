import type { Permission, Role } from '@inithium/shared-contracts';

/**
 * The permission matrix: which permissions each role holds.
 * `dev` is not listed because it holds every permission.
 * Pages (decisions 0078, 0093): editors create and edit pages; owners and admins also publish and delete them and edit
 * site settings. Assets (decision 0098): editors upload; owners and admins also delete. Users (decision 0100): editors
 * see and create accounts (up to editor); owners and admins also edit and delete them.
 */
export const rolePermissions: Record<Exclude<Role, 'dev'>, readonly Permission[]> = {
  owner: ['cms.access', 'pages.create', 'pages.edit', 'pages.publish', 'pages.delete', 'settings.edit', 'assets.upload', 'assets.delete', 'users.view', 'users.create', 'users.edit', 'users.delete'],
  admin: ['cms.access', 'pages.create', 'pages.edit', 'pages.publish', 'pages.delete', 'settings.edit', 'assets.upload', 'assets.delete', 'users.view', 'users.create', 'users.edit', 'users.delete'],
  editor: ['cms.access', 'pages.create', 'pages.edit', 'assets.upload', 'users.view', 'users.create'],
  user: [],
};
