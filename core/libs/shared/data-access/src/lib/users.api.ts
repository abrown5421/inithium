import {
  deleteUsersResponseSchema,
  managedUserSchema,
  userListResponseSchema,
  userManagementInfoSchema,
  type CreateUserRequest,
  type DeleteUsersResponse,
  type ManagedUser,
  type UpdateUserRequest,
  type UserListQuery,
  type UserListResponse,
  type UserManagementInfo,
} from '@inithium/shared-contracts';
import { baseApi } from './base.api';

const usersApi = baseApi.enhanceEndpoints({ addTagTypes: ['ManagedUser'] }).injectEndpoints({
  endpoints: (build) => ({
    /** Whether accounts can be created and passwords reset here (USER_TEMP_PASSWORD is set). Needs users.view. */
    getUserManagementInfo: build.query<UserManagementInfo, void>({
      query: () => '/users/info',
      transformResponse: (response: unknown) => userManagementInfoSchema.parse(response),
    }),
    /** A page of accounts for the CMS's Users screen (decision 0100). Needs users.view. */
    getUsers: build.query<UserListResponse, UserListQuery>({
      query: (query) => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(query)) if (value !== undefined && value !== '') params.set(key, String(value));
        return `/users?${params.toString()}`;
      },
      transformResponse: (response: unknown) => userListResponseSchema.parse(response),
      providesTags: ['ManagedUser'],
    }),
    /** Creates an account with the site's temporary password. Needs users.create. */
    createUser: build.mutation<ManagedUser, CreateUserRequest>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      transformResponse: (response: unknown) => managedUserSchema.parse(response),
      invalidatesTags: (result) => (result ? ['ManagedUser'] : []),
    }),
    /** Changes an account's names or role. Needs users.edit. */
    updateUser: build.mutation<ManagedUser, { id: string; changes: UpdateUserRequest }>({
      query: ({ id, changes }) => ({ url: `/users/${encodeURIComponent(id)}`, method: 'PATCH', body: changes }),
      transformResponse: (response: unknown) => managedUserSchema.parse(response),
      invalidatesTags: (result) => (result ? ['ManagedUser'] : []),
    }),
    /** Puts an account back on the temporary password. Needs users.edit. */
    resetUserPassword: build.mutation<ManagedUser, string>({
      query: (id) => ({ url: `/users/${encodeURIComponent(id)}/reset-password`, method: 'POST' }),
      transformResponse: (response: unknown) => managedUserSchema.parse(response),
      invalidatesTags: (result) => (result ? ['ManagedUser'] : []),
    }),
    /** Deletes accounts; answers with those deleted and those that weren't. Needs users.delete. */
    deleteUsers: build.mutation<DeleteUsersResponse, string[]>({
      query: (ids) => ({ url: '/users/delete', method: 'POST', body: { ids } }),
      transformResponse: (response: unknown) => deleteUsersResponseSchema.parse(response),
      invalidatesTags: ['ManagedUser'],
    }),
  }),
});

export const {
  useGetUserManagementInfoQuery,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useResetUserPasswordMutation,
  useDeleteUsersMutation,
} = usersApi;
