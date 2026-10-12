import { siteSettingsSchema, type SiteSettings, type SiteSettingsInput } from '@inithium/shared-contracts';
import { baseApi } from './base.api';

const settingsApi = baseApi.enhanceEndpoints({ addTagTypes: ['Settings', 'Site'] }).injectEndpoints({
  endpoints: (build) => ({
    /** The site's settings, for the CMS (needs settings.edit; decision 0082). */
    getSettings: build.query<SiteSettings, void>({
      query: () => '/settings',
      transformResponse: (response: unknown) => siteSettingsSchema.parse(response),
      providesTags: ['Settings'],
    }),
    /** Replaces the settings; fields left out are cleared (a missing theme means the default). */
    updateSettings: build.mutation<SiteSettings, SiteSettingsInput>({
      query: (body) => ({ url: '/settings', method: 'PUT', body }),
      transformResponse: (response: unknown) => siteSettingsSchema.parse(response),
      // The site bundle carries the settings too, so the CMS's title and theme update straight away.
      invalidatesTags: ['Settings', 'Site'],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
