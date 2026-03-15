import type { Request, Response, NextFunction } from 'express';
import type { User } from '@inithium/shared';
import { BaseController } from '../../crud/index.js';
import { userService, type UserService } from './user.service.js';

export class UserController extends BaseController<User> {
  protected declare service: UserService;

  constructor() {
    super(userService);
    this.service = userService;
    this.search = this.search.bind(this);
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = String(req.query['q'] ?? '');
      if (!q.trim()) {
        res.status(400).json({ status: 'error', message: 'Query param "q" is required' });
        return;
      }
      const results = await this.service.search(q);
      res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
