import type { ContentElementContract } from '@inithium/shared-contracts';
import type { UserDeletionHook } from '@inithium/api-user-management';

/**
 * What installed plugins and libs/client remove when accounts are deleted (decisions 0015, 0100). Owned by the
 * install/eject tooling: core ships it empty and never adds entries.
 */
export const registeredUserDeletionHooks: UserDeletionHook[] = [];

/**
 * The contracts of content elements from installed plugins and libs/client (decisions 0015, 0116): saved page content
 * is checked against them. Owned by the install/eject tooling: core ships it empty and never adds entries.
 */
export const registeredContentElementContracts: ContentElementContract[] = [];
