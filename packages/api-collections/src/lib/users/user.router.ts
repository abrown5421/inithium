import { Router } from 'express';
import { createCollectionRouter } from '@inithium/api-core';
import { validate, userValidators } from '@inithium/validators';
import type { User } from '@inithium/types';
import { usersService } from './user.service.js';

const extendRouter = (router: Router): void => {
  router.get(
    '/by-role/:role',
    validate(userValidators.byRole),
    async (req, res, next) => {
      try {
        const role = req.params.role as User['role'];
        const users = await usersService.findByRole(role);
        res.json({ success: true, data: users });
      } catch (err) {
        next(err);
      }
    }
  );
};

export const usersRouter = createCollectionRouter<User>(
  usersService,
  userValidators,
  extendRouter
);
