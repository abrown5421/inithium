import { createBaseApi } from './base-api-factory.js';
import type { ApiResponse, User } from '@inithium/types';

export const usersApi = createBaseApi<User>('usersApi', 'User', '/users');

export const extendedUsersApi = usersApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<User, string>({
      query: (userId) => `/${userId}`,
      transformResponse: (raw: ApiResponse<User>): User => raw.data!,
      providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }],
    }),
    updateMe: builder.mutation<
      User,
      {
        userId: string;
        patch: Partial<Omit<User, '_id' | 'email' | 'role' | 'createdAt' | 'updatedAt'>>;
      }
    >({
      query: ({ userId, patch }) => ({
        url: `/${userId}`,
        method: 'PATCH',
        body: patch,
      }),
      transformResponse: (raw: ApiResponse<User>): User => raw.data!,
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'User', id: userId }],
    }),
  }),
});

export const { 
  useCreateOneMutation,
  useCreateManyMutation,
  useReadOneQuery,
  useReadManyQuery,
  useUpdateOneMutation,
  useUpdateManyMutation,
  useDeleteOneMutation,
  useDeleteManyMutation,
  useGetMeQuery, 
  useUpdateMeMutation 
} = extendedUsersApi;