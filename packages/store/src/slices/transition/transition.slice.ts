import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AnimationPhase } from '@inithium/types';

export interface TransitionState {
  activePage: string | null;
  pendingPage: string | null;
  phase: AnimationPhase;
}

const initialState: TransitionState = {
  activePage: typeof window !== 'undefined' ? window.location.pathname : null,
  pendingPage: null,
  phase: 'entered',
};

export const commitTransition = createAsyncThunk(
  'transition/commit',
  async (_, { getState, dispatch }) => {
    const state = (getState() as { transition: TransitionState }).transition;
    if (state.pendingPage !== null) {
      dispatch(transitionSlice.actions._promote());
    }
  },
);

export const transitionSlice = createSlice({
  name: 'transition',
  initialState,
  reducers: {
    requestTransition(state, action: PayloadAction<string>) {
      if (state.activePage === action.payload) return;
      state.pendingPage = action.payload;
      state.phase = 'exiting';
    },
    _promote(state) {
      state.activePage = state.pendingPage;
      state.pendingPage = null;
      state.phase = 'entering';
    },
    enterComplete(state) {
      state.phase = 'entered';
    },
    initialize(state, action: PayloadAction<string>) {
      state.activePage = action.payload;
      state.phase = 'entered';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(commitTransition.fulfilled, () => {});
  },
});

export const {
  requestTransition,
  enterComplete,
  initialize,
} = transitionSlice.actions;

export default transitionSlice.reducer;