import { model, Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { roles } from '@inithium/shared-contracts';

const usersSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Never returned by queries unless explicitly selected with '+passwordHash'.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: [...roles], required: true, default: 'user' },
    // Set on accounts created with a temporary password (e.g. the seeded dev account).
    passwordChangeRequired: { type: Boolean, required: true, default: false },
    // Profile data, apart from the auth fields above (decisions 0074, 0083). Missing on the seeded dev account.
    profile: {
      type: new Schema({ firstName: { type: String, required: true, trim: true }, lastName: { type: String, trim: true } }, { _id: false }),
      required: false,
    },
  },
  { timestamps: true },
);

export type UserRecord = InferSchemaType<typeof usersSchema>;
export type UserDocument = HydratedDocument<UserRecord>;

export const UserModel = model('User', usersSchema);
