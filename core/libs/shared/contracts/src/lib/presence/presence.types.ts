import type { z } from 'zod';
import type { userStatusSchema } from './presence.schema';

export type UserStatus = z.infer<typeof userStatusSchema>;
