import { assetUsageSchema, fontFamilyRecordSchema, type AssetUsage, type FontFamilyCreate, type FontFamilyRecord, type FontFamilyUpdate } from '@inithium/shared-contracts';
import { baseApi } from './base.api';

// A family's files are left out of the Media screen's "All files", so changing families refreshes the asset list too,
// and the site bundle carries every family, so it's refreshed for the CMS's own fonts.
const fontsApi = baseApi.enhanceEndpoints({ addTagTypes: ['FontFamily', 'Asset', 'Site'] }).injectEndpoints({
  endpoints: (build) => ({
    /** The font library, by name (decision 0111; needs assets.upload). */
    getFontFamilies: build.query<FontFamilyRecord[], void>({
      query: () => '/fonts',
      transformResponse: (response: unknown) => fontFamilyRecordSchema.array().parse(response),
      providesTags: ['FontFamily'],
    }),
    /** Where a family is used: the theme (blocking) and pages using it (a warning). */
    getFontFamilyUsage: build.query<AssetUsage, string>({
      query: (id) => `/fonts/${encodeURIComponent(id)}/usage`,
      transformResponse: (response: unknown) => assetUsageSchema.parse(response),
      providesTags: ['FontFamily'],
    }),
    /** Adds a family from uploaded font files. */
    createFontFamily: build.mutation<FontFamilyRecord, FontFamilyCreate>({
      query: (body) => ({ url: '/fonts', method: 'POST', body }),
      transformResponse: (response: unknown) => fontFamilyRecordSchema.parse(response),
      invalidatesTags: ['FontFamily', { type: 'Asset', id: 'LIST' }, 'Site'],
    }),
    /** Changes a family's name, fallback or files. */
    updateFontFamily: build.mutation<FontFamilyRecord, { id: string; update: FontFamilyUpdate }>({
      query: ({ id, update }) => ({ url: `/fonts/${encodeURIComponent(id)}`, method: 'PATCH', body: update }),
      transformResponse: (response: unknown) => fontFamilyRecordSchema.parse(response),
      invalidatesTags: ['FontFamily', { type: 'Asset', id: 'LIST' }, 'Site'],
    }),
    /** Removes a family; its files stay in Media. */
    deleteFontFamily: build.mutation<void, string>({
      query: (id) => ({ url: `/fonts/${encodeURIComponent(id)}`, method: 'DELETE' }),
      invalidatesTags: ['FontFamily', { type: 'Asset', id: 'LIST' }, 'Site'],
    }),
  }),
});

export const { useGetFontFamiliesQuery, useGetFontFamilyUsageQuery, useCreateFontFamilyMutation, useUpdateFontFamilyMutation, useDeleteFontFamilyMutation } = fontsApi;
