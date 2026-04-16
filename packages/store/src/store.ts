import { configureStore } from '@reduxjs/toolkit';
import transitionReducer from './slices/transition.slice.js';

export const store = configureStore({
  reducer: {
    transition: transitionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;