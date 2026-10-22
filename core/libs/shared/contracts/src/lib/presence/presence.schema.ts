import { z } from 'zod';
import { defineRealtimeChannel } from '../realtime/realtime-channels.service';

/**
 * A presence status's key (decision 0124): core's are plain (`active`, `inactive`, `away`); plugins' and client
 * libs' are `plugin-<name>:<status>` / `client-<name>:<status>`.
 */
export const presenceStatusKeySchema = z
  .string()
  .max(80)
  .regex(/^([a-z][a-z0-9-]*|(plugin|client)-[a-z0-9-]+:[a-z][a-z0-9-]*)$/, { error: 'Not a presence status key' });

/** A status's detail, e.g. the game in "Playing Trivia Night". */
export const presenceDetailSchema = z.string().trim().min(1).max(60);

/** A user's status now: its key, and the detail a plugin gave it, if any. */
export const userStatusSchema = z.object({ status: presenceStatusKeySchema, detail: presenceDetailSchema.optional() }).strict();

/**
 * `core:user-status/<userId>` (decision 0124): one user's status, live. Subscribers get it at once, then each
 * change. Anyone may subscribe, guests too, to any account's status.
 */
export const userStatusChannel = defineRealtimeChannel({
  namespace: 'core',
  kind: 'user-status',
  params: ['userId'],
  events: { 'status.changed': userStatusSchema },
});
