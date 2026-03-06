export { createAuthRouter } from './router/auth.router.js';
export type { AuthRouterOptions } from './router/auth.router.js';

export { createAuthenticateMiddleware } from './middleware/authenticate.middleware.js';
export { authorize } from './middleware/authorize.middleware.js';

export type { AuthConfig } from './config/auth-config.interface.js';

// Concrete MongoDB repository implementations.
// Import these when wiring up an app that uses MongoDB.
// For other databases, implement UserRepository / RefreshTokenRepository
// from @inithium/shared and pass them via AuthRouterOptions.repositories.
export { MongoUserRepository } from './users/mongo-user.repository.js';
export { MongoRefreshTokenRepository } from './tokens/mongo-refresh-token.repository.js';
