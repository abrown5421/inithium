import { siteBundleSchema, type SiteBundle } from '@inithium/shared-contracts';
import { baseApi } from './base.api';

export const siteApi = baseApi.enhanceEndpoints({ addTagTypes: ['Site'] }).injectEndpoints({
  endpoints: (build) => ({
    /** What `web` loads once at startup: site settings and every published page (decision 0079). */
    getSite: build.query<SiteBundle, void>({
      query: () => '/site',
      transformResponse: (response: unknown) => siteBundleSchema.parse(response),
      // Saving settings in the CMS refreshes it there; `web` visitors see changes on their next full load.
      providesTags: ['Site'],
    }),
  }),
});

export const { useGetSiteQuery } = siteApi;
