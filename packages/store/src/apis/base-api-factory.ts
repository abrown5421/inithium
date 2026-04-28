import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { 
  PaginatedResult, 
  PaginationQuery, 
  ApiResponse,
  BulkUpdateBody 
} from '@inithium/types';
import type { RootState } from '../store.js';

export const createBaseApi = <T extends { _id: string }>(
  reducerPath: string,
  entityName: string,
  baseUrlPath: string
) => {
  return createApi({
    reducerPath,
    baseQuery: fetchBaseQuery({
      baseUrl: `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}${baseUrlPath}`,
      credentials: 'include',
      prepareHeaders(headers, { getState }) {
        const token = (getState() as RootState).auth.accessToken;
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return headers;
      },
    }),
    tagTypes: [entityName],
    endpoints: (builder) => ({
      createOne: builder.mutation<T, Partial<T>>({
        query: (body) => ({ url: '/', method: 'POST', body }),
        transformResponse: (raw: ApiResponse<T>) => raw.data!,
        invalidatesTags: [{ type: entityName, id: 'LIST' }],
      }),

      createMany: builder.mutation<T[], Partial<T>[]>({
        query: (items) => ({ url: '/bulk', method: 'POST', body: { items } }),
        transformResponse: (raw: ApiResponse<T[]>) => raw.data!,
        invalidatesTags: [{ type: entityName, id: 'LIST' }],
      }),

      readOne: builder.query<T, string>({
        query: (id) => `/${id}`,
        transformResponse: (raw: any) => {
            console.log("RAW readOne response:", raw);
            return raw.data!;
        },
        providesTags: (_res, _err, id) => [{ type: entityName, id }],
      }),

      readMany: builder.query<PaginatedResult<T>, { filter?: any; pagination?: PaginationQuery }>({
        query: ({ filter, pagination }) => ({
          url: '/',
          params: { ...filter, ...pagination },
        }),
        transformResponse: (raw: ApiResponse<PaginatedResult<T>>) => raw.data!,
        providesTags: (result) => 
          result 
            ? [...result.items.map(i => ({ type: entityName, id: i._id })), { type: entityName, id: 'LIST' }]
            : [{ type: entityName, id: 'LIST' }],
      }),

      updateOne: builder.mutation<T, { id: string; patch: any }>({
        query: ({ id, patch }) => ({ url: `/${id}`, method: 'PATCH', body: patch }),
        transformResponse: (raw: ApiResponse<T>) => raw.data!,
        invalidatesTags: (_res, _err, { id }) => [{ type: entityName, id }],
      }),

      updateMany: builder.mutation<T[], BulkUpdateBody<T>[]>({
        query: (items) => ({ url: '/bulk', method: 'PATCH', body: { items } }),
        transformResponse: (raw: ApiResponse<T[]>) => raw.data!,
        invalidatesTags: [{ type: entityName, id: 'LIST' }],
      }),

      deleteOne: builder.mutation<{ id: string; deleted: boolean }, string>({
        query: (id) => ({ url: `/${id}`, method: 'DELETE' }),
        transformResponse: (raw: ApiResponse<{ id: string; deleted: boolean }>) => raw.data!,
        invalidatesTags: (_res, _err, id) => [{ type: entityName, id }, { type: entityName, id: 'LIST' }],
      }),

      deleteMany: builder.mutation<{ deletedCount: number }, string[]>({
        query: (ids) => ({ url: '/bulk', method: 'DELETE', body: { ids } }),
        transformResponse: (raw: ApiResponse<{ deletedCount: number }>) => raw.data!,
        invalidatesTags: [{ type: entityName, id: 'LIST' }],
      }),
    }),
  });
};