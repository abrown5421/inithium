---
title: Calling the API
description: How web and cms talk to the api with RTK Query, including the base API, adding endpoints, automatic session refresh and errors.
scope: core
tags: [api, frontend, rtk-query, redux]
order: 9
decisions: ["0006", "0008", "0020"]
---

# Calling the API

`web` and `cms` reach the API through **RTK Query**, set up once in `@inithium/shared-data-access`. Requests use relative `/api/...` URLs: the same origin in production, and proxied to `localhost:3000` by Vite in development ([0006](../decisions/0006-serve-each-client-from-one-origin.md)).

## The store

Each frontend creates the Redux store and provides it at its root:

```tsx
import { Provider } from 'react-redux';
import { createAppStore } from '@inithium/shared-data-access';

const store = createAppStore();

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
```

## The base API

`baseApi` is the single RTK Query API. Features add their endpoints to it rather than creating their own:

```ts
import { baseApi } from '@inithium/shared-data-access';
import { settingsSchema, type Settings } from '@inithium/shared-contracts';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSettings: build.query<Settings, void>({
      query: () => '/settings',
      transformResponse: (response: unknown) => settingsSchema.parse(response),
    }),
    saveSettings: build.mutation<Settings, Settings>({
      query: (body) => ({ url: '/settings', method: 'PUT', body }),
    }),
  }),
});

export const { useGetSettingsQuery, useSaveSettingsMutation } = settingsApi;
```

(`settings` here is illustrative: no settings endpoint exists yet.)

- **Validate responses** with the contract's Zod schema in `transformResponse`, the same schema the API validates with ([0008](../decisions/0008-use-zod-as-the-contract-source-of-truth.md)).
- **Tag types** for cache invalidation are declared on `baseApi`. Today there's one, `CurrentUser`.

## Sessions refresh themselves

Sign-in uses httpOnly cookies ([0020](../decisions/0020-authentication.md)), so frontend code never handles tokens. When any request gets a `401`, the base query calls `POST /api/auth/refresh` once and retries the request. Several requests failing at the same time share a single refresh. Login, refresh and logout themselves never trigger a refresh.

The auth endpoints are ready to use:

| Hook | Does |
| --- | --- |
| `useGetCurrentUserQuery()` | The signed-in `User`, or an error with `status: 401` |
| `useLoginMutation()` | Signs in, and puts the user straight into the current-user cache |
| `useRegisterMutation()` | Creates a `user` account and signs it in, putting the user straight into the current-user cache |
| `useLogoutMutation()` | Signs out, and clears every cached response |
| `useGetSiteQuery()` | The site bundle `web` loads at startup: settings and published pages ([Pages](pages.md)) |

See [Authentication](authentication.md#frontend-usage).

## Errors

The API returns errors as `{ "message": "..." }`. `getApiErrorMessage(error, fallback)` extracts that message from a failed request:

```ts
try {
  await login(credentials).unwrap();
} catch (error) {
  setError(getApiErrorMessage(error, 'Something went wrong. Please try again.'));
}
```
