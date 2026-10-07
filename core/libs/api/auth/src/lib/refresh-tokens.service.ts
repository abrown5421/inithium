import { createHash, randomBytes } from 'node:crypto';
import { loadEnv } from '@inithium/api-config';
import { RefreshTokenModel } from './refresh-tokens.model';

// A revoked token presented again within this window is treated as a race between
// two requests (e.g. two tabs refreshing at once), not as theft.
const REUSE_GRACE_MS = 10_000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Creates a refresh token for the user and returns the raw value for the cookie. */
export async function issueRefreshToken(userId: string): Promise<string> {
  const token = randomBytes(48).toString('base64url');
  const ttlMs = loadEnv().JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;
  await RefreshTokenModel.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + ttlMs),
  });
  return token;
}

/**
 * Exchanges a refresh token for a new one. Returns null if the token is unknown, expired or revoked.
 * Presenting an already-rotated token after the grace window revokes every session the user has,
 * because it means the old token was copied.
 */
export async function rotateRefreshToken(token: string): Promise<{ userId: string; token: string } | null> {
  const now = new Date();
  const record = await RefreshTokenModel.findOneAndUpdate(
    { tokenHash: hashToken(token), revokedAt: null, expiresAt: { $gt: now } },
    { revokedAt: now },
  );

  if (!record) {
    const reused = await RefreshTokenModel.findOne({ tokenHash: hashToken(token) });
    if (reused?.revokedAt && now.getTime() - reused.revokedAt.getTime() > REUSE_GRACE_MS) {
      await revokeAllRefreshTokens(reused.userId.toString());
    }
    return null;
  }

  const userId = record.userId.toString();
  return { userId, token: await issueRefreshToken(userId) };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await RefreshTokenModel.updateOne({ tokenHash: hashToken(token), revokedAt: null }, { revokedAt: new Date() });
}

export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  await RefreshTokenModel.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() });
}
