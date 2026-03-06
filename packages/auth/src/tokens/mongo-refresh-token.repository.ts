import type { MongoClient, ObjectId } from 'mongodb';
import type { RefreshTokenDocument, RefreshTokenRepository } from '@inithium/shared';

/**
 * MongoDB implementation of RefreshTokenRepository.
 *
 * Same boundary rule as MongoUserRepository: ObjectId lives only here.
 * All auth handlers receive a RefreshTokenRepository.
 */
type MongoTokenDoc = Omit<RefreshTokenDocument, 'id' | 'userId'> & {
  _id: ObjectId;
  userId: ObjectId;
};

function toRefreshTokenDocument(doc: MongoTokenDoc): RefreshTokenDocument {
  const { _id, userId, ...rest } = doc;
  return { id: _id.toHexString(), userId: userId.toHexString(), ...rest };
}

export class MongoRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly client: MongoClient) {}

  private get collection() {
    return this.client.db().collection<MongoTokenDoc>('refresh_tokens');
  }

  async store(doc: Omit<RefreshTokenDocument, 'id'>): Promise<void> {
    const { ObjectId } = await import('mongodb');
    await this.collection.insertOne({
      userId: new ObjectId(doc.userId),
      tokenHash: doc.tokenHash,
      family: doc.family,
      isRevoked: doc.isRevoked,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
    } as Omit<MongoTokenDoc, '_id'>);
  }

  async findLatestByFamily(family: string): Promise<RefreshTokenDocument | null> {
    const doc = await this.collection.findOne(
      { family, isRevoked: false, expiresAt: { $gt: new Date() } },
      { sort: { createdAt: -1 } },
    );
    return doc ? toRefreshTokenDocument(doc) : null;
  }

  async findAnyByFamily(family: string): Promise<RefreshTokenDocument | null> {
    const doc = await this.collection.findOne(
      { family },
      { sort: { createdAt: -1 } },
    );
    return doc ? toRefreshTokenDocument(doc) : null;
  }

  async findValidByUserId(userId: string, limit = 25): Promise<RefreshTokenDocument[]> {
    const { ObjectId } = await import('mongodb');
    let oid: ObjectId;
    try {
      oid = new ObjectId(userId);
    } catch {
      return [];
    }
    const docs = await this.collection
      .find(
        { userId: oid, isRevoked: false, expiresAt: { $gt: new Date() } },
        { sort: { createdAt: -1 }, limit },
      )
      .toArray();
    return docs.map(toRefreshTokenDocument);
  }

  async revokeById(id: string): Promise<void> {
    const { ObjectId } = await import('mongodb');
    let oid: ObjectId;
    try {
      oid = new ObjectId(id);
    } catch {
      return;
    }
    await this.collection.updateOne({ _id: oid }, { $set: { isRevoked: true } });
  }

  async revokeFamily(family: string): Promise<void> {
    await this.collection.updateMany({ family }, { $set: { isRevoked: true } });
  }

  async deleteExpired(): Promise<void> {
    await this.collection.deleteMany({ expiresAt: { $lt: new Date() } });
  }
}
