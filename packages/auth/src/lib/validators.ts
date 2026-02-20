import { isValidEmail, isStrongPassword } from '@inithium/shared';
import type { LoginCredentials, RegisterCredentials } from '@inithium/shared';

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: Record<string, string> };

export function validateLogin(credentials: LoginCredentials): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isValidEmail(credentials.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!credentials.password || credentials.password.length < 1) {
    errors.password = 'Password is required.';
  }

  return Object.keys(errors).length
    ? { valid: false, errors }
    : { valid: true };
}

export function validateRegister(
  credentials: RegisterCredentials
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isValidEmail(credentials.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!isStrongPassword(credentials.password)) {
    errors.password =
      'Password must be at least 8 characters and include uppercase, lowercase, and a number.';
  }
  if (!credentials.displayName || credentials.displayName.trim().length < 2) {
    errors.displayName = 'Display name must be at least 2 characters.';
  }

  return Object.keys(errors).length
    ? { valid: false, errors }
    : { valid: true };
}
