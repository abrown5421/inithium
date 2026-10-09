import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import type { AlertContent } from '@inithium/shared-contracts';

/** An alert in the queue (decision 0066). `open` turns false when it's dismissed, while it animates out. */
export interface AlertItem extends AlertContent {
  id: string;
  open: boolean;
}

export interface AlertsState {
  items: AlertItem[];
}

/** At most this many alerts are shown; showing another dismisses the oldest. */
export const MAX_ALERTS = 5;

const initialState: AlertsState = { items: [] };

export const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    /** Shows an alert. The action's payload carries its new id. */
    showAlert: {
      reducer(state, action: PayloadAction<AlertItem>) {
        state.items.push(action.payload);
        const open = state.items.filter((item) => item.open);
        open.slice(0, Math.max(0, open.length - MAX_ALERTS)).forEach((item) => (item.open = false));
      },
      prepare(content: AlertContent) {
        return { payload: { ...content, id: nanoid(), open: true } };
      },
    },
    /** Starts closing an alert; its stack removes it once it has animated out. */
    dismissAlert(state, action: PayloadAction<string>) {
      const item = state.items.find((alert) => alert.id === action.payload);
      if (item) item.open = false;
    },
    /** Removes an alert straight away. AlertStack calls this after the exit animation. */
    removeAlert(state, action: PayloadAction<string>) {
      state.items = state.items.filter((alert) => alert.id !== action.payload);
    },
  },
});

export const { showAlert, dismissAlert, removeAlert } = alertsSlice.actions;

export const selectAlerts = (state: { alerts: AlertsState }) => state.alerts.items;
