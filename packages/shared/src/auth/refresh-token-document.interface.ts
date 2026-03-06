/**
 * DB-agnostic refresh token document.
 *
 * All IDs are strings here. The MongoDB repository layer is responsible
 * for converting ObjectId <-> string at the boundary.
 */
export interface RefreshTokenDocument {
  id: string;
  userId: string;
  tokenHash: string;
  family: string; // UUID — used for rotation theft detection
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}
