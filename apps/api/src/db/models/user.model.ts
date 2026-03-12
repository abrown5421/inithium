import mongoose, { Schema, type Model } from 'mongoose';
import type { User } from '@inithium/shared';

type UserDocument = User & mongoose.Document;

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 });

export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>(
  'User',
  userSchema,
);
