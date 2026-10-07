import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

// Relative URL: the api is always on the same origin (proxied by Vite in dev).
const rawBaseQuery = fetchBaseQuery({ baseUrl: '/api', credentials: 'same-origin' });

// Requests that must never trigger a token refresh.
const NO_REFRESH = ['/auth/login', '/auth/refresh', '/auth/logout'];

// Shared so that several requests failing at once trigger a single refresh.
let refreshing: Promise<boolean> | null = null;

/** On a 401, refreshes the session once and retries the request. */
const baseQueryWithRefresh: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === 'string' ? args : args.url;

  if (result.error?.status === 401 && !NO_REFRESH.includes(url)) {
    refreshing ??= Promise.resolve(rawBaseQuery({ url: '/auth/refresh', method: 'POST' }, api, extraOptions))
      .then((refresh) => !refresh.error)
      .finally(() => {
        refreshing = null;
      });
    if (await refreshing) result = await rawBaseQuery(args, api, extraOptions);
  }

  return result;
};

/** The API's `{ message }` for a failed request, or the fallback when there isn't one. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data: unknown }).data;
    if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') return data.message;
  }
  return fallback;
}

/** The single RTK Query API. Features add endpoints with baseApi.injectEndpoints(). */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['CurrentUser'],
  endpoints: () => ({}),
});
