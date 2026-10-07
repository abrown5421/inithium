import { z } from 'zod';
import { userSchema } from '../users/users.schema';

export const loginRequestSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email({ error: 'Enter a valid email address' })),
  password: z.string().min(1, { error: 'Enter your password' }),
});

/** Returned by login, refresh and me. */
export const authResponseSchema = z.object({
  user: userSchema,
});
