import type { User } from '@inithium/shared';
import { AUTH_ERRORS } from '@inithium/shared';
import { BaseService } from '../../crud/index.js';
import { UserModel } from '../../db/models/user.model.js';
import { ConflictError, UnauthorizedError } from '../../errors/index.js';
import { passwordService } from '../../services/password.service.js';

/**
 * UserService extends BaseService<User> using the existing UserModel and the
 * shared User interface from @inithium/shared.
 *
 * No model or schema is defined here — we reuse db/models/user.model.ts
 * exactly as the auth system does, so there is only ever one Mongoose model
 * registration for the 'User' collection.
 */
export class UserService extends BaseService<User> {
  constructor() {
    super(UserModel);
  }

  // ─── Collection-specific operations ────────────────────────────────────────

  /** Find a user by email address (case-insensitive). */
  async findByEmail(email: string): Promise<User | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).lean();
  }

  /** Partial, case-insensitive search across firstName, lastName, and email. */
  async search(query: string): Promise<User[]> {
    const regex = new RegExp(query, 'i');
    return UserModel.find({
      $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
    }).lean();
  }

  /**
   * Validate email + password credentials.
   * Throws UnauthorizedError on any mismatch (intentionally generic message).
   */
  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError(AUTH_ERRORS.INVALID_CREDENTIALS);
    }
    const valid = await passwordService.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError(AUTH_ERRORS.INVALID_CREDENTIALS);
    }
    return user;
  }

  /** Register a new user with a hashed password, rejecting duplicate emails. */
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    const exists = await this.findByEmail(data.email);
    if (exists) throw new ConflictError(AUTH_ERRORS.USER_EXISTS);

    const passwordHash = await passwordService.hash(data.password);
    const doc = new UserModel({
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'user',
    });
    await doc.save();
    return doc.toObject();
  }

  /** Strip passwordHash before sending a user object to the client. */
  sanitize(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash: _pw, ...safe } = user;
    return safe;
  }
}

export const userService = new UserService();
