import type { UserRole } from './roles.enum.js';
import type { UserDocument } from './user-document.interface.js';

/**
 * DB-agnostic contract that the auth package requires for user persistence.
 *
 * The concrete implementation (e.g. MongoUserRepository) lives in the auth
 * package and accepts a MongoClient. When you need to support a different DB,
 * create a new class that satisfies this interface — no auth logic changes.
 *
 * Feature packages that need to query users should extend this interface
 * or define their own repository interface that composes with this one.
 */
export interface UserRepository {
  findByEmail(email: string): Promise<UserDocument | null>;
  findById(id: string): Promise<UserDocument | null>;
  create(email: string, passwordHash: string, role?: UserRole): Promise<UserDocument>;
  updateLastLogin(id: string): Promise<void>;
}
