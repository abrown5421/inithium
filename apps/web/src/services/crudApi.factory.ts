/**
 * createCrudApi
 *
 * A factory that produces a fully-typed RTK Query `createApi` slice for any
 * backend collection that uses the BaseService / createCrudRouter pattern.
 *
 * It wires the five standard REST operations:
 *   getAll    → GET  /api/{collection}
 *   getById   → GET  /api/{collection}/:id
 *   create    → POST /api/{collection}
 *   update    → PUT  /api/{collection}/:id
 *   remove    → DELETE /api/{collection}/:id
 *
 * Collection-specific extra endpoints can be injected via the `extraEndpoints`
 * callback, which receives the same `builder` object RTK Query uses natively.
 *
 * Usage (users example):
 *
 *   const usersApi = createCrudApi<UserResponse, CreateUserDTO, UpdateUserDTO>({
 *     reducerPath: 'usersApi',
 *     collectionPath: '/api/users',
 *     tagType: 'User',
 *     extraEndpoints: (builder) => ({
 *       searchUsers: builder.query<UserResponse[], string>({
 *         query: (q) => `/api/users/search?q=${encodeURIComponent(q)}`,
 *       }),
 *       loginUser: builder.mutation<UserResponse, { email: string; password: string }>({
 *         query: (body) => ({ url: '/api/users/login', method: 'POST', body }),
 *       }),
 *     }),
 *   });
 */

import {
  createApi,
  fetchBaseQuery,
  type EndpointBuilder,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/store';

// ─── Shared base query (auth-aware) ─────────────────────────────────────────

export const authAwareBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

// ─── Factory types ───────────────────────────────────────────────────────────

export interface CrudApiOptions<
  TItem,
  TCreate = Partial<TItem>,
  TUpdate = Partial<TItem>,
  TExtra extends Record<string, any> = Record<string, never>,
> {
  /** RTK Query reducer path — must be unique across the store. */
  reducerPath: string;
  /** Base API path for this collection, e.g. "/api/users". */
  collectionPath: string;
  /** Tag type used for cache invalidation. */
  tagType: string;
  /**
   * Optional callback to inject extra collection-specific endpoints.
   * Receives the same `builder` object as RTK Query's `endpoints` callback.
   */
  extraEndpoints?: (
    builder: EndpointBuilder<typeof authAwareBaseQuery, string, string>,
  ) => TExtra;
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createCrudApi<
  TItem extends { _id: string },
  TCreate = Partial<TItem>,
  TUpdate = Partial<TItem>,
  TExtra extends Record<string, any> = Record<string, never>,
>({
  reducerPath,
  collectionPath,
  tagType,
  extraEndpoints,
}: CrudApiOptions<TItem, TCreate, TUpdate, TExtra>) {
  return createApi({
    reducerPath,
    baseQuery: authAwareBaseQuery,
    tagTypes: [tagType],

    endpoints: (builder) => ({
      // ── GET /api/{collection} ─────────────────────────────────────────────
      getAll: builder.query<TItem[], void>({
        query: () => collectionPath,
        providesTags: (result) =>
          result
            ? [
                ...result.map(({ _id }) => ({ type: tagType, id: _id } as const)),
                { type: tagType, id: 'LIST' },
              ]
            : [{ type: tagType, id: 'LIST' }],
      }),

      // ── GET /api/{collection}/:id ─────────────────────────────────────────
      getById: builder.query<TItem, string>({
        query: (id) => `${collectionPath}/${id}`,
        providesTags: (_result, _err, id) => [{ type: tagType, id }],
      }),

      // ── POST /api/{collection} ────────────────────────────────────────────
      create: builder.mutation<TItem, TCreate>({
        query: (body) => ({ url: collectionPath, method: 'POST', body }),
        invalidatesTags: [{ type: tagType, id: 'LIST' }],
      }),

      // ── PUT /api/{collection}/:id ─────────────────────────────────────────
      update: builder.mutation<TItem, { id: string; data: TUpdate }>({
        query: ({ id, data }) => ({
          url: `${collectionPath}/${id}`,
          method: 'PUT',
          body: data,
        }),
        invalidatesTags: (_result, _err, { id }) => [
          { type: tagType, id },
          { type: tagType, id: 'LIST' },
        ],
      }),

      // ── DELETE /api/{collection}/:id ──────────────────────────────────────
      remove: builder.mutation<void, string>({
        query: (id) => ({ url: `${collectionPath}/${id}`, method: 'DELETE' }),
        invalidatesTags: (_result, _err, id) => [
          { type: tagType, id },
          { type: tagType, id: 'LIST' },
        ],
      }),

      // ── Collection-specific extras (injected by caller) ───────────────────
      ...(extraEndpoints ? extraEndpoints(builder) : {}),
    }),
  });
}
