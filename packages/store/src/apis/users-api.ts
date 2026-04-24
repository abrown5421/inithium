import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store.js';
import type { ApiResponse, User } from '@inithium/types';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
    credentials: 'include',
    prepareHeaders(headers, { getState }) {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getMe: builder.query<User, string>({
      query: (userId) => `/users/${userId}`,
      transformResponse: (raw: ApiResponse<User>): User => raw.data!,
      providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }],
    }),

    updateMe: builder.mutation<
      User,
      {
        userId: string;
        patch: Partial<
          Omit<User, '_id' | 'email' | 'role' | 'createdAt' | 'updatedAt'>
        >;
      }
    >({
      query: ({ userId, patch }) => ({
        url: `/users/${userId}`,
        method: 'PATCH',
        body: patch,
      }),
      transformResponse: (raw: ApiResponse<User>): User => raw.data!,
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'User', id: userId },
      ],
    }),
  }),
});

export const { useGetMeQuery, useUpdateMeMutation } = usersApi;