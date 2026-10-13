/**
 * The "user deleted" slot (decisions 0015, 0100): how a plugin (or `libs/client/`) removes the data it keeps about
 * accounts that are being deleted. Register one in the api's registry (`apps/api/src/app/plugins.registry.ts`).
 *
 * Hooks run before core removes anything. If one throws, none of the batch is deleted and the CMS reports why, so
 * `deleteUserData` must be safe to run again for the same ids (e.g. `deleteMany`, which does nothing the second time).
 */
export type UserDeletionHook = {
  /** Unique among hooks, e.g. the plugin's name. */
  key: string;
  /** What it removes, as the CMS names it if it fails, e.g. 'order history'. */
  label: string;
  /** Deletes everything this plugin keeps for these accounts (their ids, as strings). */
  deleteUserData(userIds: string[]): Promise<void>;
};
