import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { authApi } from '../services/authApi';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(api.middleware, authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
