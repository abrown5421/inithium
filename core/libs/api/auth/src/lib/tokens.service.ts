import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { loadEnv } from '@inithium/api-config';
import { roleSchema } from '@inithium/shared-contracts';

const accessTokenPayloadSchema = z.object({
  sub: z.string(),
  role: roleSchema,
});

/** What an access token carries: who the user is and their role. Everything else comes from /api/auth/me. */
export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;

export function signAccessToken(user: { id: string; role: AccessTokenPayload['role'] }): string {
  const env = loadEnv();
  return jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    subject: user.id,
    expiresIn: env.JWT_ACCESS_TTL_MINUTES * 60,
  });
}

/** Returns the payload of a valid, unexpired access token, or null. */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, loadEnv().JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
    const parsed = accessTokenPayloadSchema.safeParse(decoded);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
