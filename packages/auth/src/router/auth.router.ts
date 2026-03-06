import { Router, type Router as ExpressRouter } from 'express';
import type { MongoClient } from 'mongodb';
import type { UserRepository, RefreshTokenRepository } from '@inithium/shared';
import type { AuthConfig } from '../config/auth-config.interface.js';
import { createLoginHandler } from '../handlers/login.handler.js';
import { createLogoutHandler } from '../handlers/logout.handler.js';
import { createRefreshHandler } from '../handlers/refresh.handler.js';
import { createRegisterHandler } from '../handlers/register.handler.js';
import { MongoUserRepository } from '../users/mongo-user.repository.js';
import { MongoRefreshTokenRepository } from '../tokens/mongo-refresh-token.repository.js';

/**
 * Options for createAuthRouter.
 *
 * You can pass a MongoClient (current default) and the router will
 * instantiate the Mongo repository implementations for you. Alternatively,
 * pass explicit repository instances to use a different DB — MongoClient
 * is ignored in that case.
 *
 * This is the only place in the codebase that knows about both the
 * concrete repositories AND the MongoClient. Handlers never see either.
 */
export interface AuthRouterOptions {
  client: MongoClient;
  config: AuthConfig;
  /**
   * Optional: provide your own repository implementations.
   * Useful for non-Mongo DBs or testing with mocks.
   * When omitted, Mongo implementations are used automatically.
   */
  repositories?: {
    users: UserRepository;
    tokens: RefreshTokenRepository;
  };
}

export function createAuthRouter(options: AuthRouterOptions): ExpressRouter {
  const { client, config } = options;

  const users = options.repositories?.users ?? new MongoUserRepository(client);
  const tokens = options.repositories?.tokens ?? new MongoRefreshTokenRepository(client);

  const router = Router();
  router.post('/login', createLoginHandler(users, tokens, config));
  router.post('/register', createRegisterHandler(users, tokens, config));
  router.post('/refresh', createRefreshHandler(users, tokens, config));
  router.post('/logout', createLogoutHandler(tokens));

  return router;
}
