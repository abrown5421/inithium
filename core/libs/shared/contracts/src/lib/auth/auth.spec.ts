import { describe, expect, it } from 'vitest';
import { emailSchema, loginRequestSchema, newPasswordSchema, registerRequestSchema } from './auth.schema';

describe('emailSchema', () => {
  it('trims and lowercases addresses', () => {
    expect(emailSchema.parse('  Name@Example.COM ')).toBe('name@example.com');
  });

  it.each(['', 'name', 'name@example', 'name @example.com', '@example.com'])('rejects %j', (email) => {
    expect(emailSchema.safeParse(email).success).toBe(false);
  });
});

describe('newPasswordSchema (decision 0024)', () => {
  it('accepts a password meeting every rule', () => {
    expect(newPasswordSchema.safeParse('Abcdefgh1!').success).toBe(true);
  });

  it.each([
    ['too short', 'Abcdef1!', 'Use at least 10 characters'],
    ['no lowercase', 'ABCDEFGH1!', 'Include a lowercase letter'],
    ['no uppercase', 'abcdefgh1!', 'Include an uppercase letter'],
    ['no number', 'Abcdefghi!', 'Include a number'],
    ['no special character', 'Abcdefghi1', 'Include a special character, such as ! or #'],
  ])('rejects a password with %s, saying why', (_case, password, message) => {
    const result = newPasswordSchema.safeParse(password);
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toContain(message);
  });
});

describe('sign-in and sign-up requests', () => {
  it('only needs a non-empty password to sign in, since old passwords may predate the policy', () => {
    expect(loginRequestSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
    expect(loginRequestSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
  });

  it('applies the policy to sign-ups and refuses unknown fields', () => {
    const valid = { firstName: 'Ada', email: 'ada@example.com', password: 'Abcdefgh1!' };
    expect(registerRequestSchema.safeParse(valid).success).toBe(true);
    expect(registerRequestSchema.safeParse({ ...valid, password: 'weak' }).success).toBe(false);
    expect(registerRequestSchema.safeParse({ ...valid, role: 'owner' }).success).toBe(false);
  });
});
