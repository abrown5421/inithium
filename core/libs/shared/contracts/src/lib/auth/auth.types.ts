import type { z } from 'zod';
import type { authResponseSchema, loginRequestSchema } from './auth.schema';

export type LoginRequest = z.input<typeof loginRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
