import type { SolidColorValue } from '../ui/style-props.types';
import { presenceStatusKeySchema } from './presence.schema';
import type { UserStatus } from './presence.types';

/**
 * One presence status (decision 0124): the light's colour and the name its tooltip shows. `label` may be a function
 * of a detail the setter gives, e.g. `(game) => game ? `Playing ${game}` : 'Playing'`. `priority` decides between
 * plugin statuses set at once (higher wins); core's own three don't use it.
 */
export type PresenceStatusDefinition = {
  key: string;
  label: string | ((detail: string | undefined) => string);
  color: SolidColorValue;
  priority: number;
};

/** Defines a presence status, checking its key. Plugins put theirs in their `contracts` lib. */
export function definePresenceStatus(definition: PresenceStatusDefinition): PresenceStatusDefinition {
  if (!presenceStatusKeySchema.safeParse(definition.key).success) throw new Error(`'${definition.key}' is not a presence status key`);
  return definition;
}

/** Signed in, with input in the last 10 minutes on any tab or device. */
export const activeStatus = definePresenceStatus({ key: 'active', label: 'Active', color: { color: 'green', intensity: 500 }, priority: 0 });
/** Signed in and connected, but with no input for 10 minutes or more. */
export const inactiveStatus = definePresenceStatus({ key: 'inactive', label: 'Inactive', color: { color: 'yellow', intensity: 500 }, priority: 0 });
/** Not on the site: signed out, or every tab closed. */
export const awayStatus = definePresenceStatus({ key: 'away', label: 'Away', color: { color: 'surface', intensity: 500 }, priority: 0 });

/** Core's statuses. Their keys are reserved. */
export const corePresenceStatuses = [activeStatus, inactiveStatus, awayStatus];

let registered = new Map<string, PresenceStatusDefinition>(corePresenceStatuses.map((status) => [status.key, status]));

/**
 * Sets the statuses installed plugins and libs/client add (each app's registry's `registeredPresenceStatuses`), on
 * top of core's. Throws on a key used twice, a core key, or a plain key (extra statuses must be namespaced).
 */
export function registerPresenceStatuses(statuses: readonly PresenceStatusDefinition[]): void {
  const next = new Map(corePresenceStatuses.map((status) => [status.key, status]));
  for (const status of statuses) {
    if (!status.key.includes(':')) throw new Error(`Presence status '${status.key}' must be named plugin-<name>:<status> or client-<name>:<status>`);
    if (next.has(status.key)) throw new Error(`Two presence statuses are both '${status.key}'`);
    next.set(status.key, status);
  }
  registered = next;
}

/** A registered status by key, if there is one. */
export function findPresenceStatus(key: string): PresenceStatusDefinition | undefined {
  return registered.get(key);
}

/** The light to draw for a status: its colour and label. An unknown status (e.g. its plugin ejected) shows as active. */
export function presenceLight(status: UserStatus): { color: SolidColorValue; label: string } {
  const definition = findPresenceStatus(status.status) ?? activeStatus;
  return { color: definition.color, label: typeof definition.label === 'function' ? definition.label(status.detail) : definition.label };
}
