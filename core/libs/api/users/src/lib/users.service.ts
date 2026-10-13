import { isValidObjectId } from 'mongoose';
import type { ManagedUser, PublicProfile, Role, UpdateProfileRequest, User, UserProfile } from '@inithium/shared-contracts';
import { createProfileAvatar, createProfileBanner, readAvatar, readBanner } from './profiles.service';
import { UserModel, type UserDocument } from './users.model';

// Drawn only if a stored recipe has gone missing or invalid, which backfillUserProfiles() prevents; repeatable, so
// such an account still looks the same on every visit.
const fallbackBanner = (seed: string) => ({
  cellSize: 75,
  variance: 0.75,
  xColors: [
    { color: 'primary', intensity: 200 },
    { color: 'primary', intensity: 500 },
    { color: 'primary', intensity: 800 },
  ],
  seed: seed.slice(0, 64),
}) satisfies UserProfile['banner'];

/** A stored user's profile in the shape the contracts use, with only the names and bio it has. */
function toProfile(doc: UserDocument): UserProfile {
  const id = doc._id.toString();
  const stored = doc.profile;
  return {
    ...(stored?.firstName ? { firstName: stored.firstName } : {}),
    ...(stored?.lastName ? { lastName: stored.lastName } : {}),
    ...(stored?.bio ? { bio: stored.bio } : {}),
    avatar: readAvatar(stored?.avatar) ?? createProfileAvatar(id),
    banner: readBanner(stored?.banner) ?? fallbackBanner(id),
    ...(stored?.avatarAssetId ? { avatarAssetId: stored.avatarAssetId } : {}),
    ...(stored?.bannerAssetId ? { bannerAssetId: stored.bannerAssetId } : {}),
  };
}

/** Maps a stored user to the shape the API returns. Never includes the password hash. */
export function toUser(doc: UserDocument): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    role: doc.role,
    passwordChangeRequired: doc.passwordChangeRequired,
    profile: toProfile(doc),
    createdAt: doc.createdAt.toISOString(),
  };
}

/** An account as the CMS's Users screen shows it (decision 0100). */
export function toManagedUser(doc: UserDocument): ManagedUser {
  const profile = toProfile(doc);
  return {
    id: doc._id.toString(),
    email: doc.email,
    role: doc.role,
    ...(profile.firstName ? { firstName: profile.firstName } : {}),
    ...(profile.lastName ? { lastName: profile.lastName } : {}),
    avatar: profile.avatar,
    ...(profile.avatarAssetId ? { avatarAssetId: profile.avatarAssetId } : {}),
    passwordChangeRequired: doc.passwordChangeRequired,
    ...(doc.createdBy ? { createdBy: doc.createdBy } : {}),
    createdAt: doc.createdAt.toISOString(),
  };
}

/**
 * A page of accounts, newest first (decision 0100). Every word of `search` must appear in the email, first name or
 * last name; `excludeRoles` hides roles the viewer mustn't see (e.g. dev).
 */
export async function listUsers(options: {
  skip: number;
  limit: number;
  search?: string;
  role?: Role;
  excludeRoles?: Role[];
}): Promise<{ users: UserDocument[]; total: number }> {
  const conditions: Record<string, unknown>[] = [];
  if (options.role) conditions.push({ role: options.role });
  if (options.excludeRoles?.length) conditions.push({ role: { $nin: options.excludeRoles } });
  for (const word of options.search?.split(/\s+/).filter(Boolean) ?? []) {
    const pattern = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    conditions.push({ $or: [{ email: pattern }, { 'profile.firstName': pattern }, { 'profile.lastName': pattern }] });
  }
  const query = conditions.length ? { $and: conditions } : {};
  const [users, total] = await Promise.all([
    UserModel.find(query).sort({ createdAt: -1, _id: -1 }).skip(options.skip).limit(options.limit),
    UserModel.countDocuments(query),
  ]);
  return { users, total };
}

export async function findUsersByIds(ids: string[]): Promise<UserDocument[]> {
  return UserModel.find({ _id: { $in: ids.filter((id) => isValidObjectId(id)) } });
}

export async function countUsersWithRole(role: Role): Promise<number> {
  return UserModel.countDocuments({ role });
}

/** Deletes accounts' records. Their other data must be removed first (decision 0100's deletion order). */
export async function deleteUserRecords(ids: string[]): Promise<void> {
  await UserModel.deleteMany({ _id: { $in: ids } });
}

/** A user's public profile (decision 0090): the email only for its owner. */
export function toPublicProfile(doc: UserDocument, { owner }: { owner: boolean }): PublicProfile {
  return {
    id: doc._id.toString(),
    ...toProfile(doc),
    joinedAt: doc.createdAt.toISOString(),
    ...(owner ? { email: doc.email } : {}),
  };
}

export async function findUserById(id: string): Promise<UserDocument | null> {
  if (!isValidObjectId(id)) return null;
  return UserModel.findById(id);
}

/** Includes the password hash, for checking the current password. */
export async function findUserByIdWithPassword(id: string): Promise<UserDocument | null> {
  if (!isValidObjectId(id)) return null;
  return UserModel.findById(id).select('+passwordHash');
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

/** Creates an account, always with a profile: the names given, plus a generated avatar and banner (decision 0090). */
export async function createUser(input: {
  email: string;
  passwordHash: string;
  role: Role;
  passwordChangeRequired?: boolean;
  names?: { firstName: string; lastName?: string };
  /** The account creating this one, when it's made in the CMS. */
  createdBy?: string;
}): Promise<UserDocument> {
  const { names, ...account } = input;
  const user = new UserModel(account);
  user.set('profile', {
    ...names,
    avatar: createProfileAvatar(user._id.toString()),
    banner: createProfileBanner(),
  });
  return user.save();
}

/**
 * Applies a profile edit (decision 0090): fields left out stay as they are, and an empty last name or bio is
 * removed. The request must already have passed `updateProfileRequestSchema`.
 */
export async function updateUserProfile(user: UserDocument, changes: UpdateProfileRequest): Promise<UserDocument> {
  const profile = toProfile(user);
  const next: UserProfile = { ...profile };
  if (changes.firstName !== undefined) next.firstName = changes.firstName;
  for (const key of ['lastName', 'bio'] as const) {
    const value = changes[key];
    if (value === undefined) continue;
    if (value) next[key] = value;
    else delete next[key];
  }
  if (changes.avatar) next.avatar = changes.avatar;
  if (changes.banner) next.banner = changes.banner;
  // Uploaded pictures: an id shows it, null goes back to the generated one. Checking the id is the caller's job.
  for (const key of ['avatarAssetId', 'bannerAssetId'] as const) {
    const value = changes[key];
    if (value === undefined) continue;
    if (value) next[key] = value;
    else delete next[key];
  }
  user.set('profile', next);
  return user.save();
}

/** The accounts whose profile shows an uploaded picture, as their avatar or banner. */
export async function findUsersWithProfileImage(assetId: string): Promise<UserDocument[]> {
  return UserModel.find({ $or: [{ 'profile.avatarAssetId': assetId }, { 'profile.bannerAssetId': assetId }] });
}

/** Stops every profile showing an uploaded picture (e.g. once it's deleted), so they show their generated one. */
export async function clearProfileImage(assetId: string): Promise<void> {
  await UserModel.updateMany({ 'profile.avatarAssetId': assetId }, { $unset: { 'profile.avatarAssetId': 1 } });
  await UserModel.updateMany({ 'profile.bannerAssetId': assetId }, { $unset: { 'profile.bannerAssetId': 1 } });
}

/**
 * Gives every account without a stored avatar or banner its generated ones (decision 0090), so no account is ever
 * without them; accounts created before profiles existed get them on the next startup. Runs on every api start.
 */
export async function backfillUserProfiles(): Promise<void> {
  const missing = await UserModel.find({
    $or: [{ 'profile.avatar': { $exists: false } }, { 'profile.banner': { $exists: false } }],
  });
  for (const user of missing) {
    const stored = user.profile;
    user.set('profile', {
      ...(stored?.firstName ? { firstName: stored.firstName } : {}),
      ...(stored?.lastName ? { lastName: stored.lastName } : {}),
      ...(stored?.bio ? { bio: stored.bio } : {}),
      avatar: readAvatar(stored?.avatar) ?? createProfileAvatar(user._id.toString()),
      banner: readBanner(stored?.banner) ?? createProfileBanner(),
    });
    await user.save();
  }
  if (missing.length > 0) console.log(`[ seed ] gave ${missing.length} account(s) a generated avatar and banner`);
}
