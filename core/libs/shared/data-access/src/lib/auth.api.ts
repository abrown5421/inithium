import { authResponseSchema, type LoginRequest, type RegisterRequest, type User } from '@inithium/shared-contracts';
import { baseApi } from './base.api';

const toUser = (response: unknown): User => authResponseSchema.parse(response).user;

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCurrentUser: build.query<User, void>({
      query: () => '/auth/me',
      transformResponse: toUser,
      providesTags: ['CurrentUser'],
    }),
    login: build.mutation<User, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: toUser,
      // Put the signed-in user straight into the current-user cache instead of refetching it.
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        // A failed request is handled by whoever called it; only a success updates the cache.
        const result = await queryFulfilled.catch(() => null);
        if (result) dispatch(authApi.util.upsertQueryData('getCurrentUser', undefined, result.data));
      },
    }),
    /** Creates a `user` account and signs it in (decision 0083). */
    register: build.mutation<User, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: toUser,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        // A failed request is handled by whoever called it; only a success updates the cache.
        const result = await queryFulfilled.catch(() => null);
        if (result) dispatch(authApi.util.upsertQueryData('getCurrentUser', undefined, result.data));
      },
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      // Drop every cached response so nothing from the signed-out session lingers.
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        if (await queryFulfilled.then(() => true, () => false)) dispatch(baseApi.util.resetApiState());
      },
    }),
  }),
});

export const { useGetCurrentUserQuery, useLoginMutation, useLogoutMutation, useRegisterMutation } = authApi;
