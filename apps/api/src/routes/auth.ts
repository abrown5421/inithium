import { Router, type IRouter } from 'express';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  AUTH_ROUTES,
} from '@inithium/shared';
import * as authController from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

router.post(
  AUTH_ROUTES.REGISTER,
  validateBody(registerSchema),
  authController.register,
);

router.post(AUTH_ROUTES.LOGIN, validateBody(loginSchema), authController.login);

router.post(
  AUTH_ROUTES.REFRESH,
  validateBody(refreshSchema),
  authController.refresh,
);

router.post(AUTH_ROUTES.LOGOUT, authController.logout);

router.get(AUTH_ROUTES.ME, authenticate, authController.getMe);

export { router as authRouter };
