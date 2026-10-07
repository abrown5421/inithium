import type { z } from 'zod';
import type { roleSchema, userSchema } from './users.schema';

export type Role = z.infer<typeof roleSchema>;
export type User = z.infer<typeof userSchema>;
