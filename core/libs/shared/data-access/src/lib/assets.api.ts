import {
  assetSchema,
  assetUsageSchema,
  storageInfoSchema,
  type Asset,
  type AssetKind,
  type AssetPurpose,
  type AssetUpdate,
  type AssetUsage,
  type StorageInfo,
} from '@inithium/shared-contracts';
import { baseApi } from './base.api';

/** What to upload: the file (already cropped, for images), what it's for, and the font licence for fonts. */
export type AssetUploadInput = { file: Blob; filename: string; purpose: AssetPurpose; alt?: string; fontLicence?: boolean };

/** Filters for the asset list. */
export type AssetListFilter = { purpose?: AssetPurpose; kind?: AssetKind; q?: string };

const assetsApi = baseApi.enhanceEndpoints({ addTagTypes: ['Asset', 'Storage'] }).injectEndpoints({
  endpoints: (build) => ({
    /** Where files go, the limits and how much is used (decision 0098). */
    getStorageInfo: build.query<StorageInfo, void>({
      query: () => '/assets/storage',
      transformResponse: (response: unknown) => storageInfoSchema.parse(response),
      providesTags: ['Storage'],
    }),
    /** Assets for the Media screen and pickers, newest first (needs assets.upload). */
    getAssets: build.query<Asset[], AssetListFilter | void>({
      query: (filter) => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(filter ?? {})) if (value) params.set(key, String(value));
        const search = params.toString();
        return `/assets${search ? `?${search}` : ''}`;
      },
      transformResponse: (response: unknown) => assetSchema.array().parse(response),
      providesTags: (assets) => [{ type: 'Asset' as const, id: 'LIST' }, ...(assets ?? []).map((asset) => ({ type: 'Asset' as const, id: asset.id }))],
    }),
    /** One asset's details, e.g. for the image a field has chosen. */
    getAsset: build.query<Asset, string>({
      query: (id) => `/assets/${encodeURIComponent(id)}/info`,
      transformResponse: (response: unknown) => assetSchema.parse(response),
      providesTags: (_asset, _error, id) => [{ type: 'Asset', id }],
    }),
    /** Uploads one file as multipart form data. */
    uploadAsset: build.mutation<Asset, AssetUploadInput>({
      query: ({ file, filename, purpose, alt, fontLicence }) => {
        const body = new FormData();
        body.append('file', file, filename);
        body.append('purpose', purpose);
        if (alt) body.append('alt', alt);
        if (fontLicence) body.append('fontLicence', 'true');
        return { url: '/assets', method: 'POST', body };
      },
      transformResponse: (response: unknown) => assetSchema.parse(response),
      invalidatesTags: [{ type: 'Asset', id: 'LIST' }, 'Storage'],
    }),
    /** Renames an asset or changes its default alt text. */
    updateAsset: build.mutation<Asset, { id: string; update: AssetUpdate }>({
      query: ({ id, update }) => ({ url: `/assets/${encodeURIComponent(id)}`, method: 'PATCH', body: update }),
      transformResponse: (response: unknown) => assetSchema.parse(response),
      invalidatesTags: (_asset, _error, { id }) => [{ type: 'Asset', id }],
    }),
    /** Deletes an asset (needs assets.delete); refused while the site logo uses it. */
    deleteAsset: build.mutation<void, string>({
      query: (id) => ({ url: `/assets/${encodeURIComponent(id)}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Asset', id: 'LIST' }, 'Storage'],
    }),
    /** Where an asset is used. */
    getAssetUsage: build.query<AssetUsage, string>({
      query: (id) => `/assets/${encodeURIComponent(id)}/usage`,
      transformResponse: (response: unknown) => assetUsageSchema.parse(response),
      providesTags: (_usage, _error, id) => [{ type: 'Asset', id }],
    }),
  }),
});

export const {
  useGetStorageInfoQuery,
  useGetAssetsQuery,
  useGetAssetQuery,
  useUploadAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useGetAssetUsageQuery,
} = assetsApi;
