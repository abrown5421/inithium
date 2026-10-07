import { authResponseSchema, type LoginRequest, type User } from '@inithium/shared-contracts';
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
        const { data } = await queryFulfilled;
        dispatch(authApi.util.upsertQueryData('getCurrentUser', undefined, data));
      },
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      // Drop every cached response so nothing from the signed-out session lingers.
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(baseApi.util.resetApiState());
      },
    }),
  }),
});

export const { useGetCurrentUserQuery, useLoginMutation, useLogoutMutation } = authApi;
