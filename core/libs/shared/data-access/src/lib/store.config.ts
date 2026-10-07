import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './base.api';

/** Creates the Redux store a frontend app provides at its root. */
export function createAppStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
