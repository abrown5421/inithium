import { z } from 'zod';
import { PASSWORD_REQUIREMENTS } from './constants.js';

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .refine((email) => email.includes('@') && email.includes('.'), {
    message: 'Email must contain @ and .',
  });

const passwordSchema = z
  .string()
  .min(
    PASSWORD_REQUIREMENTS.MIN_LENGTH,
    `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`,
  )
  .refine((password) => /[a-zA-Z]/.test(password), {
    message: 'Password must contain at least one letter',
  })
  .refine((password) => /\d/.test(password), {
    message: 'Password must contain at least one number',
  })
  .refine(
    (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    {
      message: 'Password must contain at least one special character',
    },
  );

const firstNameSchema = z
  .string()
  .min(1, 'First name is required')
  .max(50, 'First name must be less than 50 characters')
  .trim();

const lastNameSchema = z
  .string()
  .min(1, 'Last name is required')
  .max(50, 'Last name must be less than 50 characters')
  .trim();

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: firstNameSchema,
  lastName: lastNameSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
