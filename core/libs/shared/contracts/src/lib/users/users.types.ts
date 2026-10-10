import type { z } from 'zod';
import type { roleSchema, userProfileSchema, userSchema } from './users.schema';

export type Role = z.infer<typeof roleSchema>;
export type User = z.infer<typeof userSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
