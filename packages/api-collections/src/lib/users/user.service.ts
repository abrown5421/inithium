import { BaseService } from '@inithium/api-core';
import type { User } from '@inithium/types';
import { UserModel } from './user.model.js';

export class UserService extends BaseService<User> {
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.model
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .lean<User>()
      .exec();
  }

  async findByRole(role: User['role']): Promise<User[]> {
    const result = await this.readMany({ role } as any);
    return result.items;
  }
}

export const usersService = new UserService();