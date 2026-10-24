import type { ContentElementContract, PresenceStatusDefinition } from '@inithium/shared-contracts';
import type { SetupChecklistItem } from '@inithium/api-dashboards';
import type { RealtimeChannelServer } from '@inithium/api-realtime';
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

/**
 * Steps on the CMS dashboard's setup checklist from installed plugins and libs/client (decisions 0015, 0120), e.g. a
 * shop's 'Set up payments'. Owned by the install/eject tooling: core ships it empty and never adds entries.
 */
export const registeredSetupChecklistItems: SetupChecklistItem[] = [];

/**
 * Realtime channels served for installed plugins and libs/client (decisions 0015, 0121), each from
 * `serveRealtimeChannel()`. Owned by the install/eject tooling: core ships it empty and never adds entries.
 */
export const registeredRealtimeChannels: RealtimeChannelServer[] = [];

/**
 * Presence statuses from installed plugins and libs/client (decisions 0015, 0124), e.g. 'In a class', set with
 * `setUserStatus()`. The same list goes in the web and cms registries. Owned by the install/eject tooling: core
 * ships it empty and never adds entries.
 */
export const registeredPresenceStatuses: PresenceStatusDefinition[] = [];
