import { configureStore, combineReducers } from '@reduxjs/toolkit';
import transitionReducer from './slices/transition.slice.js';
import authReducer from './slices/auth.slice.js';
import { authApi } from './apis/auth-api.js';
import { usersApi } from './apis/users-api.js';

const rootReducer = combineReducers({
  transition: transitionReducer,
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (gDM) =>
    gDM().concat(authApi.middleware, usersApi.middleware),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export type { AuthState } from './slices/auth.slice.js';
export type { TransitionState } from './slices/transition.slice.js';