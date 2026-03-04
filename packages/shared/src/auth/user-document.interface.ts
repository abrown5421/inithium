import type { ObjectId } from 'mongodb';

import type { UserRole } from './roles.enum.js';

export interface UserDocument {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
