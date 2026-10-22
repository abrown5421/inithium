import type { z } from 'zod';
import type {
  presenceActivitySchema,
  presenceMemberSchema,
  realtimeAckSchema,
  realtimeErrorCodeSchema,
  realtimeEventSchema,
  realtimePresenceSchema,
} from './realtime.schema';

export type PresenceActivity = z.infer<typeof presenceActivitySchema>;
export type PresenceMember = z.infer<typeof presenceMemberSchema>;
export type RealtimeAck = z.infer<typeof realtimeAckSchema>;
export type RealtimeErrorCode = z.infer<typeof realtimeErrorCodeSchema>;
export type RealtimeEvent = z.infer<typeof realtimeEventSchema>;
export type RealtimePresence = z.infer<typeof realtimePresenceSchema>;
