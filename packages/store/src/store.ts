import { configureStore } from '@reduxjs/toolkit';
import type { TransitionState } from './slices/transition.slice.js';
import transitionReducer from './slices/transition.slice.js';
import authReducer from './slices/auth.slice.js';
import { authApi } from './apis/auth-api.js';
import { usersApi } from './apis/users-api.js';

export type { AuthState } from './slices/auth.slice.js';

export interface RootState {
  transition: TransitionState;
  auth: import('./slices/auth.slice.js').AuthState;
  [authApi.reducerPath]: ReturnType<typeof authApi.reducer>;
  [usersApi.reducerPath]: ReturnType<typeof usersApi.reducer>;
}

export const store = configureStore({
  reducer: {
    transition: transitionReducer,
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(usersApi.middleware),
});

export type AppDispatch = typeof store.dispatch;