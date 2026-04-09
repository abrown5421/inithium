import mongoose, { Schema } from 'mongoose';
import type { User } from '@inithium/types';

const UserSchema = new Schema<User>(
  {
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:    { type: String, required: true, select: false },
    first_name:  { type: String, required: true, trim: true },
    last_name:   { type: String, required: true, trim: true },
    role: {
      type:    String,
      enum:    ['super-admin', 'admin', 'editor', 'writer', 'user'],
      default: 'user',
    },
    user_banner: { type: Schema.Types.Mixed },
    user_avatar: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<User>('User', UserSchema);
