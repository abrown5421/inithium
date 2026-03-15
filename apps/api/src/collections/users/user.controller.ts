import type { Request, Response, NextFunction } from 'express';
import type { User } from '@inithium/shared';
import { BaseController } from '../../crud/index.js';
import { userService, type UserService } from './user.service.js';

/**
 * UserController extends BaseController<User> to inherit all five CRUD
 * handlers and adds user-specific handlers (search, login).
 */
export class UserController extends BaseController<User> {
  protected declare service: UserService;

  constructor() {
    super(userService);
    this.service = userService;
    this.search = this.search.bind(this);
    this.login  = this.login.bind(this);
  }

  /**
   * GET /api/users/search?q=<term>
   * Partial, case-insensitive match on firstName, lastName, or email.
   */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = String(req.query['q'] ?? '');
      if (!q.trim()) {
        res
          .status(400)
          .json({ status: 'error', message: 'Query param "q" is required' });
        return;
      }
      const results = await this.service.search(q);
      res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/users/login
   * Body: { email, password }
   * Returns the sanitized user (no passwordHash).
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };
      const user = await this.service.validateCredentials(email, password);
      res.status(200).json(this.service.sanitize(user));
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
