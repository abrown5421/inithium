import { createAuthEndpoints } from '../endpoints/auth.js';
import { createUserEndpoints } from '../endpoints/users.js';
import { ApiClient } from './client.js';

export function createApiClient(baseUrl: string) {
  const client = new ApiClient(baseUrl);

  return {
    auth: createAuthEndpoints(client),
    users: createUserEndpoints(client),
    _client: client,
  };
}

export type InithiumApiClient = ReturnType<typeof createApiClient>;
