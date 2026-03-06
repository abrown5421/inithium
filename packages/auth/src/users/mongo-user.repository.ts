import type { MongoClient, ObjectId } from 'mongodb';
import { UserRole, type UserDocument, type UserRepository } from '@inithium/shared';

/**
 * MongoDB implementation of UserRepository.
 *
 * This is the ONLY file in the auth package that knows about MongoClient or
 * ObjectId. All auth handlers receive a UserRepository — they have no
 * knowledge of the underlying DB.
 *
 * When adding a new DB (e.g. Postgres), create a PostgresUserRepository that
 * implements UserRepository and wire it into createAuthRouter. Nothing else changes.
 *
 * Internal helper: maps a raw Mongo document (with _id: ObjectId) to the
 * shared UserDocument shape (with id: string).
 */
type MongoUserDoc = Omit<UserDocument, 'id'> & { _id: ObjectId };

function toUserDocument(doc: MongoUserDoc): UserDocument {
  const { _id, ...rest } = doc;
  return { id: _id.toHexString(), ...rest };
}

export class MongoUserRepository implements UserRepository {
  constructor(private readonly client: MongoClient) {}

  private get collection() {
    return this.client.db().collection<MongoUserDoc>('users');
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    const doc = await this.collection.findOne({ email, isActive: true });
    return doc ? toUserDocument(doc) : null;
  }

  async findById(id: string): Promise<UserDocument | null> {
    const { ObjectId } = await import('mongodb');
    let oid: ObjectId;
    try {
      oid = new ObjectId(id);
    } catch {
      return null;
    }
    const doc = await this.collection.findOne({ _id: oid, isActive: true });
    return doc ? toUserDocument(doc) : null;
  }

  async create(email: string, passwordHash: string, role?: UserRole): Promise<UserDocument> {
    const now = new Date();
    const doc: Omit<MongoUserDoc, '_id'> = {
      email,
      passwordHash,
      role: role ?? UserRole.User,
      isEmailVerified: false,
      isActive: true,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.client
      .db()
      .collection<Omit<MongoUserDoc, '_id'>>('users')
      .insertOne(doc);

    return toUserDocument({ _id: result.insertedId, ...doc });
  }

  async updateLastLogin(id: string): Promise<void> {
    const { ObjectId } = await import('mongodb');
    let oid: ObjectId;
    try {
      oid = new ObjectId(id);
    } catch {
      return;
    }
    const now = new Date();
    await this.collection.updateOne(
      { _id: oid },
      { $set: { lastLoginAt: now, updatedAt: now } },
    );
  }
}
