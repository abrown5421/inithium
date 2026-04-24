import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi, AuthTokens } from '../apis/auth-api.js';

export interface AuthState {
  accessToken: string | null;
  userId: string | null;
}

const decodeUserId = (token: string): string | null => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.sub ?? null;
  } catch {
    return null;
  }
};

const applyTokens = (state: AuthState, payload: AuthTokens) => {
  state.accessToken = payload.accessToken;
  state.userId = decodeUserId(payload.accessToken);
};

const initialState: AuthState = {
  accessToken: null,
  userId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<AuthTokens>) {
      applyTokens(state, action.payload);
    },
    clearTokens(state) {
      state.accessToken = null;
      state.userId = null;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload }) => applyTokens(state, payload)
    );

    builder.addMatcher(
      authApi.endpoints.register.matchFulfilled,
      (state, { payload }) => applyTokens(state, payload)
    );

    builder.addMatcher(
      authApi.endpoints.refresh.matchFulfilled,
      (state, { payload }) => applyTokens(state, payload)
    );

    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.accessToken = null;
      state.userId = null;
    });
  },
});

export const { setTokens, clearTokens } = authSlice.actions;
export default authSlice.reducer;