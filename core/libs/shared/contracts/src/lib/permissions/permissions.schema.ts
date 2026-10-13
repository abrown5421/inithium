import { z } from 'zod';

/**
 * Every permission in the system. Grow this list as features are built;
 * which roles hold each one is defined in @inithium/shared-permissions.
 */
export const permissions = [
  'cms.access',
  'pages.create',
  'pages.edit',
  'pages.publish',
  'pages.delete',
  'settings.edit',
  'assets.upload',
  'assets.delete',
  'users.view',
  'users.create',
  'users.edit',
  'users.delete',
] as const;

export const permissionSchema = z.enum(permissions);
