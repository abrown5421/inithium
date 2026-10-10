import { z } from 'zod';
import { userSchema } from '../users/users.schema';

/** An email address: no spaces, an @, and a dot after it, e.g. name@example.com. Stored lowercased. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { error: 'Enter your email address' })
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { error: 'Enter an email address like name@example.com' });

/** The password policy for passwords people choose (decision 0024). */
export const passwordPolicy = { minLength: 10 } as const;

/** A new password: 10+ characters with a lowercase and an uppercase letter, a number and a special character. */
export const newPasswordSchema = z
  .string()
  .min(1, { error: 'Enter a password' })
  .min(passwordPolicy.minLength, { error: `Use at least ${passwordPolicy.minLength} characters` })
  .regex(/[a-z]/, { error: 'Include a lowercase letter' })
  .regex(/[A-Z]/, { error: 'Include an uppercase letter' })
  .regex(/[0-9]/, { error: 'Include a number' })
  .regex(/[^A-Za-z0-9]/, { error: 'Include a special character, such as ! or #' });

/** The policy in one sentence, for helper text. */
export const passwordPolicyHint = 'At least 10 characters, with an uppercase and a lowercase letter, a number and a special character.';

export const loginRequestSchema = z.object({
  email: emailSchema,
  // Existing passwords may predate the policy, so signing in only needs one.
  password: z.string().min(1, { error: 'Enter your password' }),
});

/** Creating a `user` account (decision 0083). The confirmation field is checked in the form, not sent. */
export const registerRequestSchema = z
  .object({
    firstName: z.string().trim().min(1, { error: 'Enter your first name' }).max(50, { error: 'Use 50 characters or fewer' }),
    lastName: z.string().trim().max(50, { error: 'Use 50 characters or fewer' }).optional(),
    email: emailSchema,
    password: newPasswordSchema,
  })
  .strict();

/** Returned by login, register, refresh and me. */
export const authResponseSchema = z.object({
  user: userSchema,
});
