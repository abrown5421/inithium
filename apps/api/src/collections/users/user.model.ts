import mongoose, { Schema, type Model, type Document } from 'mongoose';

/**
 * IUser is the plain TypeScript interface for a user document.
 * It is exported so BaseService<IUser> and BaseController<IUser> are
 * properly typed throughout the collection stack.
 */
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
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

export const UserModel: Model<IUser> = mongoose.model<IUser>(
  'User',
  userSchema,
);
