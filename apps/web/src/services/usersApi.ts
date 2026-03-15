import type { UserResponse, RegisterRequest } from '@inithium/shared';
import { createCrudApi } from './crudApi.factory';

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  role?: 'user' | 'admin';
}

export const usersApi = createCrudApi<UserResponse, RegisterRequest, UpdateUserDTO>({
  reducerPath: 'usersApi',
  collectionPath: '/api/users',
  tagType: 'User',
  extraEndpoints: (builder) => ({
    searchUsers: builder.query<UserResponse[], string>({
      query: (q) => `/api/users/search?q=${encodeURIComponent(q)}`,
      providesTags: [{ type: 'User', id: 'SEARCH' }],
    }),
  }),
});

export const {
  useGetAllQuery:    useGetUsersQuery,
  useGetByIdQuery:   useGetUserByIdQuery,
  useCreateMutation: useCreateUserMutation,
  useUpdateMutation: useUpdateUserMutation,
  useRemoveMutation: useRemoveUserMutation,
  useSearchUsersQuery,
} = usersApi;
