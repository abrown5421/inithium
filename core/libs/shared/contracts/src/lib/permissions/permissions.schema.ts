import { z } from 'zod';

/**
 * Every permission in the system. Grow this list as features are built;
 * which roles hold each one is defined in @inithium/shared-permissions.
 */
export const permissions = ['cms.access'] as const;

export const permissionSchema = z.enum(permissions);
