import type { MongoClient, ObjectId } from 'mongodb';
import type { RefreshTokenDocument } from '@inithium/shared';
import bcrypt from 'bcrypt';

export async function hashRefreshToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export async function storeRefreshToken(
  client: MongoClient,
  doc: Omit<RefreshTokenDocument, '_id'>,
): Promise<void> {
  await client.db().collection<Omit<RefreshTokenDocument, '_id'>>('refresh_tokens').insertOne(doc);
}

export async function findRefreshTokenByFamily(
  client: MongoClient,
  family: string,
): Promise<RefreshTokenDocument | null> {
  return client
    .db()
    .collection<RefreshTokenDocument>('refresh_tokens')
    .findOne({
      family,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }, { sort: { createdAt: -1 } });
}

export async function revokeTokenFamily(client: MongoClient, family: string): Promise<void> {
  await client
    .db()
    .collection<RefreshTokenDocument>('refresh_tokens')
    .updateMany({ family }, { $set: { isRevoked: true } });
}

export async function revokeTokenById(client: MongoClient, id: ObjectId): Promise<void> {
  await client
    .db()
    .collection<RefreshTokenDocument>('refresh_tokens')
    .updateOne({ _id: id }, { $set: { isRevoked: true } });
}

export async function deleteExpiredTokens(client: MongoClient): Promise<void> {
  await client
    .db()
    .collection<RefreshTokenDocument>('refresh_tokens')
    .deleteMany({ expiresAt: { $lt: new Date() } });
}
