import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { authApi } from '../services/authApi';
import { usersApi } from '../services/usersApi';
// ── Add new collection API slices here as they are generated ─────────────────
// import { productsApi } from '../services/productsApi';
// import { ordersApi }   from '../services/ordersApi';
// ────────────────────────────────────────────────────────────────────────────
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    // Infrastructure APIs
    [api.reducerPath]:     api.reducer,
    [authApi.reducerPath]: authApi.reducer,
    // CRUD collection APIs
    [usersApi.reducerPath]: usersApi.reducer,
    // [productsApi.reducerPath]: productsApi.reducer,
    // [ordersApi.reducerPath]:   ordersApi.reducer,
    // App state slices
    auth: authReducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      api.middleware,
      authApi.middleware,
      usersApi.middleware,
      // productsApi.middleware,
      // ordersApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
