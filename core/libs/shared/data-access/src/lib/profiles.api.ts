import { publicProfileSchema, type PublicProfile, type UpdateProfileRequest } from '@inithium/shared-contracts';
import { baseApi } from './base.api';

const profilesApi = baseApi.enhanceEndpoints({ addTagTypes: ['Profile'] }).injectEndpoints({
  endpoints: (build) => ({
    /** Anyone's profile (decision 0090); the email is included only for its owner. */
    getProfile: build.query<PublicProfile, string>({
      query: (id) => `/profiles/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => publicProfileSchema.parse(response),
      providesTags: (_result, _error, id) => [{ type: 'Profile', id }],
    }),
    /** Changes the signed-in user's profile. Fields left out stay; an empty last name or bio removes it. */
    updateMyProfile: build.mutation<PublicProfile, UpdateProfileRequest>({
      query: (body) => ({ url: '/profiles/me', method: 'PATCH', body }),
      transformResponse: (response: unknown) => publicProfileSchema.parse(response),
      // The saved profile goes straight into its cache entry; the current user (Navbar name and avatar) refetches.
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const result = await queryFulfilled.catch(() => null);
        if (result) dispatch(profilesApi.util.upsertQueryData('getProfile', result.data.id, result.data));
      },
      invalidatesTags: (result) => (result ? ['CurrentUser'] : []),
    }),
  }),
});

export const { useGetProfileQuery, useUpdateMyProfileMutation } = profilesApi;
