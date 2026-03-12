import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { HealthResponse } from '@inithium/shared';
import { HEALTH_ROUTE } from '@inithium/shared';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  }),
  endpoints: (builder) => ({
    getHealth: builder.query<HealthResponse, void>({
      query: () => HEALTH_ROUTE,
    }),
  }),
});

export const { useGetHealthQuery } = api;
