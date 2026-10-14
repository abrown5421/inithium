import { model, Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { roles } from '@inithium/shared-contracts';

// Profile data, apart from the auth fields (decisions 0074, 0083, 0090). The avatar and banner are recipes, validated
// by their Zod schemas in the service before they're stored.
const profileSchema = new Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    // Rich text (decision 0102), validated by bioSchema before it's stored; plain-text bios from before are read as one paragraph.
    bio: { type: Schema.Types.Mixed },
    avatar: { type: Schema.Types.Mixed },
    banner: { type: Schema.Types.Mixed },
    // Uploaded pictures shown instead of the generated ones, which stay as their fallbacks (decision 0098).
    avatarAssetId: { type: String },
    bannerAssetId: { type: String },
  },
  { _id: false },
);

const usersSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Never returned by queries unless explicitly selected with '+passwordHash'.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: [...roles], required: true, default: 'user' },
    // Set on accounts created with a temporary password (e.g. the seeded dev account).
    passwordChangeRequired: { type: Boolean, required: true, default: false },
    // Every account gets one, with a generated avatar and banner, when it's created (decision 0090).
    profile: { type: profileSchema, required: false },
    // The account that created this one in the CMS (decision 0100); missing for sign-ups and the seeded dev account.
    createdBy: { type: String },
  },
  { timestamps: true },
);

export type UserRecord = InferSchemaType<typeof usersSchema>;
export type UserDocument = HydratedDocument<UserRecord>;

export const UserModel = model('User', usersSchema);
