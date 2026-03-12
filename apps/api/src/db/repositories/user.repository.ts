import type { User } from '@inithium/shared';
import { UserModel } from '../models/user.model.js';
import type { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).lean();
  }

  async findById(id: string | ObjectId): Promise<User | null> {
    return UserModel.findById(id).lean();
  }

  async create(userData: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role?: 'user' | 'admin';
  }): Promise<User> {
    const user = new UserModel({
      ...userData,
      email: userData.email.toLowerCase(),
    });
    await user.save();
    return user.toObject();
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({
      email: email.toLowerCase(),
    });
    return count > 0;
  }

  async updateById(
    id: string | ObjectId,
    updates: Partial<Omit<User, '_id' | 'createdAt'>>,
  ): Promise<User | null> {
    return UserModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async deleteById(id: string | Types.ObjectId): Promise<boolean> {
    const result = await UserModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

export const userRepository = new UserRepository();
