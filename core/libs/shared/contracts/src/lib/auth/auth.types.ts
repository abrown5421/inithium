import type { z } from 'zod';
import type { authResponseSchema, loginRequestSchema, registerRequestSchema } from './auth.schema';

export type LoginRequest = z.input<typeof loginRequestSchema>;
export type RegisterRequest = z.input<typeof registerRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
