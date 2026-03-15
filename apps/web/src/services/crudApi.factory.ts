import {
  createApi,
  fetchBaseQuery,
  type EndpointBuilder,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/store';

export const authAwareBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

export interface CrudApiOptions<
  TItem,
  TCreate = Partial<TItem>,
  TUpdate = Partial<TItem>,
  TExtra extends Record<string, any> = Record<string, never>,
> {
  reducerPath: string;
  collectionPath: string;
  tagType: string;
  extraEndpoints?: (
    builder: EndpointBuilder<typeof authAwareBaseQuery, string, string>,
  ) => TExtra;
}

export function createCrudApi<
  TItem extends { _id: string },
  TCreate = Partial<TItem>,
  TUpdate = Partial<TItem>,
  TExtra extends Record<string, any> = Record<string, never>,
>({ reducerPath, collectionPath, tagType, extraEndpoints }: CrudApiOptions<TItem, TCreate, TUpdate, TExtra>) {
  return createApi({
    reducerPath,
    baseQuery: authAwareBaseQuery,
    tagTypes: [tagType],
    endpoints: (builder) => ({
      getAll: builder.query<TItem[], void>({
        query: () => collectionPath,
        providesTags: (result) =>
          result
            ? [...result.map(({ _id }) => ({ type: tagType, id: _id } as const)), { type: tagType, id: 'LIST' }]
            : [{ type: tagType, id: 'LIST' }],
      }),
      getById: builder.query<TItem, string>({
        query: (id) => `${collectionPath}/${id}`,
        providesTags: (_result, _err, id) => [{ type: tagType, id }],
      }),
      create: builder.mutation<TItem, TCreate>({
        query: (body) => ({ url: collectionPath, method: 'POST', body }),
        invalidatesTags: [{ type: tagType, id: 'LIST' }],
      }),
      update: builder.mutation<TItem, { id: string; data: TUpdate }>({
        query: ({ id, data }) => ({ url: `${collectionPath}/${id}`, method: 'PUT', body: data }),
        invalidatesTags: (_result, _err, { id }) => [{ type: tagType, id }, { type: tagType, id: 'LIST' }],
      }),
      remove: builder.mutation<void, string>({
        query: (id) => ({ url: `${collectionPath}/${id}`, method: 'DELETE' }),
        invalidatesTags: (_result, _err, id) => [{ type: tagType, id }, { type: tagType, id: 'LIST' }],
      }),
      ...(extraEndpoints ? extraEndpoints(builder) : {}),
    }),
  });
}
