import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  AuthResponse,
  UserResponse,
  RegisterRequest,
  LoginRequest,
  RefreshRequest,
} from '@inithium/shared';
import { AUTH_ROUTES } from '@inithium/shared';
import type { RootState } from '../store/store';

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: AUTH_ROUTES.REGISTER,
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: AUTH_ROUTES.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    refresh: builder.mutation<
      { accessToken: string; refreshToken: string },
      RefreshRequest
    >({
      query: (body) => ({
        url: AUTH_ROUTES.REFRESH,
        method: 'POST',
        body,
      }),
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: AUTH_ROUTES.LOGOUT,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    getMe: builder.query<UserResponse, void>({
      query: () => AUTH_ROUTES.ME,
      providesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi;
