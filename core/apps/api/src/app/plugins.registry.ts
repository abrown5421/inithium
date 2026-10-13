import type { UserDeletionHook } from '@inithium/api-user-management';

/**
 * What installed plugins and libs/client remove when accounts are deleted (decisions 0015, 0100). Owned by the
 * install/eject tooling: core ships it empty and never adds entries.
 */
export const registeredUserDeletionHooks: UserDeletionHook[] = [];
