import type { User } from '@inithium/shared';
import { BaseService } from '../../crud/index.js';
import { UserModel } from '../../db/models/user.model.js';

export class UserService extends BaseService<User> {
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).lean();
  }

  async search(query: string): Promise<User[]> {
    const regex = new RegExp(query, 'i');
    return UserModel.find({
      $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
    }).lean();
  }
}

export const userService = new UserService();
