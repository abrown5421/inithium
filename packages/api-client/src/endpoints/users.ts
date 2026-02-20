import type {
  User,
  PaginatedResponse,
  PaginationParams,
} from '@inithium/shared';
import { API_ROUTES } from '@inithium/shared';
import { ApiClient } from 'src/lib/client.js';

export function createUserEndpoints(client: ApiClient) {
  return {
    list: (params?: PaginationParams) => {
      const qs = params
        ? `?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`
        : '';
      return client.get<PaginatedResponse<User>>(
        `${API_ROUTES.USERS.BASE}${qs}`
      );
    },

    getById: (id: string) => client.get<User>(API_ROUTES.USERS.BY_ID(id)),

    update: (id: string, data: Partial<Pick<User, 'displayName'>>) =>
      client.patch<User>(API_ROUTES.USERS.BY_ID(id), data),

    delete: (id: string) => client.delete<null>(API_ROUTES.USERS.BY_ID(id)),
  };
}
