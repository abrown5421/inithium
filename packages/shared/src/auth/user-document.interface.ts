import type { UserRole } from './roles.enum.js';

/**
 * Empty extension interface for à la carte feature packages.
 *
 * Feature packages (e.g. @inithium/social, @inithium/blog) augment this via
 * declaration merging so they can attach fields to UserDocument without
 * touching core auth code or creating conflicts between packages.
 *
 * Example (inside @inithium/social):
 *
 *   declare module '@inithium/shared' {
 *     interface UserDocumentExtensions {
 *       friendIds?: string[];
 *     }
 *   }
 */
export interface UserDocumentExtensions {}

export interface UserDocument extends UserDocumentExtensions {
  /**
   * DB-agnostic string ID. Always a hex string representation of the
   * underlying DB identifier (e.g. ObjectId.toHexString() in Mongo).
   *
   * Handlers and JWT payloads should use this field. The raw ObjectId
   * lives only inside the MongoDB repository layer.
   */
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
