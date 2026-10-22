import { loadEnv } from '@inithium/api-config';
import { RefreshTokenModel } from './refresh-tokens.model';
import { revokeAllRefreshTokens } from './refresh-tokens.service';

// When each account's sessions were last revoked, in seconds. Access tokens issued before then are refused, so a role
// change or deletion applies at once instead of when the 15-minute token expires. Kept in memory: entries are only
// needed for one access-token lifetime, and the api runs as one process (a restart reopens that short window).
const revokedAt = new Map<string, number>();

/** Told when accounts' sessions end, e.g. so their realtime connections close too (decision 0121). */
export type SessionsRevokedListener = (userIds: string[]) => void;
const revokedListeners = new Set<SessionsRevokedListener>();

/** Calls the listener whenever accounts are signed out everywhere; returns a function that stops it. */
export function onSessionsRevoked(listener: SessionsRevokedListener): () => void {
  revokedListeners.add(listener);
  return () => revokedListeners.delete(listener);
}

function announceRevoked(userIds: string[]): void {
  for (const listener of revokedListeners) listener(userIds);
}

/**
 * Signs an account out everywhere, at once (decision 0100): revokes its refresh tokens and refuses its current
 * access tokens. Its next request gets 401 and, with no refresh token left, it's signed out.
 */
export async function revokeSessions(userId: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  revokedAt.set(userId, now);
  // Forget entries older than any access token still in use.
  const oldest = now - loadEnv().JWT_ACCESS_TTL_MINUTES * 60;
  for (const [id, at] of revokedAt) if (at < oldest) revokedAt.delete(id);
  announceRevoked([userId]);
  await revokeAllRefreshTokens(userId);
}

/** Ends deleted accounts' sessions (decision 0100): refuses their access tokens and removes their refresh tokens. */
export async function endSessionsOfDeletedUsers(userIds: string[]): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  for (const id of userIds) revokedAt.set(id, now);
  announceRevoked(userIds);
  await RefreshTokenModel.deleteMany({ userId: { $in: userIds } });
}

/**
 * Whether an access token for this account, issued at `iat` (seconds), was revoked. Tokens from the same second as
 * the revocation count as revoked too, since `iat` can't say which came first; a sign-in in that same second simply
 * has to sign in again.
 */
export function isSessionRevoked(userId: string, iat: number | undefined): boolean {
  const at = revokedAt.get(userId);
  return at !== undefined && (iat === undefined || iat <= at);
}
