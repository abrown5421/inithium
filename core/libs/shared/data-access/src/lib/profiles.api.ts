import {
  publicProfileSchema,
  userPreferencesSchema,
  type PublicProfile,
  type UpdatePreferencesRequest,
  type UpdateProfileRequest,
  type User,
  type UserPreferences,
} from '@inithium/shared-contracts';
import { authApi } from './auth.api';
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
    /**
     * Changes the signed-in user's private preferences (decision 0119). The current user updates at once, so the colour
     * scheme switches before the request returns, and goes back if it fails.
     */
    updateMyPreferences: build.mutation<UserPreferences, UpdatePreferencesRequest>({
      query: (body) => ({ url: '/profiles/me/preferences', method: 'PATCH', body }),
      transformResponse: (response: unknown) => userPreferencesSchema.parse(response),
      async onQueryStarted(changes, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          authApi.util.updateQueryData('getCurrentUser', undefined, (user: User) => {
            user.preferences = { ...user.preferences, ...changes };
          }),
        );
        const result = await queryFulfilled.catch(() => null);
        if (!result) patch.undo();
      },
    }),
  }),
});

export const { useGetProfileQuery, useUpdateMyPreferencesMutation, useUpdateMyProfileMutation } = profilesApi;
