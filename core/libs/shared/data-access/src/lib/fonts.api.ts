import { fontFamilyRecordSchema, type FontFamilyCreate, type FontFamilyRecord, type FontFamilyUpdate } from '@inithium/shared-contracts';
import { baseApi } from './base.api';

// A family's files are left out of the Media screen's "All files", so changing families refreshes the asset list too.
const fontsApi = baseApi.enhanceEndpoints({ addTagTypes: ['FontFamily', 'Asset'] }).injectEndpoints({
  endpoints: (build) => ({
    /** The font library, by name (decision 0111; needs assets.upload). */
    getFontFamilies: build.query<FontFamilyRecord[], void>({
      query: () => '/fonts',
      transformResponse: (response: unknown) => fontFamilyRecordSchema.array().parse(response),
      providesTags: ['FontFamily'],
    }),
    /** Adds a family from uploaded font files. */
    createFontFamily: build.mutation<FontFamilyRecord, FontFamilyCreate>({
      query: (body) => ({ url: '/fonts', method: 'POST', body }),
      transformResponse: (response: unknown) => fontFamilyRecordSchema.parse(response),
      invalidatesTags: ['FontFamily', { type: 'Asset', id: 'LIST' }],
    }),
    /** Changes a family's name, fallback or files. */
    updateFontFamily: build.mutation<FontFamilyRecord, { id: string; update: FontFamilyUpdate }>({
      query: ({ id, update }) => ({ url: `/fonts/${encodeURIComponent(id)}`, method: 'PATCH', body: update }),
      transformResponse: (response: unknown) => fontFamilyRecordSchema.parse(response),
      invalidatesTags: ['FontFamily', { type: 'Asset', id: 'LIST' }],
    }),
    /** Removes a family; its files stay in Media. */
    deleteFontFamily: build.mutation<void, string>({
      query: (id) => ({ url: `/fonts/${encodeURIComponent(id)}`, method: 'DELETE' }),
      invalidatesTags: ['FontFamily', { type: 'Asset', id: 'LIST' }],
    }),
  }),
});

export const { useGetFontFamiliesQuery, useCreateFontFamilyMutation, useUpdateFontFamilyMutation, useDeleteFontFamilyMutation } = fontsApi;
