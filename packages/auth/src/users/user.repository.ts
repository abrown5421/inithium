import type { MongoClient, ObjectId } from 'mongodb';
import { UserRole, type UserDocument } from '@inithium/shared';

export async function findUserByEmail(client: MongoClient, email: string): Promise<UserDocument | null> {
  return client
    .db()
    .collection<UserDocument>('users')
    .findOne({ email, isActive: true });
}

export async function findUserById(client: MongoClient, id: ObjectId): Promise<UserDocument | null> {
  return client
    .db()
    .collection<UserDocument>('users')
    .findOne({ _id: id, isActive: true });
}

export async function createUser(
  client: MongoClient,
  email: string,
  passwordHash: string,
  role?: UserRole,
): Promise<UserDocument> {
  const now = new Date();
  const doc: Omit<UserDocument, '_id'> = {
    email,
    passwordHash,
    role: role ?? UserRole.User,
    isEmailVerified: false,
    isActive: true,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const result = await client.db().collection<Omit<UserDocument, '_id'>>('users').insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function updateLastLogin(client: MongoClient, id: ObjectId): Promise<void> {
  const now = new Date();
  await client
    .db()
    .collection<UserDocument>('users')
    .updateOne({ _id: id }, { $set: { lastLoginAt: now, updatedAt: now } });
}
