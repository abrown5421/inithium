import { configureStore } from '@reduxjs/toolkit';
import { alertsSlice } from './alerts.slice';
import { baseApi } from './base.api';
import { modalsSlice } from './modals.slice';

/** Creates the Redux store a frontend app provides at its root. */
export function createAppStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [modalsSlice.name]: modalsSlice.reducer,
      [alertsSlice.name]: alertsSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
