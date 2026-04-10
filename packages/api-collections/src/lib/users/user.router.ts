import { createCollectionRouter } from '@inithium/api-core';
import type { User } from '@inithium/types';
import { usersService } from './user.service.js';

export const usersRouter = createCollectionRouter<User>(
  usersService,
  (router) => {
    router.get('/by-role/:role', async (req, res) => {
      try {
        const role = req.params.role as User['role'];
        const validRoles: User['role'][] = ['super-admin', 'admin', 'editor', 'writer', 'user'];
        
        if (!validRoles.includes(role)) {
          return res.status(400).json({ success: false, error: `Invalid role: ${role}` });
        }

        const users = await usersService.findByRole(role);
        res.json({ success: true, data: users });
      } catch (err: any) {
        res.status(500).json({ success: false, error: err?.message });
      }
    });
  }
);