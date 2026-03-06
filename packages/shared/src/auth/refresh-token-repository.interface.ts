import type { RefreshTokenDocument } from './refresh-token-document.interface.js';

/**
 * DB-agnostic contract that the auth package requires for refresh token
 * persistence.
 *
 * The concrete implementation (e.g. MongoRefreshTokenRepository) lives in
 * the auth package. Swap the implementation for a different DB without
 * touching any auth handler logic.
 */
export interface RefreshTokenRepository {
  store(doc: Omit<RefreshTokenDocument, 'id'>): Promise<void>;

  /**
   * Find the most recent non-revoked, non-expired token for a given family.
   * Returns null if none exists.
   */
  findLatestByFamily(family: string): Promise<RefreshTokenDocument | null>;

  /**
   * Find any token (including revoked) for a given family, most recent first.
   * Used for reuse detection — we need to see revoked tokens too.
   */
  findAnyByFamily(family: string): Promise<RefreshTokenDocument | null>;

  /**
   * Find valid (non-revoked, non-expired) tokens for a user.
   * Used as fallback when no rtFamily claim is present in the JWT.
   */
  findValidByUserId(userId: string, limit?: number): Promise<RefreshTokenDocument[]>;

  revokeById(id: string): Promise<void>;
  revokeFamily(family: string): Promise<void>;
  deleteExpired(): Promise<void>;
}
