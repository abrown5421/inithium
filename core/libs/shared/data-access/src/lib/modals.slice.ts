import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Which modal is open, by id (decision 0065). One at a time: opening another replaces it. */
export interface ModalsState {
  openModalId: string | null;
}

const initialState: ModalsState = { openModalId: null };

export const modalsSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    /** Opens the modal with this id, closing any other. */
    openModal(state, action: PayloadAction<string>) {
      state.openModalId = action.payload;
    },
    /** Closes the modal with this id if it's the open one, or whichever is open when no id is given. */
    closeModal(state, action: PayloadAction<string | undefined>) {
      if (action.payload === undefined || state.openModalId === action.payload) state.openModalId = null;
    },
  },
});

export const { openModal, closeModal } = modalsSlice.actions;

export const selectOpenModalId = (state: { modals: ModalsState }) => state.modals.openModalId;
