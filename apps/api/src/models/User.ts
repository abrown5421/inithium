import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@inithium/shared';

export interface IUserDocument extends Document {
  email: string;
  displayName: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['admin', 'member', 'guest'],
      default: 'member',
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.set('toJSON', {
  transform(_, ret) {
    delete (ret as unknown as Record<string, unknown>).password;
    return ret;
  },
});

export const User = model<IUserDocument>('User', UserSchema);
