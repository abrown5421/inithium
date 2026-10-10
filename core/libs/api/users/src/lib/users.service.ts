import { isValidObjectId } from 'mongoose';
import type { Role, User, UserProfile } from '@inithium/shared-contracts';
import { UserModel, type UserDocument } from './users.model';

/** Maps a stored user to the shape the API returns. Never includes the password hash. */
export function toUser(doc: UserDocument): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    role: doc.role,
    passwordChangeRequired: doc.passwordChangeRequired,
    ...(doc.profile
      ? { profile: { firstName: doc.profile.firstName, ...(doc.profile.lastName ? { lastName: doc.profile.lastName } : {}) } }
      : {}),
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function findUserById(id: string): Promise<UserDocument | null> {
  if (!isValidObjectId(id)) return null;
  return UserModel.findById(id);
}

/** Includes the password hash, for verifying a login. */
export async function findUserByEmailWithPassword(email: string): Promise<UserDocument | null> {
  return UserModel.findOne({ email: email.toLowerCase() }).select('+passwordHash');
}

export async function userExistsWithEmail(email: string): Promise<boolean> {
  return (await UserModel.exists({ email: email.toLowerCase() })) !== null;
}

export async function userExistsWithRole(role: Role): Promise<boolean> {
  return (await UserModel.exists({ role })) !== null;
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  role: Role;
  passwordChangeRequired?: boolean;
  profile?: UserProfile;
}): Promise<UserDocument> {
  return UserModel.create(input);
}
