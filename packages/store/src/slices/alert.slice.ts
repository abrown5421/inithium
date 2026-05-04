import { AlertProps } from '@inithium/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: AlertProps = {
  open: false,
  severity: 'primary',
  message: '',
  position: 'bottom-right',
  animationObject: {
    entry: 'fadeInRight',
    exit: 'fadeOutRight'
  },
};

export const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    showAlert: (state, action: PayloadAction<Omit<AlertProps, 'open'>>) => {
      state.open = true;
      state.severity = action.payload.severity;
      state.message = action.payload.message;
      state.position = action.payload.position;
      state.animationObject = action.payload.animationObject;
    },
    closeAlert: (state) => {    
      state.open = false;
    },
  },
});

export const { showAlert, closeAlert } = alertSlice.actions;
export default alertSlice.reducer;