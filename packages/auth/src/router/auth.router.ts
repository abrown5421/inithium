import { Router, type Router as ExpressRouter } from 'express';
import type { MongoClient } from 'mongodb';
import type { AuthConfig } from '../config/auth-config.interface.js';
import { createLoginHandler } from '../handlers/login.handler.js';
import { createLogoutHandler } from '../handlers/logout.handler.js';
import { createRefreshHandler } from '../handlers/refresh.handler.js';
import { createRegisterHandler } from '../handlers/register.handler.js';

export interface AuthRouterOptions {
  client: MongoClient;
  config: AuthConfig;
}

export function createAuthRouter(options: AuthRouterOptions): ExpressRouter {
  const { client, config } = options;

  const router = Router();
  router.post('/login', createLoginHandler(client, config));
  router.post('/register', createRegisterHandler(client, config));
  router.post('/refresh', createRefreshHandler(client, config));
  router.post('/logout', createLogoutHandler(client));

  return router;
}
