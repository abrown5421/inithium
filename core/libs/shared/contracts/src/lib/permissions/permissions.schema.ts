import { z } from 'zod';

/**
 * Every permission in the system. Grow this list as features are built;
 * which roles hold each one is defined in @inithium/shared-permissions.
 */
export const permissions = ['cms.access', 'pages.edit', 'pages.publish', 'pages.delete', 'settings.edit'] as const;

export const permissionSchema = z.enum(permissions);
