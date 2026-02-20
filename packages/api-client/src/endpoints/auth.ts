import type {
  User,
  LoginCredentials,
  RegisterCredentials,
} from '@inithium/shared';
import { API_ROUTES } from '@inithium/shared';
import { ApiClient } from 'src/lib/client.js';

export function createAuthEndpoints(client: ApiClient) {
  return {
    register: (credentials: RegisterCredentials) =>
      client.post<{ user: User; token: string }>(
        API_ROUTES.AUTH.REGISTER,
        credentials
      ),

    login: (credentials: LoginCredentials) =>
      client.post<{ user: User; token: string }>(
        API_ROUTES.AUTH.LOGIN,
        credentials
      ),

    logout: () => client.post<null>(API_ROUTES.AUTH.LOGOUT, {}),

    me: () => client.get<{ user: User }>(API_ROUTES.AUTH.ME),
  };
}
