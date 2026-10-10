import { siteBundleSchema, type SiteBundle } from '@inithium/shared-contracts';
import { baseApi } from './base.api';

export const siteApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** What `web` loads once at startup: site settings and every published page (decision 0079). */
    getSite: build.query<SiteBundle, void>({
      query: () => '/site',
      transformResponse: (response: unknown) => siteBundleSchema.parse(response),
    }),
  }),
});

export const { useGetSiteQuery } = siteApi;
