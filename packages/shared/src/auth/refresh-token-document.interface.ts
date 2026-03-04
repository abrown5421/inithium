import type { ObjectId } from 'mongodb';

export interface RefreshTokenDocument {
  _id: ObjectId;
  userId: ObjectId;
  tokenHash: string;
  family: string; // UUID - used for rotation theft detection
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}
